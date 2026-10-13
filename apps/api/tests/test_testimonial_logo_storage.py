"""Testimonial logo HTTP, storage, compensation, audit and auth contracts."""

import asyncio
from datetime import datetime, timezone
from hashlib import sha256
from io import BytesIO
from unittest.mock import AsyncMock
from uuid import UUID

import httpx
import pytest
from fastapi import UploadFile
from fastapi.testclient import TestClient
from starlette.datastructures import Headers
from starlette.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.testimonials import get_testimonial_service
from app.auth.supabase import InvalidAccessTokenError
from app.core.config import Environment, Settings
from app.db.models.testimonial import Testimonial as QuoteModel
from app.main import create_app
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.testimonials import TestimonialRepository as QuoteRepository
from app.schemas.testimonials import TestimonialUpdateRequest as QuoteUpdate
from app.services.testimonials import TestimonialService as QuoteService
from app.storage.supabase import StorageError, SupabaseStorageGateway
from app.storage.uploads import SupabasePublicImageStorage
from tests.auth_helpers import TEST_ADMIN, authenticate_test_admin
from tests.test_auth import authenticated_api, _admin

ID = UUID('5326b73c-022f-4cc7-8291-8904d3ef01fc')
BASE = 'https://project.supabase.co/storage/v1/object/public/testimonial-logos/'
OLD = f'{BASE}{ID}/old.png'
PNG = b'\x89PNG\r\n\x1a\nlogo'
NOW = datetime(2026, 10, 13, tzinfo=timezone.utc)
PATH = f'/testimonials/{ID}/company-logo'


def quote(url=OLD):
    return QuoteModel(id=ID, quote='Excellent work.', author_name='Author',
                      author_role=None, company_name=None, company_logo_url=url,
                      display_order=0, is_active=True, created_at=NOW, updated_at=NOW)


def upload(content=PNG, name='logo.png', mime='image/png'):
    return UploadFile(file=BytesIO(content), filename=name,
                      headers=Headers({'content-type': mime}))


@pytest.fixture
def logo_api():
    session = AsyncMock(spec=AsyncSession)
    repo = AsyncMock(spec=QuoteRepository)
    repo.get_by_id.return_value = quote()
    audits = AsyncMock(spec=AuditLogRepository)
    settings = Settings(_env_file=None, environment=Environment.TEST, debug=False,
                        supabase_url='https://project.supabase.co',
                        supabase_service_role_key='test-only-key')
    # Real URL parsing/public URL generation; provider calls remain mocked.
    gateway = SupabaseStorageGateway(settings, httpx.AsyncClient())
    gateway.upload = AsyncMock()
    gateway.delete = AsyncMock()
    storage = SupabasePublicImageStorage(gateway, bucket='testimonial-logos',
                                         max_bytes=5 * 1024 * 1024)
    service = QuoteService(session, repository=repo, audit_repository=audits,
                           image_storage=storage)
    app = create_app(Settings(_env_file=None, environment=Environment.TEST, debug=False))
    authenticate_test_admin(app)
    app.dependency_overrides[get_testimonial_service] = lambda: service
    with TestClient(app, raise_server_exceptions=False) as client:
        yield client, service, session, repo, audits, gateway
    asyncio.run(gateway._client.aclose())


