"""Page path contracts, CRUD boundaries, SQL ordering, and verified audit actors."""

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy.dialects import postgresql
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.faqs import get_faq_service
from app.api.dependencies.testimonials import get_testimonial_service
from app.core.config import Settings
from app.db.models.faq import FAQ
from app.db.models.testimonial import Testimonial as QuoteModel
from app.main import create_app
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.faqs import FAQRepository
from app.repositories.testimonials import TestimonialRepository as QuoteRepository
from app.schemas.faqs import FAQCreateRequest, FAQUpdateRequest, PageKey
from app.schemas.testimonials import TestimonialCreateRequest as QuoteCreateRequest, TestimonialUpdateRequest as QuoteUpdateRequest
from app.services.faqs import FAQService, FAQNotFoundError, FAQPersistenceError
from app.services.testimonials import TestimonialService as QuoteService, TestimonialNotFoundError as QuoteNotFoundError, TestimonialPersistenceError as QuotePersistenceError
from tests.auth_helpers import TEST_ADMIN, authenticate_test_admin
from tests.test_auth import authenticated_api, _admin
from app.auth.supabase import InvalidAccessTokenError

NOW = datetime(2026, 10, 13, tzinfo=timezone.utc)
ID = UUID('a610eff3-433a-405f-b58c-f4f1d1648e80')
PAGES = ['services/cloud-foundations', 'services/data-engineering', 'services/analytics-bi', 'services/ai-solutions', 'services/crm-revenue-ops']
CONFIGS = [
    ('faqs', FAQ, FAQRepository, FAQService, FAQCreateRequest, FAQUpdateRequest, get_faq_service, FAQNotFoundError, FAQPersistenceError,
     {'page': PAGES[0], 'question': 'A question?', 'answer': 'A plain-text answer.'}),
    ('testimonials', QuoteModel, QuoteRepository, QuoteService, QuoteCreateRequest, QuoteUpdateRequest, get_testimonial_service, QuoteNotFoundError, QuotePersistenceError,
     {'quote': 'A testimonial.', 'author_name': 'Author', 'author_role': None, 'company_name': None, 'company_logo_url': None}),
]


def row(config, **overrides):
    return config[1](id=ID, created_at=NOW, updated_at=NOW, display_order=1, is_active=True, **{**config[9], **overrides})


@pytest.mark.parametrize('page', PAGES + ['technologies/data-platform', 'company/about', 'careers', 'home', 'services/cloud-foundations/devops', 'all'])
def test_open_ended_page_keys_are_valid(page):
    result = FAQCreateRequest(page='  '+page+'  ', question=' Q? ', answer=' A. ')
    assert result.page == page
    assert result.question == 'Q?' and result.answer == 'A.'


@pytest.mark.parametrize('page', ['', '   ', 'Cloud Foundations', 'https://vyntics.com/services/cloud-foundations', 'vyntics.com/services/cloud-foundations', '/services/cloud-foundations', '/services/cloud-foundations?foo=bar', 'services/cloud-foundations?foo=bar', 'services/cloud#section', 'services/Cloud Foundations', 'Services/cloud', 'services//cloud', 'services/cloud/', 'services/../cloud', 'services/_cloud', 'services/cloud%20foundations', 'services/cloud\nfoundations', 'a'*256, 'services/-cloud', 'services/cloud--foundations'])
def test_invalid_page_keys_rejected_for_create_and_patch(page):
    with pytest.raises(ValidationError):
        FAQCreateRequest(page=page, question='Q?', answer='A.')
    with pytest.raises(ValidationError):
        FAQUpdateRequest(page=page)


@pytest.mark.parametrize('field', ['page', 'question', 'answer', 'display_order', 'is_active'])
def test_faq_patch_omission_and_explicit_null(field):
    assert FAQUpdateRequest().model_dump(exclude_unset=True) == {}
    with pytest.raises(ValidationError):
        FAQUpdateRequest(**{field: None})


@pytest.mark.parametrize('field', ['question', 'answer'])
def test_faq_required_text_rejects_blank(field):
    payload = dict(CONFIGS[0][9]); payload[field]='  '
    with pytest.raises(ValidationError): FAQCreateRequest(**payload)


