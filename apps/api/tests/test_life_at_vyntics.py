"""Life at Vyntics API, auth, validation, Storage lifecycle and audit contracts."""

import asyncio
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from io import BytesIO
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import httpx
import pytest
from fastapi import UploadFile
from fastapi.testclient import TestClient
from sqlalchemy.dialects import postgresql
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.datastructures import Headers
from starlette.requests import Request

from app.api.dependencies.life_at_vyntics import get_life_at_vyntics_service
from app.auth.supabase import InvalidAccessTokenError
from app.core.config import Environment, Settings
from app.db.models.life_at_vyntics import LifeAtVyntics
from app.main import create_app
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.life_at_vyntics import LifeAtVynticsRepository
from app.services.life_at_vyntics import LifeAtVynticsService
from app.storage.supabase import StorageError, SupabaseStorageGateway
from app.storage.uploads import SupabasePublicImageStorage
from tests.auth_helpers import TEST_ADMIN, authenticate_test_admin
from tests.test_auth import _admin, authenticated_api

ID = UUID("0b6f8a62-4d3c-4c0e-9d7b-6f1f5a1b2c3d")
BASE = "https://project.supabase.co/storage/v1/object/public/life-at-vyntics/"
OLD = f"{BASE}{ID}/old.png"
PNG = b"\x89PNG\r\n\x1a\nphoto"
NOW = datetime(2026, 10, 22, tzinfo=timezone.utc)
URL = f"/life-at-vyntics/{ID}"
IMAGE = f"{URL}/image"
ADMIN_URL = f"/admin/life-at-vyntics/{ID}"


def item(url=OLD, **overrides):
    values = dict(id=ID, title="Offsite", description="Team trip", image_url=url,
                  display_order=0, is_active=True, created_at=NOW, updated_at=NOW)
    return LifeAtVyntics(**{**values, **overrides})


@pytest.fixture
def api():
    session = AsyncMock(spec=AsyncSession)
    repo = AsyncMock(spec=LifeAtVynticsRepository)
    repo.get_by_id.return_value = item()
    audits = AsyncMock(spec=AuditLogRepository)
    settings = Settings(_env_file=None, environment=Environment.TEST, debug=False,
                        supabase_url="https://project.supabase.co",
                        supabase_service_role_key="test-only-key")
    gateway = SupabaseStorageGateway(settings, httpx.AsyncClient())
    gateway.upload = AsyncMock()
    gateway.delete = AsyncMock()
    storage = SupabasePublicImageStorage(gateway, bucket="life-at-vyntics", max_bytes=5 * 1024 * 1024)
    service = LifeAtVynticsService(session, repository=repo, audit_repository=audits, image_storage=storage)
    app = create_app(Settings(_env_file=None, environment=Environment.TEST, debug=False))
    authenticate_test_admin(app)
    app.dependency_overrides[get_life_at_vyntics_service] = lambda: service
    with TestClient(app, raise_server_exceptions=False) as client:
        yield client, service, session, repo, audits, gateway
    asyncio.run(gateway._client.aclose())


def digest_path(content, extension):
    return f"{ID}/{sha256(content).hexdigest()}{extension}"


# --- public -----------------------------------------------------------------

def test_public_list_needs_no_auth_and_hides_admin_fields():
    session = AsyncMock(spec=AsyncSession)
    repo = AsyncMock(spec=LifeAtVynticsRepository)
    repo.list_public.return_value = [item()]
    service = LifeAtVynticsService(session, repository=repo, audit_repository=AsyncMock(spec=AuditLogRepository))
    app = create_app(Settings(_env_file=None, environment=Environment.TEST, debug=False))
    app.dependency_overrides[get_life_at_vyntics_service] = lambda: service
    with TestClient(app) as client:
        response = client.get("/life-at-vyntics")
        assert response.status_code == 200
        row = response.json()["data"][0]
        assert set(row) == {"id", "title", "description", "image_url", "display_order"}
        repo.get_by_id.return_value = item()
        assert client.get(URL).status_code == 200
        repo.get_by_id.return_value = item(is_active=False)
        assert client.get(URL).status_code == 404
        repo.get_by_id.return_value = None
        missing = client.get(URL)
        assert missing.status_code == 404 and missing.json() == {"detail": "Life at Vyntics item not found."}