@pytest.mark.parametrize('name,mime,content,extension', [
    ('untrusted.JPEG', 'image/jpeg', b'\xff\xd8\xff\xe0logo', '.jpg'),
    ('../../client.png', 'image/png', PNG, '.png'),
    ('logo.webp', 'image/webp', b'RIFF\x04\0\0\0WEBPlogo', '.webp'),
])
def test_upload_uses_validated_digest_path_and_commits_before_cleanup(logo_api, name, mime, content, extension):
    client, _, session, repo, audits, gateway = logo_api
    events = []
    gateway.upload.side_effect = lambda *args: events.append('upload')
    session.commit.side_effect = lambda: events.append('commit')
    gateway.delete.side_effect = lambda *args: events.append('delete')
    response = client.put(PATH, files={'file': (name, content, mime)})
    path = f'{ID}/{sha256(content).hexdigest()}{extension}'
    assert response.status_code == 200
    assert response.json()['company_logo_url'] == BASE + path
    gateway.upload.assert_awaited_once_with('testimonial-logos', path, content, mime)
    gateway.delete.assert_awaited_once_with('testimonial-logos', f'{ID}/old.png')
    assert events == ['upload', 'commit', 'delete']
    audit = audits.add.await_args.args[0]
    assert audit.actor_id == TEST_ADMIN.admin_id
    assert audit.actor_email == TEST_ADMIN.admin_email
    assert audit.action == 'update' and audit.resource_type == 'testimonial'
    assert audit.resource_id == ID
    assert audit.context['changed_fields'] == ['company_logo_url']
    assert audit.context['logo_operation'] == 'replace'
    repo.list_public.return_value = [repo.get_by_id.return_value]
    assert client.get('/testimonials').json()['data'][0]['company_logo_url'] == BASE + path


@pytest.mark.parametrize('name,mime,content', [
    ('logo.png', 'application/octet-stream', PNG),
    ('logo.svg', 'image/svg+xml', b'<svg/>'),
    ('logo.png', 'image/png', b'not an image'),
    ('logo.jpg', 'image/jpeg', PNG),
    ('logo.webp', 'image/webp', b'RIFFnotwebp'),
    ('logo.png', 'image/png', b''),
    ('logo.png', 'image/png', PNG + b'x' * (5 * 1024 * 1024)),
])
def test_invalid_upload_never_reaches_storage_or_database(logo_api, name, mime, content):
    client, _, session, repo, audits, gateway = logo_api
    assert client.put(PATH, files={'file': (name, content, mime)}).status_code == 422
    gateway.upload.assert_not_awaited()
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()
    assert repo.get_by_id.return_value.company_logo_url == OLD


@pytest.mark.parametrize('method', ['put', 'delete'])
def test_missing_testimonial_is_404_before_storage(logo_api, method):
    client, _, session, repo, _, gateway = logo_api
    repo.get_by_id.return_value = None
    kwargs = {'files': {'file': ('logo.png', PNG, 'image/png')}} if method == 'put' else {}
    response = getattr(client, method)(PATH, **kwargs)
    assert response.status_code == 404
    assert response.json() == {'detail': 'Testimonial not found.'}
    gateway.upload.assert_not_awaited()
    gateway.delete.assert_not_awaited()
    session.commit.assert_not_awaited()


@pytest.mark.parametrize('stage', ['audit', 'refresh', 'commit'])
def test_database_failure_compensates_new_upload_only(logo_api, stage):
    client, _, session, repo, audits, gateway = logo_api
    target = {'audit': audits.add, 'refresh': repo.refresh, 'commit': session.commit}[stage]
    target.side_effect = RuntimeError('private database detail')
    response = client.put(PATH, files={'file': ('logo.png', PNG, 'image/png')})
    assert response.status_code == 500
    assert response.json() == {'detail': 'Unable to process Testimonial request.'}
    session.rollback.assert_awaited_once()
    gateway.delete.assert_awaited_once_with('testimonial-logos', f'{ID}/{sha256(PNG).hexdigest()}.png')


def test_upload_storage_failure_preserves_database_url(logo_api):
    client, _, session, repo, audits, gateway = logo_api
    gateway.upload.side_effect = StorageError('private provider detail')
    assert client.put(PATH, files={'file': ('logo.png', PNG, 'image/png')}).json() == {
        'detail': 'Image storage is temporarily unavailable.'}
    assert repo.get_by_id.return_value.company_logo_url == OLD
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()
    gateway.delete.assert_not_awaited()


@pytest.mark.parametrize('url,deletes', [(OLD, True), ('https://external.example/logo.png', False),
    (f'{BASE}{UUID(int=1)}/old.png', False),
    ('https://other.supabase.co/storage/v1/object/public/testimonial-logos/old.png', False),
    (OLD + '?download=1', False)])