@pytest.mark.parametrize('field', ['quote', 'author_name', 'display_order', 'is_active'])
def test_testimonial_required_patch_fields_reject_null(field):
    with pytest.raises(ValidationError): QuoteUpdateRequest(**{field: None})


def test_testimonial_optional_fields_and_url_validation():
    for field in ('author_role','company_name','company_logo_url'):
        assert QuoteUpdateRequest(**{field: None}).model_dump(exclude_unset=True)=={field:None}
    for url in ('javascript:alert(1)', 'data:text/plain,bad', 'not a URL'):
        with pytest.raises(ValidationError):
            QuoteCreateRequest(quote='Quote',author_name='Author',company_logo_url=url)
    result=QuoteCreateRequest(quote=' Quote ',author_name=' Author ',company_logo_url='https://example.com/logo.png')
    assert result.quote=='Quote' and result.author_name=='Author'


@pytest.mark.parametrize('config',CONFIGS,ids=['faqs','testimonials'])
def test_requests_reject_frontend_identity_and_unrelated_fields(config):
    for extra in ({'actor_id': str(ID)}, {'access_token':'not-accepted'}, {'status':'published'}, {'slug':'unnecessary'}):
        with pytest.raises(ValidationError): config[4](**config[9],**extra)


@pytest.mark.parametrize('public', [True, False])
@pytest.mark.parametrize('page', [None, *PAGES, 'all'])
def test_faq_filters_and_ordering_are_sql(public,page):
    session=AsyncMock(spec=AsyncSession);result=MagicMock();result.all.return_value=[];session.scalars.return_value=result
    repo=FAQRepository(session)
    asyncio.run((repo.list_public if public else repo.list_all)(page=page))
    sql=str(session.scalars.await_args.args[0].compile(dialect=postgresql.dialect(),compile_kwargs={'literal_binds':True}))
    assert 'ORDER BY faqs.page ASC, faqs.display_order ASC, faqs.created_at ASC, faqs.id ASC' in sql
    assert ('faqs.is_active IS true' in sql) is public
    if page is not None: assert f"faqs.page = '{page}'" in sql
    else: assert 'WHERE faqs.page' not in sql
    assert ' OR ' not in sql  # all is an ordinary exact-match key, never a wildcard.


@pytest.mark.parametrize('public',[True,False])
def test_testimonial_visibility_and_ordering_sql(public):
    session=AsyncMock(spec=AsyncSession);result=MagicMock();result.all.return_value=[];session.scalars.return_value=result
    repo=QuoteRepository(session)
    asyncio.run((repo.list_public if public else repo.list_all)())
    sql=str(session.scalars.await_args.args[0].compile(dialect=postgresql.dialect(),compile_kwargs={'literal_binds':True}))
    assert 'ORDER BY testimonials.display_order ASC, testimonials.created_at ASC, testimonials.id ASC' in sql
    assert ('testimonials.is_active IS true' in sql) is public


@pytest.fixture(params=CONFIGS,ids=['faqs','testimonials'])
def api(request):
    config=request.param; service=AsyncMock(spec=config[3]);application=create_app(Settings(_env_file=None))
    application.dependency_overrides[config[6]]=lambda:service
    authenticate_test_admin(application)
    with TestClient(application) as client:yield config,client,service


