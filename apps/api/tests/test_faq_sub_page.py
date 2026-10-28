"""FAQ sub_page targeting: schema, API contract and real PostgreSQL behavior."""

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import text, update
from sqlalchemy.dialects import postgresql
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.api.dependencies.database import get_db_session
from app.api.dependencies.faqs import get_faq_service
from app.core.config import Settings
from app.db.models.faq import FAQ
from app.db.session import create_database, dispose_database
from app.main import create_app
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.faqs import FAQRepository
from app.schemas.faqs import FAQCreateRequest, FAQUpdateRequest
from app.services.faqs import FAQService
from tests.auth_helpers import TEST_ADMIN, authenticate_test_admin
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run

NOW = datetime(2026, 10, 28, tzinfo=timezone.utc)
ID = UUID('a610eff3-433a-405f-b58c-f4f1d1648e80')
PAGE = 'services/cloud-foundations'
MIGRATIONS = Path(__file__).resolve().parents[3] / 'supabase/migrations'


def _faq(**overrides):
    values = dict(id=ID, page=PAGE, sub_page=None, question='Q?', answer='A.', display_order=1, is_active=True, created_at=NOW, updated_at=NOW)
    return FAQ(**{**values, **overrides})


def test_sub_page_omitted_or_null_is_none():
    assert FAQCreateRequest(page=PAGE, question='Q?', answer='A.').sub_page is None
    assert FAQCreateRequest(page=PAGE, sub_page=None, question='Q?', answer='A.').sub_page is None


@pytest.mark.parametrize('value', ['cloud-migration', 'cloud-cost-optimization', 'devops/pipelines'])
def test_sub_page_accepts_open_ended_keys_and_trims(value):
    assert FAQCreateRequest(page=PAGE, sub_page='  ' + value + '  ', question='Q?', answer='A.').sub_page == value
    assert FAQUpdateRequest(sub_page=value).sub_page == value


@pytest.mark.parametrize('value', ['', '   ', 'Cloud Migration', '/cloud-migration', 'cloud-migration?x=1', 'cloud--migration', 'https://x.com/a', 'a' * 256])
def test_sub_page_rejects_blank_and_malformed(value):
    with pytest.raises(ValidationError):
        FAQCreateRequest(page=PAGE, sub_page=value, question='Q?', answer='A.')
    with pytest.raises(ValidationError):
        FAQUpdateRequest(sub_page=value)


def test_patch_omission_vs_explicit_null():
    assert FAQUpdateRequest().model_dump(exclude_unset=True) == {}
    assert FAQUpdateRequest(sub_page=None).model_dump(exclude_unset=True) == {'sub_page': None}


def test_service_patch_preserves_clears_and_updates_sub_page():
    repo = AsyncMock(spec=FAQRepository)
    repo.get_by_id.return_value = _faq(sub_page='cloud-migration')
    repo.count.return_value = 1

    async def locked(resource_id):
        return repo.get_by_id.return_value
    repo.get_for_update.side_effect = locked
    service = FAQService(AsyncMock(spec=AsyncSession), repository=repo, audit_repository=AsyncMock(spec=AuditLogRepository))
    run = lambda request: asyncio.run(service.update(ID, request, actor=TEST_ADMIN))
    assert run(FAQUpdateRequest(answer='New')).sub_page == 'cloud-migration'
    assert run(FAQUpdateRequest(sub_page='cloud-cost-optimization')).sub_page == 'cloud-cost-optimization'
    assert run(FAQUpdateRequest(sub_page=None)).sub_page is None


@pytest.mark.parametrize('sub_page', [None, 'cloud-migration'])
def test_repository_sql_filter(sub_page):
    session = AsyncMock(spec=AsyncSession)
    result = MagicMock(); result.all.return_value = []; session.scalars.return_value = result
    asyncio.run(FAQRepository(session).list_public(page=PAGE, sub_page=sub_page))
    sql = str(session.scalars.await_args.args[0].compile(dialect=postgresql.dialect(), compile_kwargs={'literal_binds': True}))
    assert f"faqs.page = '{PAGE}'" in sql
    if sub_page is None:
        assert 'WHERE' in sql and 'faqs.sub_page =' not in sql and 'IS NULL' not in sql
    else:
        assert f"faqs.sub_page = '{sub_page}'" in sql