def test_queries_filter_active_and_order_deterministically():
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = MagicMock(all=lambda: [])
    repo = LifeAtVynticsRepository(session)
    asyncio.run(repo.list_public())
    public_sql = str(session.scalars.await_args.args[0].compile(dialect=postgresql.dialect()))
    asyncio.run(repo.list_all())
    all_sql = str(session.scalars.await_args.args[0].compile(dialect=postgresql.dialect()))
    order = "ORDER BY life_at_vyntics.display_order ASC, life_at_vyntics.created_at ASC, life_at_vyntics.id ASC"
    assert "life_at_vyntics.is_active IS true" in public_sql and order in public_sql
    assert "WHERE" not in all_sql and order in all_sql


def test_admin_reads_include_inactive(api):
    client, _, _, repo, _, _ = api
    repo.list_all.return_value = [item(is_active=False)]
    repo.get_by_id.return_value = item(is_active=False)
    assert client.get("/admin/life-at-vyntics").json()[0]["is_active"] is False
    assert client.get(ADMIN_URL).json()["is_active"] is False
    repo.get_by_id.return_value = None
    assert client.get(ADMIN_URL).status_code == 404


def test_persistence_failures_are_generic(api):
    client, _, _, repo, _, _ = api
    repo.list_public.side_effect = SQLAlchemyError("secret")
    response = client.get("/life-at-vyntics")
    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process Life at Vyntics request."}


# --- authentication ----------------------------------------------------------

REQUESTS = [
    ("get", "/admin/life-at-vyntics", {}),
    ("get", ADMIN_URL, {}),
    ("post", "/life-at-vyntics", {"json": {"title": "A"}}),
    ("patch", URL, {"json": {"title": "A"}}),
    ("delete", URL, {}),
    ("put", IMAGE, {"files": {"file": ("p.png", PNG, "image/png")}}),
    ("delete", IMAGE, {}),
]


def _protected_service():
    service = AsyncMock(spec=LifeAtVynticsService)
    service.list_all.return_value = []
    service.get_by_id.return_value = item()
    service.create.return_value = item()
    service.update.return_value = item()
    service.upload_image.return_value = item()
    return service


@pytest.mark.parametrize("method,path,kwargs", REQUESTS)
@pytest.mark.parametrize("state", ["missing_token", "invalid_token", "missing_admin", "inactive", "admin", "superadmin"])
def test_protected_endpoints_use_existing_admin_authorization(authenticated_api, method, path, kwargs, state):
    client, verifier, session, _ = authenticated_api
    service = _protected_service()
    client.app.dependency_overrides[get_life_at_vyntics_service] = lambda: service
    headers = {"Authorization": "Bearer test-access-token"}
    if state == "missing_token":
        headers = {}
    elif state == "invalid_token":
        verifier.verify.side_effect = InvalidAccessTokenError("expired")
    elif state == "missing_admin":
        session.scalar.return_value = None
    elif state == "inactive":
        session.scalar.return_value = _admin(is_active=False)
    else:
        session.scalar.return_value = _admin(role=state)
    response = getattr(client, method)(path, headers=headers, **kwargs)
    if state in ("admin", "superadmin"):
        assert response.status_code < 300
    else:
        assert response.status_code == 401
        assert not [c for c in service.method_calls if c[0] != "__bool__"]


# --- CRUD -------------------------------------------------------------------

def test_create_defaults_trims_and_audits(api):
    client, _, session, repo, audits, _ = api

    def populate(resource):
        resource.id, resource.created_at, resource.updated_at = ID, NOW, NOW

    repo.add.side_effect = populate
    response = client.post("/life-at-vyntics", json={"title": "  Diwali  "})
    assert response.status_code == 201
    created = repo.add.await_args.args[0]
    assert created.title == "Diwali" and created.description is None and created.image_url is None
    assert created.display_order == 0 and created.is_active is True
    session.commit.assert_awaited_once()
    audit = audits.add.await_args.args[0]
    assert (audit.action, audit.resource_type) == ("create", "life_at_vyntics")
    assert audit.actor_id == TEST_ADMIN.admin_id and audit.actor_email == TEST_ADMIN.admin_email


@pytest.mark.parametrize("body", [
    {}, {"title": ""}, {"title": "   "}, {"title": None}, {"title": 5},
    {"title": "A", "display_order": "x"}, {"title": "A", "display_order": 1.5},
    {"title": "A", "display_order": None}, {"title": "A", "is_active": "yes"},
    {"title": "A", "is_active": None},
    {"title": "A", "image_url": "https://example.com/x.png"},
])
def test_create_validation(api, body):
    client, _, session, repo, _, _ = api
    assert client.post("/life-at-vyntics", json=body).status_code == 422
    repo.add.assert_not_awaited()
    session.commit.assert_not_awaited()


