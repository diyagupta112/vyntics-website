"""API contract tests for Career routes."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.careers import get_career_service
from app.core.config import Environment, Settings
from app.db.models.career import Career
from app.main import create_app
from app.services.careers import (
    CareerDeletionConflictError,
    CareerNotFoundError,
    CareerService,
    CareerSlugConflictError,
)


CAREER_ID = UUID("f36f3376-d338-46c1-91e3-f2b0fe723ec0")
PUBLISHED_AT = datetime(2026, 9, 25, 12, 0, tzinfo=timezone.utc)
LIST_FIELDS = {
    "id", "slug", "title", "location", "employment_type", "department",
    "experience", "short_description", "published_at",
}
DETAIL_FIELDS = LIST_FIELDS | {
    "description", "responsibilities", "requirements", "nice_to_have", "benefits",
}


def _career(**overrides: object) -> Career:
    values: dict[str, object] = {
        "id": CAREER_ID,
        "slug": "Senior-Engineer",
        "title": "Senior Engineer",
        "location": "Remote",
        "employment_type": "Full-time",
        "department": "Engineering",
        "experience": "5+ years",
        "short_description": "Build reliable systems.",
        "description": {"type": "doc"},
        "responsibilities": {"items": []},
        "requirements": {"items": []},
        "nice_to_have": {},
        "benefits": {},
        "published_at": PUBLISHED_AT,
        "created_at": PUBLISHED_AT,
        "updated_at": PUBLISHED_AT,
        "created_by": None,
        "updated_by": None,
    }
    values.update(overrides)
    return Career(**values)


def _body(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "slug": "Senior-Engineer",
        "title": "Senior Engineer",
        "location": "Remote",
        "employment_type": "Full-time",
        "department": "Engineering",
        "experience": "5+ years",
        "short_description": "Build reliable systems.",
        "description": {"type": "doc"},
        "responsibilities": {"items": []},
        "requirements": {"items": []},
    }
    body.update(overrides)
    return body


@pytest.fixture
def career_api() -> tuple[TestClient, AsyncMock]:
    service = AsyncMock(spec=CareerService)
    application = create_app(
        Settings(
            _env_file=None,
            environment=Environment.TEST,
            debug=False,
        )
    )
    application.dependency_overrides[get_career_service] = lambda: service
    with TestClient(application) as client:
        yield client, service


def test_list_returns_envelope_order_and_exact_public_fields(career_api) -> None:
    client, service = career_api
    service.list_all.return_value = [
        _career(slug="newest"),
        _career(id=UUID("62eb6d8b-369f-4c24-9ea8-3e1622a06ea4"), slug="older"),
    ]

    response = client.get("/careers")
    assert response.status_code == 200
    assert [item["slug"] for item in response.json()["data"]] == ["newest", "older"]
    assert all(set(item) == LIST_FIELDS for item in response.json()["data"])
    service.list_all.assert_awaited_once_with()


def test_detail_returns_exact_contract_and_maps_missing(career_api) -> None:
    client, service = career_api
    service.get_by_slug.return_value = _career()

    response = client.get("/careers/Senior-Engineer")
    assert response.status_code == 200 and set(response.json()) == DETAIL_FIELDS

    service.get_by_slug.side_effect = CareerNotFoundError
    missing = client.get("/careers/missing")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Career not found."}


def test_create_returns_201_defaults_and_exact_contract(career_api) -> None:
    client, service = career_api
    service.create.return_value = _career()

    response = client.post("/careers", json=_body())
    assert response.status_code == 201 and set(response.json()) == DETAIL_FIELDS
    assert response.json()["nice_to_have"] == {}
    assert response.json()["benefits"] == {}
    request = service.create.await_args.args[0]
    assert request.nice_to_have == {} and request.benefits == {}


@pytest.mark.parametrize(
    "override",
    [
        {"slug": "   "},
        {"published_at": "2026-09-25T12:00:00Z"},
        {"created_at": "2026-09-25T12:00:00Z"},
        {"nice_to_have": None},
        {"benefits": None},
        {"description": []},
        {"status": "open"},
    ],
)
def test_create_rejects_invalid_or_forbidden_input(career_api, override) -> None:
    client, service = career_api
    response = client.post("/careers", json=_body(**override))
    assert response.status_code == 422
    service.create.assert_not_awaited()


def test_create_trims_without_slugifying_and_maps_duplicate(career_api) -> None:
    client, service = career_api
    service.create.return_value = _career(slug="Senior Engineer")
    response = client.post("/careers", json=_body(slug="  Senior Engineer  "))
    assert response.status_code == 201
    assert service.create.await_args.args[0].slug == "Senior Engineer"

    service.create.side_effect = CareerSlugConflictError
    conflict = client.post("/careers", json=_body(slug="Senior-Engineer"))
    assert conflict.status_code == 409
    assert conflict.json() == {"detail": "A Career with this slug already exists."}


def test_patch_returns_200_and_maps_documented_errors(career_api) -> None:
    client, service = career_api
    service.update.return_value = _career(title="Principal Engineer")
    response = client.patch(f"/careers/{CAREER_ID}", json={"title": "Principal Engineer"})
    assert response.status_code == 200 and set(response.json()) == DETAIL_FIELDS

    service.update.side_effect = CareerNotFoundError
    missing = client.patch(f"/careers/{CAREER_ID}", json={"title": "Missing"})
    assert missing.status_code == 404

    service.update.side_effect = CareerSlugConflictError
    conflict = client.patch(f"/careers/{CAREER_ID}", json={"slug": "duplicate"})
    assert conflict.status_code == 409

    invalid = client.patch("/careers/not-a-uuid", json={"title": "Invalid"})
    assert invalid.status_code == 422


@pytest.mark.parametrize("field", ["published_at", "id", "created_at", "status"])
def test_patch_rejects_backend_managed_fields(career_api, field: str) -> None:
    client, service = career_api
    response = client.patch(f"/careers/{CAREER_ID}", json={field: "forbidden"})
    assert response.status_code == 422
    service.update.assert_not_awaited()


@pytest.mark.parametrize("field", ["slug", "title", "description", "nice_to_have", "benefits"])
def test_patch_rejects_explicit_null(career_api, field: str) -> None:
    client, service = career_api
    response = client.patch(f"/careers/{CAREER_ID}", json={field: None})
    assert response.status_code == 422
    service.update.assert_not_awaited()


def test_delete_returns_empty_204_and_safe_errors(career_api) -> None:
    client, service = career_api
    deleted = client.delete(f"/careers/{CAREER_ID}")
    assert deleted.status_code == 204 and deleted.content == b""

    service.delete.side_effect = CareerNotFoundError
    missing = client.delete(f"/careers/{CAREER_ID}")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Career not found."}

    service.delete.side_effect = CareerDeletionConflictError(
        "database details must remain hidden"
    )
    restricted = client.delete(f"/careers/{CAREER_ID}")
    assert restricted.status_code == 409
    assert restricted.json() == {
        "detail": "Career cannot be deleted while job applications exist."
    }
    assert "database" not in restricted.text.lower()


def test_openapi_exposes_exact_five_operations_and_request_schemas(career_api) -> None:
    client, _ = career_api
    schema = client.get("/openapi.json").json()
    paths = schema["paths"]

    assert set(paths["/careers"]) == {"get", "post"}
    assert set(paths["/careers/{slug}"]) == {"get"}
    assert set(paths["/careers/{career_id}"]) == {"patch", "delete"}
    assert paths["/careers"]["post"]["requestBody"]["content"]["application/json"]["schema"]["$ref"].endswith("/CareerCreateRequest")
    assert paths["/careers/{career_id}"]["patch"]["requestBody"]["content"]["application/json"]["schema"]["$ref"].endswith("/CareerUpdateRequest")
    assert "/admin/careers" not in paths
    assert set(paths["/careers/{slug}/apply"]) == {"post"}
    assert paths["/careers/{slug}/apply"]["post"]["tags"] == ["job applications"]
    assert "put" not in paths["/careers/{career_id}"]