@pytest.fixture
def api():
    service = AsyncMock(spec=FAQService)
    application = create_app(Settings(_env_file=None))
    application.dependency_overrides[get_faq_service] = lambda: service
    authenticate_test_admin(application)
    with TestClient(application) as client:
        yield client, service


def test_http_contract_exposes_sub_page(api):
    client, service = api
    row = _faq(sub_page='cloud-migration')
    service.list_public.return_value = [row]; service.list_all.return_value = [row]
    service.get_by_id.return_value = row; service.create.return_value = row; service.update.return_value = row
    assert client.get('/faqs', params={'page': PAGE, 'sub_page': 'cloud-migration'}).json()['data'][0]['sub_page'] == 'cloud-migration'
    service.list_public.assert_awaited_with(page=PAGE, sub_page='cloud-migration')
    assert client.get('/faqs', params={'page': PAGE}).status_code == 200
    service.list_public.assert_awaited_with(page=PAGE)
    assert client.get('/faqs', params={'sub_page': 'cloud-migration'}).status_code == 422
    assert client.get('/faqs', params={'page': PAGE, 'sub_page': 'Bad Key'}).status_code == 422
    assert client.get('/admin/faqs').json()[0]['sub_page'] == 'cloud-migration'
    assert client.get('/admin/faqs/' + str(ID)).json()['sub_page'] == 'cloud-migration'
    created = client.post('/faqs', json={'page': PAGE, 'sub_page': 'cloud-migration', 'question': 'Q?', 'answer': 'A.'})
    assert created.status_code == 201 and created.json()['sub_page'] == 'cloud-migration'
    assert service.create.await_args.args[0].sub_page == 'cloud-migration'
    assert client.patch('/faqs/' + str(ID), json={'sub_page': None}).status_code == 200
    assert service.update.await_args.args[1].model_dump(exclude_unset=True) == {'sub_page': None}


def test_openapi_sub_page_is_open_ended():
    schema = create_app(Settings(_env_file=None)).openapi()
    prop = schema['components']['schemas']['FAQCreateRequest']['properties']['sub_page']
    assert 'enum' not in str(prop) and 'pattern' in str(prop)
    assert any(p['name'] == 'sub_page' for p in schema['paths']['/faqs']['get']['parameters'])
    assert 'sub_page' in schema['components']['schemas']['FAQAdminResponse']['properties']


def test_migration_is_nullable_without_table_or_foreign_key():
    sql = (MIGRATIONS / '20261028120000_add_faq_sub_page.sql').read_text().lower()
    assert 'add column sub_page text;' in sql and 'not null' not in sql and 'references' not in sql and 'create table' not in sql
    assert FAQ.__table__.c.sub_page.nullable


