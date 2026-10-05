"""Featured state, capacity rules, and existing HTTP contracts for both resources."""

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import AsyncMock

import pytest
from pydantic import ValidationError
from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_logs import AuditLogRepository
from app.repositories.blogs import BlogRepository
from app.repositories.case_studies import CaseStudyRepository
from app.schemas.blogs import BlogCreateRequest, BlogUpdateRequest
from app.schemas.case_studies import CaseStudyCreateRequest, CaseStudyUpdateRequest
from app.services.blogs import BlogService, BlogValidationError
from app.services.case_studies import CaseStudyService, CaseStudyValidationError
from tests.test_blog_service import _blog, _create_request as blog_request
from tests.test_case_study_service import _case_study, _create_request as case_request
from tests.test_blog_api import blog_api, _request_body as blog_body
from tests.test_case_study_api import case_study_api, _request_body as case_body


RESOURCES = [
    (BlogRepository, BlogService, BlogCreateRequest, BlogUpdateRequest,
     BlogValidationError, _blog, blog_request, "blogs", "blogs", 1),
    (CaseStudyRepository, CaseStudyService, CaseStudyCreateRequest, CaseStudyUpdateRequest,
     CaseStudyValidationError, _case_study, case_request, "case-studies", "case studies", 2),
]


@pytest.fixture(params=RESOURCES, ids=["blogs", "case-studies"])
def resource(request):
    return request.param


def setup_service(resource, *, count=0, status="published", featured=False):
    repository_type, service_type = resource[:2]
    model = resource[5](status=status)
    setattr(model, "is_featured" if resource[7] == "blogs" else "featured", featured)
    repository = AsyncMock(spec=repository_type)
    repository.slug_exists.return_value = False
    repository.count_featured_for_update.return_value = count
    repository.get_by_id.return_value = model
    audits = AsyncMock(spec=AuditLogRepository)
    session = AsyncMock(spec=AsyncSession)
    service = service_type(session, **{
        "blog_repository" if resource[7] == "blogs" else "case_study_repository": repository,
        "audit_repository": audits,
    })
    return service, repository, audits, session, model


@pytest.mark.parametrize("status,count", [("draft", 5), ("unpublished", 5), ("published", 0), ("published", 4)])
def test_featured_create_uses_only_public_capacity(resource, status, count):
    service, repo, audits, session, _ = setup_service(resource, count=count)
    payload = resource[6](status=status).model_dump()
    payload["is_featured" if resource[7] == "blogs" else "featured"] = True
    if resource[7] != "blogs" and count == 5:
        with pytest.raises(resource[4]):
            asyncio.run(service.create(resource[2](**payload)))
        return
    created = asyncio.run(service.create(resource[2](**payload)))
    assert getattr(created, "is_featured" if resource[7] == "blogs" else "featured") is True
    if status == "published" or resource[7] != "blogs":
        repo.count_featured_for_update.assert_awaited_once_with(exclude_id=None)
    else:
        repo.count_featured_for_update.assert_not_awaited()
    assert audits.add.await_args.args[0].context["is_featured" if resource[7] == "blogs" else "featured"] is True
    session.commit.assert_awaited_once()


def test_sixth_featured_create_rejected_and_rolled_back(resource):
    service, repo, audits, session, _ = setup_service(resource, count=5)
    payload = resource[6](status="published").model_dump()
    payload["is_featured" if resource[7] == "blogs" else "featured"] = True
    with pytest.raises(resource[4], match=f"Maximum of 5 featured {resource[8]} allowed."):
        asyncio.run(service.create(resource[2](**payload)))
    repo.add.assert_not_awaited()
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()
    session.rollback.assert_awaited_once()


@pytest.mark.parametrize("count", [4, 5])
def test_feature_existing_published_item_checks_capacity(resource, count):
    service, repo, audits, session, model = setup_service(resource, count=count)
    if count == 5:
        with pytest.raises(resource[4]):
            asyncio.run(service.update(model.id, resource[3](**{"is_featured" if resource[7] == "blogs" else "featured": True})))
        assert getattr(model, "is_featured" if resource[7] == "blogs" else "featured") is False
        audits.add.assert_not_awaited()
        session.rollback.assert_awaited_once()
    else:
        updated = asyncio.run(service.update(model.id, resource[3](**{"is_featured" if resource[7] == "blogs" else "featured": True})))
        assert getattr(updated, "is_featured" if resource[7] == "blogs" else "featured") is True
        assert ("is_featured" if resource[7] == "blogs" else "featured") in audits.add.await_args.args[0].context["changed_fields"]
        session.commit.assert_awaited_once()
    repo.count_featured_for_update.assert_awaited_once_with(exclude_id=model.id)


@pytest.mark.parametrize("updates", [{"is_featured": False}, {"status": "draft"}, {"status": "unpublished"}, {"title": "Edited while full"}])
def test_releasing_or_preserving_existing_slot_is_allowed(resource, updates):
    service, repo, _, session, model = setup_service(resource, count=5, featured=True)
    updated = asyncio.run(service.update(model.id, resource[3](**updates)))
    for key, value in updates.items():
        assert getattr(updated, "featured" if key == "is_featured" and resource[7] != "blogs" else key) == value
    repo.count_featured_for_update.assert_not_awaited()
    session.commit.assert_awaited_once()