def test_public_admin_crud_contracts(api):
    config,client,service=api; path='/'+config[0];existing=row(config)
    service.list_public.return_value=[existing];service.list_all.return_value=[existing]
    service.get_by_id.return_value=existing;service.create.return_value=existing;service.update.return_value=existing
    params={'page':PAGES[0]} if config[0]=='faqs' else {}
    public=client.get(path,params=params);assert public.status_code==200
    assert public.json()['data'][0]['id']==str(ID)
    assert 'is_active' not in public.json()['data'][0] and 'created_at' not in public.json()['data'][0]
    admin=client.get('/admin'+path,params=params);assert admin.status_code==200
    assert admin.json()[0]['is_active'] is True
    assert client.get('/admin'+path+'/'+str(ID)).status_code==200
    assert client.post(path,json=config[9]).status_code==201
    assert service.create.await_args.kwargs['actor']==TEST_ADMIN
    field='question' if config[0]=='faqs' else 'quote'
    assert client.patch(path+'/'+str(ID),json={field:'Changed'}).status_code==200
    assert service.update.await_args.args[1].model_dump(exclude_unset=True)=={field:'Changed'}
    assert service.update.await_args.kwargs['actor']==TEST_ADMIN
    assert client.delete(path+'/'+str(ID)).status_code==204
    assert service.delete.await_args.kwargs['actor']==TEST_ADMIN
    assert client.get('/admin'+path+'/not-a-uuid').status_code==422
    service.get_by_id.side_effect=config[7]
    assert client.get('/admin'+path+'/'+str(ID)).status_code==404
    service.update.side_effect=config[7]
    assert client.patch(path+'/'+str(ID),json={field:'Changed'}).status_code==404
    service.delete.side_effect=config[7]
    assert client.delete(path+'/'+str(ID)).status_code==404
    service.list_public.return_value=[]
    assert client.get(path,params=params).json()=={'data':[]}


def test_http_page_filter_and_validation_are_shared(api):
    config,client,service=api
    if config[0]!='faqs':return
    service.list_public.return_value=[];service.list_all.return_value=[]
    assert client.get('/faqs',params={'page':'  company/future-page  '}).status_code==200
    service.list_public.assert_awaited_once_with(page='company/future-page')
    assert client.get('/admin/faqs',params={'page':PAGES[0]}).status_code==200
    service.list_all.assert_awaited_once_with(page=PAGES[0])
    for path in ('/faqs','/admin/faqs'):
        assert client.get(path,params={'page':'https://example.com'}).status_code==422
    service.update.return_value=row(config,page='company/future-page')
    assert client.patch('/faqs/'+str(ID),json={'page':'company/future-page'}).json()['page']=='company/future-page'


@pytest.mark.parametrize('config',CONFIGS,ids=['faqs','testimonials'])
@pytest.mark.parametrize('state',['missing-token','invalid-token','no-admin','inactive','admin','superadmin'])
def test_new_routes_use_existing_verified_admin_auth(authenticated_api,config,state):
    client,verifier,session,_=authenticated_api;service=AsyncMock(spec=config[3]);service.list_all.return_value=[];service.get_by_id.return_value=row(config);service.create.return_value=row(config);service.update.return_value=row(config)
    client.app.dependency_overrides[config[6]]=lambda:service
    headers={'Authorization':'Bearer test-access-token'}
    if state=='missing-token':headers={}
    elif state=='invalid-token':verifier.verify.side_effect=InvalidAccessTokenError()
    elif state=='no-admin':session.scalar.return_value=None
    elif state=='inactive':session.scalar.return_value=_admin(is_active=False)
    elif state=='superadmin':session.scalar.return_value=_admin(role='superadmin')
    methods=[('GET','/admin/'+config[0],None),('GET','/admin/'+config[0]+'/'+str(ID),None),('POST','/'+config[0],config[9]),('PATCH','/'+config[0]+'/'+str(ID),{}),('DELETE','/'+config[0]+'/'+str(ID),None)]
    for method,path,payload in methods:
        response=client.request(method,path,headers=headers,json=payload)
        assert response.status_code==(204 if method=='DELETE' else 201 if method=='POST' else 200) if state in ('admin','superadmin') else response.status_code==401
    if state not in ('admin','superadmin'):service.create.assert_not_awaited()


def test_safe_database_error_responses(api):
    config,client,service=api;path='/'+config[0]
    for method,suffix,operation,payload in [('GET','','list_public',None),('POST','','create',config[9]),('PATCH','/'+str(ID),'update',{}),('DELETE','/'+str(ID),'delete',None),('GET','/admin'+path,'list_all',None)]:
        getattr(service,operation).side_effect=config[8]('internal database details')
        response=client.request(method,suffix if suffix.startswith('/admin') else path+suffix,json=payload)
        assert response.status_code==500
        assert 'internal' not in response.text
        getattr(service,operation).side_effect=None


