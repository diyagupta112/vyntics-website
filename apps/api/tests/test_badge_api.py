"""Badge HTTP and schema contract tests."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.badges import get_badge_service
from app.core.config import Environment, Settings
from app.db.models.badge import Badge
from app.main import create_app
from app.services.badges import BadgeNotFoundError, BadgeService
from app.storage.supabase import StorageError
from app.storage.uploads import UploadValidationError
from tests.auth_helpers import authenticate_test_admin


BADGE_ID = UUID("a9ef2526-f734-47aa-b6f8-b3a6cfb18366")
NOW = datetime(2026, 10, 2, 9, 0, tzinfo=timezone.utc)
ADMIN_FIELDS = {
    "id",
    "name",
    "description",
    "logo_url",
    "website_url",
    "display_order",
    "is_active",
    "created_at",
    "updated_at",
}
PUBLIC_FIELDS = ADMIN_FIELDS - {"is_active", "created_at", "updated_at"}


def _badge(**overrides: object) -> Badge:
    values: dict[str, object] = {
        "id": BADGE_ID,
        "name": "Databricks Partner",
        "description": None,
        "logo_url": None,
        "website_url": "https://www.databricks.com/",
        "display_order": 1,
        "is_active": True,
        "created_at": NOW,
        "updated_at": NOW,
    }
    values.update(overrides)
    return Badge(**values)


def _body(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "name": "Databricks Partner",
        "description": None,
        "website_url": "https://www.databricks.com/",
        "display_order": 1,
        "is_active": True,
    }
    body.update(overrides)
    return body


@pytest.fixture
def badge_api() -> tuple[TestClient, AsyncMock]:
    service = AsyncMock(spec=BadgeService)
    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST, debug=False)
    )
    authenticate_test_admin(application)
    application.dependency_overrides[get_badge_service] = lambda: service
    with TestClient(application, raise_server_exceptions=False) as client:
        yield client, service


def test_public_list_uses_envelope_and_service_filtered_order(badge_api) -> None:
    client, service = badge_api
    service.list_public.return_value = [
        _badge(display_order=1),
        _badge(id=UUID("f86d09e8-951c-4128-84b7-d58902b62df0"), display_order=2),
    ]

    response = client.get("/badges")

    assert response.status_code == 200
    assert [row["display_order"] for row in response.json()["data"]] == [1, 2]
    assert all(set(row) == PUBLIC_FIELDS for row in response.json()["data"])
    service.list_public.assert_awaited_once_with()


def test_admin_list_and_detail_return_complete_fields(badge_api) -> None:
    client, service = badge_api
    service.list_all.return_value = [_badge(), _badge(is_active=False)]
    service.get_by_id.return_value = _badge()

    listed = client.get("/admin/badges")
    detail = client.get(f"/admin/badges/{BADGE_ID}")

    assert listed.status_code == 200
    assert [row["is_active"] for row in listed.json()] == [True, False]
    assert all(set(row) == ADMIN_FIELDS for row in listed.json())
    assert detail.status_code == 200 and set(detail.json()) == ADMIN_FIELDS


def test_admin_detail_maps_missing_and_invalid_ids(badge_api) -> None:
    client, service = badge_api
    service.get_by_id.side_effect = BadgeNotFoundError

    missing = client.get(f"/admin/badges/{BADGE_ID}")
    invalid = client.get("/admin/badges/not-a-uuid")

    assert missing.status_code == 404
    assert missing.json() == {"detail": "Badge not found."}
    assert invalid.status_code == 422


def test_create_trims_fields_preserves_url_and_forbids_logo_injection(badge_api) -> None:
    client, service = badge_api
    service.create.return_value = _badge(description="Trusted partner")

    response = client.post(
        "/badges",
        json=_body(
            name="  Databricks Partner  ",
            description="  Trusted partner  ",
            website_url="https://example.com/path?x=1",
        ),
    )

    assert response.status_code == 201
    request = service.create.await_args.args[0]
    assert request.name == "Databricks Partner"
    assert request.description == "Trusted partner"
    assert request.website_url == "https://example.com/path?x=1"

    rejected = client.post("/badges", json=_body(logo_url="https://evil/logo.png"))
    assert rejected.status_code == 422


@pytest.mark.parametrize(
    "body",
    [
        {"name": "   "},
        {"name": "x" * 201},
        {"description": "   "},
        {"website_url": "not-a-url"},
        {"website_url": "ftp://example.com"},
        {"display_order": None},
        {"is_active": None},
    ],
)
def test_create_rejects_invalid_fields(badge_api, body: dict[str, object]) -> None:
    client, service = badge_api
    response = client.post("/badges", json=_body(**body))
    assert response.status_code == 422
    service.create.assert_not_awaited()


def test_create_accepts_nullable_description_and_website(badge_api) -> None:
    client, service = badge_api
    service.create.return_value = _badge(description=None, website_url=None)

    response = client.post(
        "/badges",
        json=_body(description=None, website_url=None, is_active=False),
    )

    assert response.status_code == 201
    assert service.create.await_args.args[0].is_active is False


def test_patch_excludes_logo_and_backend_fields(badge_api) -> None:
    client, service = badge_api
    service.update.return_value = _badge(is_active=False)
    changed = client.patch(f"/badges/{BADGE_ID}", json={"is_active": False})
    assert changed.status_code == 200 and changed.json()["is_active"] is False

    for field, value in (
        ("logo_url", "https://example.com/logo.png"),
        ("id", str(BADGE_ID)),
        ("created_at", NOW.isoformat()),
        ("updated_at", NOW.isoformat()),
    ):
        response = client.patch(f"/badges/{BADGE_ID}", json={field: value})
        assert response.status_code == 422


def test_delete_and_logo_endpoints(badge_api) -> None:
    client, service = badge_api
    service.upload_logo.return_value = _badge(
        logo_url="https://project/storage/v1/object/public/badge-logos/id/hash.webp"
    )
    uploaded = client.put(
        f"/badges/{BADGE_ID}/logo",
        files={"file": ("logo.webp", b"RIFF\x04\x00\x00\x00WEBPimage", "image/webp")},
    )
    assert uploaded.status_code == 200
    assert uploaded.json()["logo_url"].endswith("/id/hash.webp")

    logo_deleted = client.delete(f"/badges/{BADGE_ID}/logo")
    badge_deleted = client.delete(f"/badges/{BADGE_ID}")
    assert logo_deleted.status_code == 204 and logo_deleted.content == b""
    assert badge_deleted.status_code == 204 and badge_deleted.content == b""


def test_logo_and_storage_errors_are_sanitized(badge_api) -> None:
    client, service = badge_api
    service.upload_logo.side_effect = UploadValidationError("Unsupported image")
    invalid = client.put(
        f"/badges/{BADGE_ID}/logo",
        files={"file": ("logo.svg", b"svg", "image/svg+xml")},
    )
    assert invalid.status_code == 422

    service.upload_logo.side_effect = StorageError("secret provider details")
    unavailable = client.put(
        f"/badges/{BADGE_ID}/logo",
        files={"file": ("logo.png", b"png", "image/png")},
    )
    assert unavailable.status_code == 503
    assert "secret" not in unavailable.text


def test_protected_routes_reject_missing_credentials() -> None:
    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST, debug=False)
    )
    service = AsyncMock(spec=BadgeService)
    application.dependency_overrides[get_badge_service] = lambda: service
    with TestClient(application) as client:
        assert client.get("/badges").status_code == 200
        for method, path in (
            (client.get, "/admin/badges"),
            (client.get, f"/admin/badges/{BADGE_ID}"),
            (client.post, "/badges"),
            (client.patch, f"/badges/{BADGE_ID}"),
            (client.delete, f"/badges/{BADGE_ID}"),
            (client.put, f"/badges/{BADGE_ID}/logo"),
            (client.delete, f"/badges/{BADGE_ID}/logo"),
        ):
            response = method(path)
            assert response.status_code == 401


def test_openapi_exposes_badge_surface_and_security(badge_api) -> None:
    client, _ = badge_api
    document = client.get("/openapi.json").json()
    paths = document["paths"]

    assert set(paths["/badges"]) == {"get", "post"}
    assert set(paths["/admin/badges"]) == {"get"}
    assert set(paths["/admin/badges/{badge_id}"]) == {"get"}
    assert set(paths["/badges/{badge_id}"]) == {"patch", "delete"}
    assert set(paths["/badges/{badge_id}/logo"]) == {"put", "delete"}
    assert "security" not in paths["/badges"]["get"]
    for path, method in (
        ("/badges", "post"),
        ("/admin/badges", "get"),
        ("/admin/badges/{badge_id}", "get"),
        ("/badges/{badge_id}", "patch"),
        ("/badges/{badge_id}", "delete"),
        ("/badges/{badge_id}/logo", "put"),
        ("/badges/{badge_id}/logo", "delete"),
    ):
        assert paths[path][method]["security"] == [{"HTTPBearer": []}]
    assert "multipart/form-data" in paths["/badges/{badge_id}/logo"]["put"][
        "requestBody"
    ]["content"]