def test_partial_update_preserves_omitted_fields_and_audits(api):
    client, _, session, repo, audits, _ = api
    response = client.patch(URL, json={"display_order": 7})
    assert response.status_code == 200
    row = repo.get_by_id.return_value
    assert (row.title, row.description, row.is_active, row.display_order) == ("Offsite", "Team trip", True, 7)
    audit = audits.add.await_args.args[0]
    assert audit.action == "update" and audit.context["changed_fields"] == ["display_order"]
    session.commit.assert_awaited_once()


def test_update_can_clear_description(api):
    client, _, _, repo, _, _ = api
    assert client.patch(URL, json={"description": None}).status_code == 200
    assert repo.get_by_id.return_value.description is None


def test_noop_update_does_not_audit(api):
    client, _, session, _, audits, _ = api
    assert client.patch(URL, json={}).status_code == 200
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()


@pytest.mark.parametrize("body", [
    {"title": None}, {"title": "  "}, {"display_order": None}, {"display_order": "a"},
    {"is_active": None}, {"is_active": "maybe"}, {"image_url": "https://example.com/x.png"},
])
def test_update_validation(api, body):
    client, _, session, _, _, _ = api
    assert client.patch(URL, json=body).status_code == 422
    session.commit.assert_not_awaited()


def test_update_and_delete_missing_are_404(api):
    client, _, session, repo, _, gateway = api
    repo.get_by_id.return_value = None
    assert client.patch(URL, json={"title": "A"}).status_code == 404
    assert client.delete(URL).status_code == 404
    assert client.delete(IMAGE).status_code == 404
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 404
    gateway.upload.assert_not_awaited()
    gateway.delete.assert_not_awaited()
    session.commit.assert_not_awaited()


def test_delete_removes_managed_image_after_commit_and_audits(api):
    client, _, session, repo, audits, gateway = api
    events = []
    session.commit.side_effect = lambda: events.append("commit")
    gateway.delete.side_effect = lambda *a: events.append("delete")
    assert client.delete(URL).status_code == 204
    repo.delete.assert_awaited_once()
    gateway.delete.assert_awaited_once_with("life-at-vyntics", f"{ID}/old.png")
    assert events == ["commit", "delete"]
    assert audits.add.await_args.args[0].action == "delete"


def test_delete_database_failure_keeps_image(api):
    client, _, session, _, _, gateway = api
    session.commit.side_effect = RuntimeError("private")
    assert client.delete(URL).status_code == 500
    session.rollback.assert_awaited_once()
    gateway.delete.assert_not_awaited()


EXTERNAL = [
    "https://external.example/photo.png",
    f"{BASE}{UUID(int=1)}/old.png",
    "https://other.supabase.co/storage/v1/object/public/life-at-vyntics/old.png",
    OLD + "?download=1",
    None,
]


@pytest.mark.parametrize("url", EXTERNAL)
def test_resource_delete_never_deletes_unmanaged_objects(api, url):
    client, _, _, repo, _, gateway = api
    repo.get_by_id.return_value.image_url = url
    assert client.delete(URL).status_code == 204
    gateway.delete.assert_not_awaited()


def test_resource_delete_cleanup_failure_is_best_effort(api):
    client, _, session, _, _, gateway = api
    gateway.delete.side_effect = StorageError("down")
    assert client.delete(URL).status_code == 204
    session.rollback.assert_not_awaited()


# --- image upload / delete --------------------------------------------------

@pytest.mark.parametrize("name,mime,content,extension", [
    ("untrusted.JPEG", "image/jpeg", b"\xff\xd8\xff\xe0photo", ".jpg"),
    ("../../x.png", "image/png", PNG, ".png"),
    ("photo.webp", "image/webp", b"RIFF\x04\0\0\0WEBPphoto", ".webp"),
])
def test_upload_accepts_formats_and_orders_upload_commit_cleanup(api, name, mime, content, extension):
    client, _, session, repo, audits, gateway = api
    events = []
    gateway.upload.side_effect = lambda *a: events.append("upload")
    session.commit.side_effect = lambda: events.append("commit")
    gateway.delete.side_effect = lambda *a: events.append("delete")
    response = client.put(IMAGE, files={"file": (name, content, mime)})
    path = digest_path(content, extension)
    assert response.status_code == 200
    assert response.json()["image_url"] == BASE + path
    gateway.upload.assert_awaited_once_with("life-at-vyntics", path, content, mime)
    gateway.delete.assert_awaited_once_with("life-at-vyntics", f"{ID}/old.png")
    assert events == ["upload", "commit", "delete"]
    audit = audits.add.await_args.args[0]
    assert audit.action == "update" and audit.resource_type == "life_at_vyntics"
    assert audit.actor_id == TEST_ADMIN.admin_id
    assert audit.context["changed_fields"] == ["image_url"]
    assert audit.context["image_operation"] == "replace"