@pytest.mark.parametrize('config',CONFIGS,ids=['faqs','testimonials'])
def test_service_crud_audits_noop_and_rollback(config):
    repo=AsyncMock(spec=config[2]);audits=AsyncMock(spec=AuditLogRepository);session=AsyncMock(spec=AsyncSession)
    existing=row(config);repo.get_by_id.return_value=existing
    repo.count.return_value=0
    async def locked(resource_id):return repo.get_by_id.return_value
    repo.get_for_update.side_effect=locked
    async def add(resource):resource.id=ID
    repo.add.side_effect=add
    service=config[3](session,repository=repo,audit_repository=audits)
    created=asyncio.run(service.create(config[4](**config[9]),actor=TEST_ADMIN))
    assert created.id==ID
    for operation in ('create','update','delete'):
        if operation=='update':asyncio.run(service.update(ID,config[5](is_active=False),actor=TEST_ADMIN))
        elif operation=='delete':asyncio.run(service.delete(ID,actor=TEST_ADMIN))
        audit=audits.add.await_args.args[0]
        assert audit.action==operation and audit.resource_type==('faq' if config[0]=='faqs' else 'testimonial')
        assert audit.actor_id==TEST_ADMIN.admin_id and audit.actor_email==TEST_ADMIN.admin_email
        assert 'answer' not in audit.context and 'quote' not in audit.context
    audits.reset_mock();session.reset_mock()
    asyncio.run(service.update(ID,config[5](),actor=TEST_ADMIN));audits.add.assert_not_awaited();session.commit.assert_not_awaited()
    repo.get_by_id.return_value=None
    with pytest.raises(config[7]):asyncio.run(service.get_by_id(ID))
    repo.add.side_effect=SQLAlchemyError('private database error')
    with pytest.raises(config[8]):asyncio.run(service.create(config[4](**config[9]),actor=TEST_ADMIN))
    session.rollback.assert_awaited_once()


def test_faq_patch_page_preserves_or_changes_only_when_supplied():
    config=CONFIGS[0];repo=AsyncMock(spec=FAQRepository);repo.get_by_id.return_value=row(config);repo.count.return_value=2
    async def locked(resource_id):return repo.get_by_id.return_value
    repo.get_for_update.side_effect=locked
    service=FAQService(AsyncMock(spec=AsyncSession),repository=repo,audit_repository=AsyncMock(spec=AuditLogRepository))
    assert asyncio.run(service.update(ID,FAQUpdateRequest(answer='Updated answer'),actor=TEST_ADMIN)).page==PAGES[0]
    assert asyncio.run(service.update(ID,FAQUpdateRequest(page=PAGES[1]),actor=TEST_ADMIN)).page==PAGES[1]


def test_models_migration_and_openapi():
    sql=(Path(__file__).resolve().parents[3]/'supabase/migrations/20261013120000_create_faqs_and_testimonials.sql').read_text()
    assert 'create type' not in sql.lower() and 'create table public.pages' not in sql.lower()
    assert 'references' not in sql.lower()
    assert FAQ.__table__.c.page.type.__class__.__name__=='Text'
    assert not FAQ.__table__.c.page.nullable
    assert len(FAQ.__table__.indexes)==len(QuoteModel.__table__.indexes)==1
    schema=create_app(Settings(_env_file=None)).openapi()
    for resource in ('faqs','testimonials'):
        assert set(schema['paths']['/'+resource])=={'get','post'}
        assert set(schema['paths']['/'+resource+'/{resource_id}'])=={'patch','delete'}
        assert schema['paths']['/admin/'+resource]['get']['security']
        assert 'security' not in schema['paths']['/'+resource]['get']
    page=schema['components']['schemas']['FAQCreateRequest']['properties']['page']
    assert page['type']=='string' and 'pattern' in page and 'enum' not in page
    root=Path(__file__).resolve().parents[3]
    for page in PAGES:
        assert (root/'frontend/src/app/(marketing)'/page/'page.tsx').is_file()