@pytest.mark.skipif(not RUN_DATABASE_INTEGRATION_TESTS, reason='set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL')
def test_postgres_sub_page_behavior():
    async def exercise():
        database = create_database(Settings())
        schema = 'faq_sub_page_test_' + uuid4().hex
        application = None
        created = False
        try:
            async with database.engine.begin() as connection:
                await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
                created = True
                await connection.execute(text(f'CREATE TABLE "{schema}".audit_logs (LIKE public.audit_logs INCLUDING ALL)'))
                first = (MIGRATIONS / '20261013120000_create_faqs_and_testimonials.sql').read_text()
                scope = lambda sql: sql.replace('public.', f'"{schema}".').replace(f'"{schema}".set_updated_at()', 'public.set_updated_at()')
                await connection.exec_driver_sql(scope(first))
                # Pre-existing rows, before the new migration.
                await connection.execute(text(f'''INSERT INTO "{schema}".faqs (page, question, answer) VALUES ('services/cloud-foundations','Old?','Old.')'''))
                await connection.exec_driver_sql(scope((MIGRATIONS / '20261028120000_add_faq_sub_page.sql').read_text()))
                assert await connection.scalar(text(f'SELECT count(*) FROM "{schema}".faqs WHERE sub_page IS NULL')) == 1
                assert ('sub_page', 'YES') in (await connection.execute(text("SELECT column_name,is_nullable FROM information_schema.columns WHERE table_schema=:s AND table_name='faqs'"), {'s': schema})).all()
            factory = async_sessionmaker(database.engine.execution_options(schema_translate_map={None: schema}), expire_on_commit=False)
            application = create_app(Settings(_env_file=None))

            async def scoped_session():
                async with factory() as session:
                    yield session
            application.dependency_overrides[get_db_session] = scoped_session
            authenticate_test_admin(application)
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=application), base_url='http://testserver') as client:
                async def create(page, sub_page=None, **extra):
                    body = {'page': page, 'question': 'Q?', 'answer': 'A.', **extra}
                    if sub_page is not None:
                        body['sub_page'] = sub_page
                    response = await client.post('/faqs', json=body)
                    assert response.status_code == 201
                    return response.json()
                main = await create(PAGE)
                assert main['sub_page'] is None
                sub = await create(PAGE, 'cloud-migration')
                assert sub['sub_page'] == 'cloud-migration'
                other = await create('services/data-engineering', 'cloud-migration')
                future = await create(PAGE, 'cloud-cost-optimization')
                inactive = await create(PAGE, 'cloud-migration', is_active=False)
                ids = lambda rows: {r['id'] for r in rows}
                # Page-only filter is unchanged: every active FAQ for the page.
                page_rows = (await client.get('/faqs', params={'page': PAGE})).json()['data']
                assert ids(page_rows) >= {main['id'], sub['id'], future['id']} and inactive['id'] not in ids(page_rows)
                assert len(page_rows) == 4  # includes the pre-existing row
                filtered = (await client.get('/faqs', params={'page': PAGE, 'sub_page': 'cloud-migration'})).json()['data']
                assert ids(filtered) == {sub['id']}
                assert other['id'] not in ids(filtered) and main['id'] not in ids(filtered)
                assert ids((await client.get('/faqs', params={'page': PAGE, 'sub_page': 'cloud-cost-optimization'})).json()['data']) == {future['id']}
                assert (await client.get('/faqs', params={'page': PAGE, 'sub_page': 'nothing-here'})).json() == {'data': []}
                assert (await client.get('/admin/faqs/' + sub['id'])).json()['sub_page'] == 'cloud-migration'
                kept = await client.patch('/faqs/' + sub['id'], json={'answer': 'Changed.'})
                assert kept.json()['sub_page'] == 'cloud-migration'
                moved = await client.patch('/faqs/' + sub['id'], json={'sub_page': 'cloud-cost-optimization'})
                assert moved.json()['sub_page'] == 'cloud-cost-optimization'
                cleared = await client.patch('/faqs/' + sub['id'], json={'sub_page': None})
                assert cleared.status_code == 200 and cleared.json()['sub_page'] is None
                assert (await client.get('/admin/faqs/' + sub['id'])).json()['sub_page'] is None
                assert (await client.get('/faqs', params={'page': PAGE, 'sub_page': 'cloud-migration'})).json() == {'data': []}
                assert (await client.post('/faqs', json={'page': PAGE, 'sub_page': '  ', 'question': 'Q?', 'answer': 'A.'})).status_code == 422
            async with factory() as session:
                for bad in ('Bad Key', '', 'https://x.com', 'a//b'):
                    with pytest.raises(IntegrityError):
                        async with session.begin_nested():
                            await session.execute(update(FAQ).values(sub_page=bad))
        finally:
            if application:
                application.dependency_overrides.clear()
                await application.state.auth_verifier.aclose()
            if created:
                async with database.engine.begin() as connection:
                    await connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
            await dispose_database(database)
    _run(asyncio.wait_for(exercise(), timeout=180))