def test_delete_clears_reference_and_only_deletes_owned_objects(logo_api, url, deletes):
    client, _, session, repo, audits, gateway = logo_api
    repo.get_by_id.return_value.company_logo_url = url
    events = []
    session.commit.side_effect = lambda: events.append('commit')
    gateway.delete.side_effect = lambda *args: events.append('delete')
    assert client.delete(PATH).status_code == 204
    assert repo.get_by_id.return_value.company_logo_url is None
    assert events == (['commit', 'delete'] if deletes else ['commit'])
    assert gateway.delete.await_count == int(deletes)
    audit = audits.add.await_args.args[0]
    assert audit.context['logo_operation'] == 'delete'
    assert audit.context['changed_fields'] == ['company_logo_url']
    assert audit.action == 'update' and audit.actor_id == TEST_ADMIN.admin_id


def test_absent_logo_delete_is_idempotent(logo_api):
    client, _, session, repo, audits, gateway = logo_api
    repo.get_by_id.return_value.company_logo_url = None
    assert client.delete(PATH).status_code == 204
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()
    gateway.delete.assert_not_awaited()


def test_delete_database_failure_does_not_remove_object(logo_api):
    client, _, session, _, _, gateway = logo_api
    session.commit.side_effect = RuntimeError('private details')
    assert client.delete(PATH).status_code == 500
    session.rollback.assert_awaited_once()
    gateway.delete.assert_not_awaited()


@pytest.mark.parametrize('failure', [False, True])
def test_same_digest_does_not_delete_current_asset(logo_api, failure):
    client, _, session, repo, _, gateway = logo_api
    repo.get_by_id.return_value.company_logo_url = f'{BASE}{ID}/{sha256(PNG).hexdigest()}.png'
    if failure:
        session.commit.side_effect = RuntimeError('failure')
    assert client.put(PATH, files={'file': ('logo.png', PNG, 'image/png')}).status_code == (500 if failure else 200)
    gateway.delete.assert_not_awaited()


@pytest.mark.parametrize('operation', ['upload', 'delete'])
def test_post_commit_cleanup_failure_is_best_effort(logo_api, operation):
    client, _, session, _, _, gateway = logo_api
    gateway.delete.side_effect = StorageError('provider unavailable')
    response = client.put(PATH, files={'file': ('logo.png', PNG, 'image/png')}) if operation == 'upload' else client.delete(PATH)
    assert response.status_code == (200 if operation == 'upload' else 204)
    session.commit.assert_awaited_once()
    session.rollback.assert_not_awaited()


def test_compensation_failure_keeps_generic_database_error(logo_api):
    client, _, session, _, _, gateway = logo_api
    session.commit.side_effect = RuntimeError('database detail')
    gateway.delete.side_effect = StorageError('provider detail')
    response = client.put(PATH, files={'file': ('logo.png', PNG, 'image/png')})
    assert response.status_code == 500
    assert response.json() == {'detail': 'Unable to process Testimonial request.'}


@pytest.mark.parametrize('operation', ['patch', 'delete'])
def test_existing_crud_cleans_managed_logo_after_commit(logo_api, operation):
    _, service, session, _, _, gateway = logo_api
    if operation == 'patch':
        result = asyncio.run(service.update(ID, QuoteUpdate(company_logo_url='https://external.example/new.png'), actor=TEST_ADMIN))
        assert result.company_logo_url == 'https://external.example/new.png'
    else:
        asyncio.run(service.delete(ID, actor=TEST_ADMIN))
    session.commit.assert_awaited_once()
    gateway.delete.assert_awaited_once_with('testimonial-logos', f'{ID}/old.png')