def test_first_upload_is_logged_as_upload_and_deletes_nothing(api):
    client, _, _, repo, audits, gateway = api
    repo.get_by_id.return_value.image_url = None
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 200
    assert audits.add.await_args.args[0].context["image_operation"] == "upload"
    gateway.delete.assert_not_awaited()


@pytest.mark.parametrize("name,mime,content", [
    ("p.png", "application/octet-stream", PNG),
    ("p.png", "image/jpeg", PNG),
    ("p.svg", "image/svg+xml", b"<svg/>"),
    ("p.gif", "image/gif", b"GIF89a"),
    ("p.png", "image/png", b"not an image"),
    ("p.jpg", "image/jpeg", PNG),
    ("p.webp", "image/webp", b"RIFFnotwebp"),
    ("p.png", "image/png", b""),
    ("p.png", "image/png", PNG + b"x" * (5 * 1024 * 1024)),
])
def test_invalid_uploads_never_reach_storage_or_database(api, name, mime, content):
    client, _, session, repo, audits, gateway = api
    assert client.put(IMAGE, files={"file": (name, content, mime)}).status_code == 422
    gateway.upload.assert_not_awaited()
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()
    assert repo.get_by_id.return_value.image_url == OLD


def test_exact_maximum_size_is_accepted(api):
    client, _, _, _, _, gateway = api
    content = PNG + b"x" * (5 * 1024 * 1024 - len(PNG))
    assert client.put(IMAGE, files={"file": ("p.png", content, "image/png")}).status_code == 200
    assert len(gateway.upload.await_args.args[2]) == 5 * 1024 * 1024


@pytest.mark.parametrize("stage", ["audit", "refresh", "commit"])
def test_database_failure_removes_only_the_new_object(api, stage):
    client, _, session, repo, audits, gateway = api
    target = {"audit": audits.add, "refresh": repo.refresh, "commit": session.commit}[stage]
    target.side_effect = RuntimeError("private")
    response = client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")})
    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process Life at Vyntics request."}
    session.rollback.assert_awaited_once()
    gateway.delete.assert_awaited_once_with("life-at-vyntics", digest_path(PNG, ".png"))


def test_compensation_failure_keeps_generic_error(api):
    client, _, session, _, _, gateway = api
    session.commit.side_effect = RuntimeError("db")
    gateway.delete.side_effect = StorageError("provider")
    response = client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")})
    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process Life at Vyntics request."}


def test_storage_failure_preserves_database_state(api):
    client, _, session, repo, audits, gateway = api
    gateway.upload.side_effect = StorageError("provider")
    response = client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")})
    assert response.status_code == 503
    assert response.json() == {"detail": "Image storage is temporarily unavailable."}
    assert repo.get_by_id.return_value.image_url == OLD
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()


@pytest.mark.parametrize("failure", [False, True])
def test_same_digest_never_deletes_current_asset(api, failure):
    client, _, session, repo, _, gateway = api
    repo.get_by_id.return_value.image_url = BASE + digest_path(PNG, ".png")
    if failure:
        session.commit.side_effect = RuntimeError("x")
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == (500 if failure else 200)
    gateway.delete.assert_not_awaited()


def test_replacing_external_url_does_not_delete_provider_object(api):
    client, _, _, repo, _, gateway = api
    repo.get_by_id.return_value.image_url = "https://external.example/photo.png"
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 200
    gateway.delete.assert_not_awaited()


def test_post_commit_cleanup_failure_is_best_effort(api):
    client, _, session, _, _, gateway = api
    gateway.delete.side_effect = StorageError("down")
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 200
    assert client.delete(IMAGE).status_code == 204
    session.rollback.assert_not_awaited()


