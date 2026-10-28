"""Actual migration and HTTP lifecycle in a disposable PostgreSQL schema."""

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from unittest.mock import AsyncMock

import httpx
import pytest
from sqlalchemy import select, text, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.api.dependencies.database import get_db_session
from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.faq import FAQ
from app.db.models.testimonial import Testimonial as QuoteModel
from app.db.session import create_database, dispose_database
from app.main import create_app
from app.storage.supabase import SupabaseStorageGateway
from tests.auth_helpers import authenticate_test_admin, TEST_ADMIN
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run
from tests.test_faq_testimonial_contracts import PAGES

pytestmark=pytest.mark.skipif(not RUN_DATABASE_INTEGRATION_TESTS,reason='set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL')


def test_faq_testimonial_migration_http_order_visibility_and_audit():
    async def exercise():
        database=create_database(Settings())
        schema='faq_testimonial_test_'+uuid4().hex
        application=None
        created_schema=False
        storage_client = httpx.AsyncClient()
        storage_gateway = SupabaseStorageGateway(
            Settings(_env_file=None, supabase_url="https://test.supabase.co",
                     supabase_service_role_key="test-only-storage-key"), storage_client,
        )
        storage_gateway.upload = AsyncMock()
        storage_gateway.delete = AsyncMock()
        try:
            sql=(Path(__file__).resolve().parents[3]/'supabase/migrations/20261013120000_create_faqs_and_testimonials.sql').read_text()
            async with database.engine.begin() as connection:
                await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
                created_schema=True
                await connection.execute(text(f'CREATE TABLE "{schema}".audit_logs (LIKE public.audit_logs INCLUDING ALL)'))
                # Use the real shared timestamp function; only table names are scoped.
                scoped=sql.replace('public.',f'"{schema}".').replace(f'"{schema}".set_updated_at()', 'public.set_updated_at()')
                await connection.exec_driver_sql(scoped)
                sub_page_sql=(Path(__file__).resolve().parents[3]/'supabase/migrations/20261028120000_add_faq_sub_page.sql').read_text()
                await connection.exec_driver_sql(sub_page_sql.replace('public.',f'"{schema}".'))
                columns=(await connection.execute(text("SELECT column_name,data_type,is_nullable FROM information_schema.columns WHERE table_schema=:schema AND table_name='faqs'"),{'schema':schema})).all()
                assert ('page','text','NO') in columns
                assert ('display_order','integer','NO') in columns
                assert ('is_active','boolean','NO') in columns
                assert await connection.scalar(text("SELECT count(*) FROM information_schema.tables WHERE table_schema=:schema AND table_name='pages'"),{'schema':schema})==0
                assert await connection.scalar(text("SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=:schema AND t.typtype='e'"),{'schema':schema})==0
                assert await connection.scalar(text("SELECT count(*) FROM pg_indexes WHERE schemaname=:schema AND indexname IN ('ix_faqs_page_active_display_order','ix_testimonials_active_display_order')"),{'schema':schema})==2
            engine=database.engine.execution_options(schema_translate_map={None:schema})
            factory=async_sessionmaker(engine,expire_on_commit=False)
            application=create_app(Settings(_env_file=None))
            async def scoped_session():
                async with factory() as session:yield session
            application.dependency_overrides[get_db_session]=scoped_session
            authenticate_test_admin(application)
            application.state.storage_gateway = storage_gateway
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=application),base_url='http://testserver') as client:
                ids={}
                for page in [*PAGES,'technologies/future-page','all']:
                    ids[page]=[]
                    for order,active in [(2,True),(1,True),(1,False)]:
                        response=await client.post('/faqs',json={'page':page,'question':f'Question {order}?','answer':'Plain answer.','display_order':order,'is_active':active})
                        assert response.status_code==201
                        ids[page].append(response.json()['id'])
                # Positions are contiguous per page: 1 (inactive), then the two active rows at 2 and 3.
                for page in ids:
                    response=await client.get('/faqs',params={'page':page})
                    assert response.status_code==200
                    rows=response.json()['data']
                    assert len(rows)==2 and {row['page'] for row in rows}=={page}
                    assert [row['display_order'] for row in rows]==[2,3] and [row['id'] for row in rows]==[ids[page][1],ids[page][0]]
                    admin=await client.get('/admin/faqs',params={'page':page})
                    assert admin.status_code==200 and len(admin.json())==3
                assert (await client.get('/faqs',params={'page':'company/no-faqs'})).json()=={'data':[]}
                all_rows=(await client.get('/faqs')).json()['data']
                assert len(all_rows)==14 and [row['page'] for row in all_rows]==sorted(row['page'] for row in all_rows)
                assert len((await client.get('/admin/faqs')).json())==21
                faq_id=ids[PAGES[1]][0]
                detail=(await client.get('/admin/faqs/'+faq_id)).json()
                patch=await client.patch('/faqs/'+faq_id,json={'answer':'Updated answer.'})
                assert patch.status_code==200 and patch.json()['page']==PAGES[1]
                assert patch.json()['updated_at']>detail['updated_at']
                patch=await client.patch('/faqs/'+faq_id,json={'page':'company/new-page','is_active':False})
                assert patch.status_code==200
                assert (await client.get('/faqs',params={'page':'company/new-page'})).json()=={'data':[]}
                assert (await client.get('/admin/faqs',params={'page':'company/new-page'})).json()[0]['id']==faq_id
                assert (await client.patch('/faqs/'+faq_id,json={'is_active':True})).status_code==200
                assert (await client.get('/faqs',params={'page':'company/new-page'})).json()['data'][0]['id']==faq_id
                assert (await client.delete('/faqs/'+faq_id)).status_code==204
                assert (await client.get('/admin/faqs/'+faq_id)).status_code==404
                assert (await client.patch('/faqs/'+faq_id,json={'page':None})).status_code==422
                test_ids=[]
                for order,active in [(2,True),(1,True),(None,False)]:
                    response=await client.post('/testimonials',json={'quote':'A quote.','author_name':'An author','company_logo_url':'https://example.com/logo.png',**({'display_order':order} if order else {}),'is_active':active})
                    assert response.status_code==201;test_ids.append(response.json()['id'])
                public=(await client.get('/testimonials')).json()['data']
                assert [row['display_order'] for row in public]==[1,2]
                assert len((await client.get('/admin/testimonials')).json())==3
                response=await client.patch('/testimonials/'+test_ids[0],json={'quote':'Changed quote.','company_logo_url':None,'author_role':None,'company_name':'Company'})
                assert response.status_code==200 and response.json()['company_logo_url'] is None
                assert (await client.get('/admin/testimonials/'+test_ids[0])).json()['company_name']=='Company'
                # Real PostgreSQL transactions/audits, mocked provider operations.
                logo_path = '/testimonials/' + test_ids[0] + '/company-logo'
                uploaded = await client.put(logo_path, files={'file': ('logo.png', b'\x89PNG\r\n\x1a\nfirst', 'image/png')})
                assert uploaded.status_code == 200
                first_url = uploaded.json()['company_logo_url']
                assert first_url.startswith('https://test.supabase.co/storage/v1/object/public/testimonial-logos/' + test_ids[0] + '/')
                assert (await client.get('/admin/testimonials/' + test_ids[0])).json()['company_logo_url'] == first_url
                replaced = await client.put(logo_path, files={'file': ('logo.png', b'\x89PNG\r\n\x1a\nsecond', 'image/png')})
                assert replaced.status_code == 200 and replaced.json()['company_logo_url'] != first_url
                assert storage_gateway.delete.await_count == 1
                assert (await client.delete(logo_path)).status_code == 204
                assert (await client.get('/admin/testimonials/' + test_ids[0])).json()['company_logo_url'] is None
                assert storage_gateway.delete.await_count == 2
                # Clearing an existing external logo never reaches provider delete.
                assert (await client.delete('/testimonials/' + test_ids[1] + '/company-logo')).status_code == 204
                assert storage_gateway.delete.await_count == 2
                assert (await client.delete('/testimonials/'+test_ids[0])).status_code==204
                assert (await client.get('/admin/testimonials/'+test_ids[0])).status_code==404
            async with factory() as session:
                audits=list((await session.scalars(select(AuditLog).where(AuditLog.resource_type.in_(['faq','testimonial'])))).all())
                assert len(audits)==34
                logo_audits = [a for a in audits if a.context.get('logo_operation')]
                assert len(logo_audits) == 4
                assert {a.context['logo_operation'] for a in logo_audits} == {'upload', 'replace', 'delete'}
                assert all(a.context['changed_fields'] == ['company_logo_url'] for a in logo_audits)
                assert all(a.actor_id==TEST_ADMIN.admin_id and a.actor_email==TEST_ADMIN.admin_email for a in audits)
                faq_audits=[a for a in audits if str(a.resource_id)==faq_id]
                assert {a.action for a in faq_audits}=={'create','update','delete'}
                assert any(a.context.get('changed_fields')==['display_order','is_active','page'] for a in faq_audits)
                assert not any('answer' in a.context or 'quote' in a.context for a in audits)
                for bad in ('https://example.com','Bad Label','services/x?query=bad','services/x#fragment',''):
                    with pytest.raises(IntegrityError):
                        async with session.begin_nested():
                            await session.execute(update(FAQ).values(page=bad))
                with pytest.raises(IntegrityError):
                    async with session.begin_nested():await session.execute(update(QuoteModel).values(quote='  '))
        finally:
            if application:
                application.dependency_overrides.clear()
                await application.state.auth_verifier.aclose()
            if created_schema:
                async with database.engine.begin() as connection:await connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
            await storage_client.aclose()
            await dispose_database(database)
    _run(asyncio.wait_for(exercise(),timeout=180))