@pytest.mark.parametrize('method', ['put', 'delete'])
@pytest.mark.parametrize('state', ['missing_token', 'invalid_token', 'missing_admin', 'inactive', 'admin', 'superadmin'])
def test_uses_existing_verified_admin_authorization(authenticated_api, method, state):
    client, verifier, session, _ = authenticated_api
    service = AsyncMock(spec=QuoteService)
    service.upload_logo.return_value = quote()
    client.app.dependency_overrides[get_testimonial_service] = lambda: service
    headers = {'Authorization': 'Bearer test-access-token'}
    if state == 'missing_token':
        headers = {}
    elif state == 'invalid_token':
        verifier.verify.side_effect = InvalidAccessTokenError('expired')
    elif state == 'missing_admin':
        session.scalar.return_value = None
    elif state == 'inactive':
        session.scalar.return_value = _admin(is_active=False)
    else:
        session.scalar.return_value = _admin(role=state)
    kwargs = {'files': {'file': ('logo.png', PNG, 'image/png')}} if method == 'put' else {}
    response = getattr(client, method)(PATH, headers=headers, **kwargs)
    assert response.status_code == ((200 if method == 'put' else 204) if state in ('admin', 'superadmin') else 401)
    mutation = service.upload_logo if method == 'put' else service.delete_logo
    if state in ('admin', 'superadmin'):
        assert mutation.await_args.kwargs['actor'].admin_id == session.scalar.return_value.id
    else:
        mutation.assert_not_awaited()


def test_dependency_reuses_exact_bucket_and_caps_size():
    settings = Settings(_env_file=None, environment=Environment.TEST, debug=False, image_max_bytes=10 * 1024 * 1024)
    app = create_app(settings)
    request = Request({'type': 'http', 'app': app})
    service = get_testimonial_service(AsyncMock(spec=AsyncSession), request, AsyncMock(spec=SupabaseStorageGateway))
    assert service._image_storage._bucket == 'testimonial-logos'
    assert service._image_storage._max_bytes == 5 * 1024 * 1024


def test_openapi_upload_delete_and_health(logo_api):
    client, _, _, _, _, _ = logo_api
    assert client.get('/health').status_code == 200
    schema = client.get('/openapi.json').json()
    path = schema['paths']['/testimonials/{testimonial_id}/company-logo']
    assert set(path) == {'put', 'delete'}
    assert 'multipart/form-data' in path['put']['requestBody']['content']
    assert path['put']['security'] and path['delete']['security']
    assert '204' in path['delete']['responses']


def test_replacing_external_url_does_not_delete_provider_object(logo_api):
    client, _, _, repo, _, gateway = logo_api
    repo.get_by_id.return_value.company_logo_url = 'https://external.example/logo.png'
    assert client.put(PATH, files={'file': ('logo.png', PNG, 'image/png')}).status_code == 200
    gateway.delete.assert_not_awaited()


def test_first_upload_audit_and_storage_unavailable_errors(logo_api):
    client, service, session, repo, audits, gateway = logo_api
    repo.get_by_id.return_value.company_logo_url = None
    assert client.put(PATH, files={'file': ('logo.png', PNG, 'image/png')}).status_code == 200
    assert audits.add.await_args.args[0].context['logo_operation'] == 'upload'
    gateway.delete.assert_not_awaited()
    service._image_storage = None
    assert client.delete(PATH).status_code == 503
    assert client.put(PATH, files={'file': ('logo.png', PNG, 'image/png')}).status_code == 503
    assert session.commit.await_count == 1


def test_multipart_and_id_validation(logo_api):
    client, _, session, _, _, gateway = logo_api
    assert client.put(PATH).status_code == 422
    assert client.put('/testimonials/not-a-uuid/company-logo', files={'file': ('logo.png', PNG, 'image/png')}).status_code == 422
    assert client.delete('/testimonials/not-a-uuid/company-logo').status_code == 422
    gateway.upload.assert_not_awaited()
    session.commit.assert_not_awaited()


def test_exact_maximum_size_is_accepted(logo_api):
    client, _, _, _, _, gateway = logo_api
    content = PNG + b'x' * (5 * 1024 * 1024 - len(PNG))
    response = client.put(PATH, files={'file': ('logo.png', content, 'image/png')})
    assert response.status_code == 200
    assert len(gateway.upload.await_args.args[2]) == 5 * 1024 * 1024