def test_image_delete_clears_reference_deletes_object_and_audits(api):
    client, _, session, repo, audits, gateway = api
    events = []
    session.commit.side_effect = lambda: events.append("commit")
    gateway.delete.side_effect = lambda *a: events.append("delete")
    assert client.delete(IMAGE).status_code == 204
    assert repo.get_by_id.return_value.image_url is None
    assert events == ["commit", "delete"]
    audit = audits.add.await_args.args[0]
    assert audit.action == "update" and audit.context["image_operation"] == "delete"
    assert audit.context["changed_fields"] == ["image_url"]


@pytest.mark.parametrize("url", EXTERNAL[:-1])
def test_image_delete_ignores_unmanaged_urls_in_storage(api, url):
    client, _, session, repo, _, gateway = api
    repo.get_by_id.return_value.image_url = url
    assert client.delete(IMAGE).status_code == 204
    assert repo.get_by_id.return_value.image_url is None
    session.commit.assert_awaited_once()
    gateway.delete.assert_not_awaited()


def test_image_delete_without_image_is_idempotent(api):
    client, _, session, repo, audits, gateway = api
    repo.get_by_id.return_value.image_url = None
    assert client.delete(IMAGE).status_code == 204
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()
    gateway.delete.assert_not_awaited()


def test_image_delete_database_failure_keeps_object(api):
    client, _, session, _, _, gateway = api
    session.commit.side_effect = RuntimeError("x")
    assert client.delete(IMAGE).status_code == 500
    gateway.delete.assert_not_awaited()


def test_storage_unconfigured_returns_503(api):
    client, service, session, _, _, _ = api
    service._image_storage = None
    assert client.put(IMAGE, files={"file": ("p.png", PNG, "image/png")}).status_code == 503
    assert client.delete(IMAGE).status_code == 503
    session.commit.assert_not_awaited()


def test_multipart_and_id_validation(api):
    client, _, session, _, _, gateway = api
    assert client.put(IMAGE).status_code == 422
    assert client.put("/life-at-vyntics/not-a-uuid/image", files={"file": ("p.png", PNG, "image/png")}).status_code == 422
    assert client.delete("/life-at-vyntics/not-a-uuid/image").status_code == 422
    gateway.upload.assert_not_awaited()
    session.commit.assert_not_awaited()


def test_dependency_uses_exact_bucket_and_caps_size():
    app = create_app(Settings(_env_file=None, environment=Environment.TEST, debug=False, image_max_bytes=10 * 1024 * 1024))
    request = Request({"type": "http", "app": app})
    service = get_life_at_vyntics_service(AsyncMock(spec=AsyncSession), request, AsyncMock(spec=SupabaseStorageGateway))
    assert service._image_storage._bucket == "life-at-vyntics"
    assert service._image_storage._max_bytes == 5 * 1024 * 1024
    assert get_life_at_vyntics_service(AsyncMock(spec=AsyncSession), request, None)._image_storage is None


def test_openapi_and_health(api):
    client, *_ = api
    assert client.get("/health").status_code == 200
    paths = client.get("/openapi.json").json()["paths"]
    assert set(paths["/life-at-vyntics"]) == {"get", "post"}
    assert set(paths["/life-at-vyntics/{resource_id}"]) == {"get", "patch", "delete"}
    assert set(paths["/life-at-vyntics/{resource_id}/image"]) == {"put", "delete"}
    assert set(paths["/admin/life-at-vyntics"]) == {"get"}
    assert "security" not in paths["/life-at-vyntics"]["get"]
    assert "security" not in paths["/life-at-vyntics/{resource_id}"]["get"]
    assert paths["/life-at-vyntics"]["post"]["security"]
    assert paths["/admin/life-at-vyntics"]["get"]["security"]
    assert "multipart/form-data" in paths["/life-at-vyntics/{resource_id}/image"]["put"]["requestBody"]["content"]


def test_model_matches_contract():
    table = LifeAtVyntics.__table__
    assert set(table.c.keys()) == {"id", "title", "description", "image_url", "display_order", "is_active", "created_at", "updated_at"}
    assert not table.c.title.nullable and table.c.description.nullable and table.c.image_url.nullable
    assert not table.c.display_order.nullable and not table.c.is_active.nullable
    index = next(i for i in table.indexes if i.name == "ix_life_at_vyntics_active_display_order")
    assert [c.name for c in index.columns] == ["is_active", "display_order", "created_at", "id"]