@pytest.mark.parametrize("status", ["draft", "unpublished"])
def test_publishing_hidden_featured_item_checks_capacity(resource, status):
    service, repo, _, session, model = setup_service(resource, count=5, status=status, featured=True)
    if resource[7] != "blogs":
        asyncio.run(service.update(model.id, resource[3](status="published")))
        repo.count_featured_for_update.assert_not_awaited()
        return
    with pytest.raises(resource[4]):
        asyncio.run(service.update(model.id, resource[3](status="published")))
    assert model.status == status
    repo.count_featured_for_update.assert_awaited_once_with(exclude_id=model.id)
    session.rollback.assert_awaited_once()


def test_create_defaults_false_and_patch_rejects_null(resource):
    payload = resource[6]().model_dump(exclude={"is_featured"})
    assert getattr(resource[2](**payload), "is_featured" if resource[7] == "blogs" else "featured") is False
    assert resource[3]().model_dump(exclude_unset=True) == {}
    with pytest.raises(ValidationError):
        resource[3](**{"is_featured" if resource[7] == "blogs" else "featured": None})
    payload = resource[6]().model_dump()
    payload["is_featured" if resource[7] == "blogs" else "featured"] = None
    with pytest.raises(ValidationError):
        resource[2](**payload)


def test_repository_locks_before_count_and_excludes_current_item(resource):
    session = AsyncMock(spec=AsyncSession)
    session.scalar.return_value = 4
    repo = resource[0](session)
    model = resource[5]()
    result = asyncio.run(repo.count_featured_for_update(exclude_id=model.id))
    assert result == 4
    calls = [call[0] for call in session.mock_calls]
    assert calls.index("execute") < calls.index("scalar")
    assert str(session.execute.await_args.args[0]) == f"SELECT pg_advisory_xact_lock(1448693332, {resource[9]})"
    query = str(session.scalar.await_args.args[0].compile(
        dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True},
    ))
    assert "count(*)" in query and (("is_featured" if resource[7] == "blogs" else "featured") + " IS true") in query
    assert "id !=" in query
    assert ("status = 'published'" in query) == (resource[7] == "blogs")
    session.commit.assert_not_awaited()


@pytest.mark.parametrize("fixture_name,config,body", [("blog_api", RESOURCES[0], blog_body), ("case_study_api", RESOURCES[1], case_body)])
def test_http_featured_contracts_and_limit_errors(request, fixture_name, config, body):
    client, service = request.getfixturevalue(fixture_name)
    model = config[5](status="published")
    field = "is_featured" if config[7] == "blogs" else "featured"
    setattr(model, field, True)
    model.published_at = datetime.now(timezone.utc)
    service.create.return_value = model
    service.update.return_value = model
    service.list_published.return_value = [model]
    service.get_published_by_slug.return_value = model
    service.list_all.return_value = [model]
    service.get_by_id.return_value = model
    path = config[7]
    for url in [f"/{path}", f"/{path}/{model.slug}", f"/admin/{path}", f"/admin/{path}/{model.id}"]:
        response = client.get(url)
        assert response.status_code == 200
        data = response.json()
        if isinstance(data, list): data = data[0]
        elif "data" in data: data = data["data"][0]
        assert data[field] is True
    created = client.post(f"/{path}", json=body(**{field: True}))
    assert created.status_code == 201 and created.json()[field] is True
    assert service.create.await_args .args[0].__getattribute__(field) is True
    updated = client.patch(f"/{path}/{model.id}", json={field: False})
    assert updated.status_code == 200
    assert service.update.await_args .args[1].__getattribute__(field) is False
    message = f"Maximum of 5 featured {config[8]} allowed."
    service.create.side_effect = config[4](message)
    service.update.side_effect = config[4](message)
    for response in [client.post(f"/{path}", json=body(**{field: True})), client.patch(f"/{path}/{model.id}", json={field: True})]:
        assert response.status_code == 422 and response.json() == {"detail": message}
    schemas = client.get("/openapi.json").json()["components"]["schemas"]
    prefix = "Blog" if path == "blogs" else "CaseStudy"
    for suffix in ["CreateRequest", "UpdateRequest", "AdminResponse", "ListItem", "DetailResponse"]:
        assert field in schemas[prefix+suffix]["properties"]


def test_featured_migration_preserves_data_and_defaults():
    sql = (Path(__file__).resolve().parents[3] / "supabase/migrations/20261005120000_add_content_featured_state.sql").read_text().lower()
    for table in ["blogs", "case_studies"]:
        assert f"alter table public.{table}" in sql
    assert sql.count("add column is_featured boolean not null default false") == 2
    assert "delete from" not in sql and "drop " not in sql


def test_featured_publication_still_requires_cover(resource):
    payload = resource[6](status="published").model_dump()
    payload.update({"is_featured" if resource[7] == "blogs" else "featured": True, "cover_image_url": None})
    with pytest.raises(ValidationError, match="cover_image_url"):
        resource[2](**payload)
    service, repo, _, session, model = setup_service(resource, status="draft", featured=True)
    model.cover_image_url = None
    with pytest.raises(resource[4], match="cover_image_url"):
        asyncio.run(service.update(model.id, resource[3](status="published")))
    repo.count_featured_for_update.assert_not_awaited()
    session.commit.assert_not_awaited()
