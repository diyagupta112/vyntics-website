"""API contract tests for public and admin Case Study routes."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from tests.auth_helpers import authenticate_test_admin

from app.api.dependencies.case_studies import get_case_study_service
from app.core.config import Environment, Settings
from app.db.models.case_study import CaseStudy
from app.main import create_app
from app.services.case_studies import (
    CaseStudyNotFoundError,
    CaseStudyService,
    CaseStudySlugConflictError,
    CaseStudyValidationError,
)


CASE_STUDY_ID = UUID("a610eff3-433a-405f-b58c-f4f1d1648e80")
PUBLISHED_AT = datetime(2026, 9, 23, 12, 0, tzinfo=timezone.utc)


def _case_study(
    *,
    slug: str = "phase-7-case-study",
    status: str = "published",
) -> CaseStudy:
    return CaseStudy(
        id=CASE_STUDY_ID,
        slug=slug,
        title="Phase 7 Case Study",
        seo_title="Phase 7 Case Study | Vyntics",
        meta_description="API contract test.",
        client_name="Example Client",
        excerpt="API contract test.",
        cover_image_url="https://example.com/cover.jpg",
        tech_stack=["Python", "FastAPI"],
        tags=["API", "Engineering"],
        content={"type": "doc", "content": []},
        status=status,
        published_at=PUBLISHED_AT if status == "published" else None,
        created_at=PUBLISHED_AT,
        updated_at=PUBLISHED_AT,
        created_by=None,
        updated_by=None,
    )


def _request_body(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "slug": "phase-7-case-study",
        "title": "Phase 7 Case Study",
        "seo_title": "Phase 7 Case Study | Vyntics",
        "meta_description": "API contract test.",
        "client_name": "Example Client",
        "excerpt": "API contract test.",
        "cover_image_url": "https://example.com/cover.jpg",
        "tech_stack": ["Python", "FastAPI"],
        "tags": ["API", "Engineering"],
        "content": {"type": "doc", "content": []},
        "status": "published",
    }
    body.update(overrides)
    return body


@pytest.fixture
def case_study_api() -> tuple[TestClient, AsyncMock]:
    service = AsyncMock(spec=CaseStudyService)
    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST)
    )
    authenticate_test_admin(application)
    application.dependency_overrides[get_case_study_service] = lambda: service
    with TestClient(application) as client:
        yield client, service


def test_public_list_uses_exact_contract(case_study_api) -> None:
    client, service = case_study_api
    service.list_published.return_value = [
        _case_study(slug="newest"),
        _case_study(slug="older"),
    ]

    response = client.get("/case-studies")

    assert response.status_code == 200
    assert [item["slug"] for item in response.json()["data"]] == [
        "newest",
        "older",
    ]
    assert set(response.json()["data"][0]) == {
        "id",
        "slug",
        "title",
        "client_name",
        "excerpt",
        "cover_image_url",
        "tech_stack",
        "tags",
        "published_at",
    }
    service.list_published.assert_awaited_once_with()


def test_public_detail_and_hidden_or_missing_behavior(case_study_api) -> None:
    client, service = case_study_api
    service.get_published_by_slug.return_value = _case_study()

    response = client.get("/case-studies/phase-7-case-study")

    assert response.status_code == 200
    assert set(response.json()) == {
        "id",
        "slug",
        "title",
        "seo_title",
        "meta_description",
        "client_name",
        "excerpt",
        "cover_image_url",
        "tech_stack",
        "tags",
        "content",
        "published_at",
    }

    service.get_published_by_slug.side_effect = CaseStudyNotFoundError
    missing = client.get("/case-studies/hidden-or-missing")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Case Study not found."}


def test_admin_list_returns_all_statuses_and_exact_contract(case_study_api) -> None:
    client, service = case_study_api
    service.list_all.return_value = [
        _case_study(slug="draft", status="draft"),
        _case_study(slug="published", status="published"),
        _case_study(slug="unpublished", status="unpublished"),
    ]

    response = client.get("/admin/case-studies")

    assert response.status_code == 200
    assert [item["status"] for item in response.json()] == [
        "draft",
        "published",
        "unpublished",
    ]
    expected_fields = {
        "id",
        "slug",
        "title",
        "seo_title",
        "meta_description",
        "client_name",
        "excerpt",
        "cover_image_url",
        "tech_stack",
        "tags",
        "content",
        "status",
        "published_at",
        "created_at",
        "updated_at",
    }
    assert all(set(item) == expected_fields for item in response.json())
    service.list_all.assert_awaited_once_with()
    service.list_published.assert_not_awaited()


@pytest.mark.parametrize("case_study_status", ["draft", "published", "unpublished"])
def test_admin_detail_returns_every_status(
    case_study_api,
    case_study_status: str,
) -> None:
    client, service = case_study_api
    service.get_by_id.return_value = _case_study(status=case_study_status)

    response = client.get(f"/admin/case-studies/{CASE_STUDY_ID}")

    assert response.status_code == 200
    assert response.json()["status"] == case_study_status
    service.get_by_id.assert_awaited_once_with(CASE_STUDY_ID)


def test_admin_detail_returns_404_and_requires_uuid(case_study_api) -> None:
    client, service = case_study_api
    service.get_by_id.side_effect = CaseStudyNotFoundError

    missing = client.get(f"/admin/case-studies/{CASE_STUDY_ID}")
    invalid_id = client.get("/admin/case-studies/not-a-uuid")

    assert missing.status_code == 404
    assert missing.json() == {"detail": "Case Study not found."}
    assert invalid_id.status_code == 422


def test_create_uses_unprefixed_route_and_admin_contract(case_study_api) -> None:
    client, service = case_study_api
    service.create.return_value = _case_study()

    response = client.post("/case-studies", json=_request_body())
    wrong_route = client.post("/admin/case-studies", json=_request_body())

    assert response.status_code == 201
    assert response.json()["status"] == "published"
    assert "created_by" not in response.json()
    assert "updated_by" not in response.json()
    assert wrong_route.status_code == 405


def test_create_maps_conflict_and_schema_validation(case_study_api) -> None:
    client, service = case_study_api
    service.create.side_effect = CaseStudySlugConflictError

    conflict = client.post("/case-studies", json=_request_body())
    assert conflict.status_code == 409
    assert conflict.json() == {
        "detail": "A Case Study with this slug already exists."
    }

    service.create.side_effect = None
    for body in (
        _request_body(status="scheduled"),
        _request_body(cover_image_url=None),
        _request_body(content=["invalid"]),
        _request_body(tech_stack="Python"),
    ):
        assert client.post("/case-studies", json=body).status_code == 422


@pytest.mark.parametrize(
    ("error", "expected_status"),
    [
        (CaseStudyNotFoundError(), 404),
        (CaseStudySlugConflictError(), 409),
        (
            CaseStudyValidationError(
                "cover_image_url is required for published Case Studies"
            ),
            422,
        ),
    ],
)
def test_update_maps_documented_errors(
    case_study_api,
    error: Exception,
    expected_status: int,
) -> None:
    client, service = case_study_api
    service.update.side_effect = error

    response = client.patch(
        f"/case-studies/{CASE_STUDY_ID}",
        json={"title": "Updated"},
    )

    assert response.status_code == expected_status
    assert set(response.json()) == {"detail"}


def test_update_returns_admin_contract_and_rejects_bad_uuid(case_study_api) -> None:
    client, service = case_study_api
    updated = _case_study()
    updated.title = "Updated title"
    service.update.return_value = updated

    response = client.patch(
        f"/case-studies/{CASE_STUDY_ID}",
        json={"title": "Updated title"},
    )
    invalid_id = client.patch(
        "/case-studies/not-a-uuid",
        json={"title": "Updated title"},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated title"
    assert "created_by" not in response.json()
    assert invalid_id.status_code == 422


def test_delete_returns_204_and_404(case_study_api) -> None:
    client, service = case_study_api

    deleted = client.delete(f"/case-studies/{CASE_STUDY_ID}")
    assert deleted.status_code == 204
    assert deleted.content == b""

    service.delete.side_effect = CaseStudyNotFoundError
    missing = client.delete(f"/case-studies/{CASE_STUDY_ID}")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Case Study not found."}


def test_openapi_exposes_exact_seven_routes_and_schemas(case_study_api) -> None:
    client, _ = case_study_api
    schema = client.get("/openapi.json").json()

    public_collection = schema["paths"]["/case-studies"]
    public_detail = schema["paths"]["/case-studies/{slug}"]
    mutation_detail = schema["paths"]["/case-studies/{case_study_id}"]
    admin_list = schema["paths"]["/admin/case-studies"]["get"]
    admin_detail = schema["paths"][
        "/admin/case-studies/{case_study_id}"
    ]["get"]

    assert set(public_collection) == {"get", "post"}
    assert set(public_detail) == {"get"}
    assert set(mutation_detail) == {"patch", "delete"}
    assert public_collection["post"]["requestBody"]["content"][
        "application/json"
    ]["schema"]["$ref"].endswith("/CaseStudyCreateRequest")
    assert mutation_detail["patch"]["requestBody"]["content"][
        "application/json"
    ]["schema"]["$ref"].endswith("/CaseStudyUpdateRequest")
    assert admin_list["responses"]["200"]["content"]["application/json"][
        "schema"
    ]["items"]["$ref"].endswith("/CaseStudyAdminResponse")
    assert admin_detail["responses"]["200"]["content"][
        "application/json"
    ]["schema"]["$ref"].endswith("/CaseStudyAdminResponse")
    assert "/admin/case-studies/{case_study_id}" in schema["paths"]
    assert "post" not in schema["paths"]["/admin/case-studies"]
