"""API contract tests for Phase 11 Contact Submission routes."""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from tests.auth_helpers import authenticate_test_admin

from app.api.dependencies.contact_submissions import (
    get_contact_submission_service,
)
from app.core.config import Environment, Settings
from app.db.models.contact_submission import ContactSubmission
from app.main import create_app
from app.services.contact_submissions import (
    ContactSubmissionNotFoundError,
    ContactSubmissionService,
)


SUBMISSION_ID = UUID("7fd6ff67-1db4-4dd7-81a2-c9e1df99f7f5")
NOW = datetime(2026, 9, 23, 12, 0, tzinfo=timezone.utc)


def _submission(
    *,
    submission_id: UUID = SUBMISSION_ID,
    submitted_at: datetime = NOW,
    status: str = "new",
) -> ContactSubmission:
    return ContactSubmission(
        id=submission_id,
        name="Jane Visitor",
        email="jane@example.com",
        company="Example Company",
        subject="Project inquiry",
        message="Private visitor message.",
        source_page="/contact",
        status=status,
        notes=None,
        submitted_at=submitted_at,
        resolved_at=None,
        resolved_by=None,
    )


def _request_body(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "name": "Jane Visitor",
        "email": "jane@example.com",
        "company": "Example Company",
        "subject": "Project inquiry",
        "message": "Private visitor message.",
        "source_page": "/contact",
    }
    body.update(overrides)
    return body


@pytest.fixture
def contact_api() -> tuple[TestClient, AsyncMock]:
    service = AsyncMock(spec=ContactSubmissionService)
    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST)
    )
    authenticate_test_admin(application)
    application.dependency_overrides[
        get_contact_submission_service
    ] = lambda: service
    with TestClient(application) as client:
        yield client, service


def test_public_create_returns_201_and_exact_receipt(contact_api) -> None:
    client, service = contact_api
    service.create.return_value = _submission()

    response = client.post("/contact-us", json=_request_body())

    assert response.status_code == 201
    assert set(response.json()) == {"id", "status", "submitted_at"}
    assert response.json()["id"] == str(SUBMISSION_ID)
    assert response.json()["status"] == "new"
    assert "email" not in response.json()
    assert "message" not in response.json()
    service.create.assert_awaited_once()


def test_public_create_requires_no_authentication(contact_api) -> None:
    client, service = contact_api
    service.create.return_value = _submission()

    response = client.post("/contact-us", json=_request_body())

    assert response.status_code == 201
    assert "WWW-Authenticate" not in response.headers


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("name", "   "),
        ("email", "not-an-email"),
        ("subject", ""),
        ("message", "   "),
        ("source_page", "   "),
    ],
)
def test_public_create_rejects_invalid_fields(
    contact_api,
    field: str,
    value: object,
) -> None:
    client, service = contact_api

    response = client.post(
        "/contact-us",
        json=_request_body(**{field: value}),
    )

    assert response.status_code == 422
    service.create.assert_not_awaited()


def test_public_create_accepts_omitted_and_null_company(contact_api) -> None:
    client, service = contact_api
    service.create.return_value = _submission()
    without_company = _request_body()
    without_company.pop("company")

    omitted = client.post("/contact-us", json=without_company)
    null_value = client.post(
        "/contact-us",
        json=_request_body(company=None),
    )

    assert omitted.status_code == 201
    assert null_value.status_code == 201


@pytest.mark.parametrize(
    "field",
    ["id", "status", "submitted_at", "notes", "resolved_at", "resolved_by"],
)
def test_public_create_rejects_internal_fields(
    contact_api,
    field: str,
) -> None:
    client, service = contact_api

    response = client.post(
        "/contact-us",
        json=_request_body(**{field: "client-controlled"}),
    )

    assert response.status_code == 422
    service.create.assert_not_awaited()


def test_admin_list_returns_all_records_in_service_order(contact_api) -> None:
    client, service = contact_api
    newest = _submission()
    older = _submission(
        submission_id=UUID("a610eff3-433a-405f-b58c-f4f1d1648e80"),
        submitted_at=NOW - timedelta(days=1),
        status="legacy-status",
    )
    service.list_all.return_value = [newest, older]

    response = client.get("/admin/contact-submissions")

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [
        str(newest.id),
        str(older.id),
    ]
    expected_fields = {
        "id",
        "name",
        "email",
        "company",
        "subject",
        "message",
        "source_page",
        "status",
        "notes",
        "submitted_at",
        "resolved_at",
        "resolved_by",
    }
    assert all(set(item) == expected_fields for item in response.json())
    service.list_all.assert_awaited_once_with()


def test_admin_detail_returns_contract(contact_api) -> None:
    client, service = contact_api
    service.get_by_id.return_value = _submission()

    response = client.get(f"/admin/contact-submissions/{SUBMISSION_ID}")

    assert response.status_code == 200
    assert response.json()["id"] == str(SUBMISSION_ID)
    assert response.json()["message"] == "Private visitor message."
    service.get_by_id.assert_awaited_once_with(SUBMISSION_ID)


def test_admin_detail_handles_missing_and_invalid_uuid(contact_api) -> None:
    client, service = contact_api
    service.get_by_id.side_effect = ContactSubmissionNotFoundError

    missing = client.get(f"/admin/contact-submissions/{SUBMISSION_ID}")
    invalid = client.get("/admin/contact-submissions/not-a-uuid")

    assert missing.status_code == 404
    assert missing.json() == {"detail": "Contact Submission not found."}
    assert invalid.status_code == 422


def test_admin_delete_returns_204_and_handles_missing(contact_api) -> None:
    client, service = contact_api

    deleted = client.delete(f"/admin/contact-submissions/{SUBMISSION_ID}")
    assert deleted.status_code == 204
    assert deleted.content == b""

    service.delete.side_effect = ContactSubmissionNotFoundError
    missing = client.delete(f"/admin/contact-submissions/{SUBMISSION_ID}")
    invalid = client.delete("/admin/contact-submissions/not-a-uuid")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Contact Submission not found."}
    assert invalid.status_code == 422


def test_undocumented_contact_routes_do_not_exist(contact_api) -> None:
    client, _ = contact_api

    assert client.put("/contact-us", json=_request_body()).status_code == 405
    assert client.delete("/contact-us").status_code == 405
    assert client.patch(
        f"/admin/contact-submissions/{SUBMISSION_ID}",
        json={"status": "resolved"},
    ).status_code == 405


def test_openapi_exposes_exact_contact_surface_and_schemas(contact_api) -> None:
    client, _ = contact_api
    schema = client.get("/openapi.json").json()

    public = schema["paths"]["/contact-us"]
    admin_list = schema["paths"]["/admin/contact-submissions"]
    admin_detail = schema["paths"][
        "/admin/contact-submissions/{submission_id}"
    ]

    assert set(public) == {"post"}
    assert set(admin_list) == {"get"}
    assert set(admin_detail) == {"get", "delete"}
    assert public["post"]["requestBody"]["content"]["application/json"][
        "schema"
    ]["$ref"].endswith("/ContactCreateRequest")
    assert public["post"]["responses"]["201"]["content"][
        "application/json"
    ]["schema"]["$ref"].endswith("/ContactSubmissionReceipt")
    assert admin_list["get"]["responses"]["200"]["content"][
        "application/json"
    ]["schema"]["items"]["$ref"].endswith(
        "/ContactSubmissionAdminResponse"
    )
