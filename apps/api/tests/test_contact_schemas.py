"""Contract tests for Phase 11 Contact Submission schemas."""

from datetime import datetime, timezone
from uuid import UUID

import pytest
from pydantic import ValidationError

from app.schemas.contact import (
    ContactCreateRequest,
    ContactSubmissionAdminResponse,
    ContactSubmissionReceipt,
)


SUBMISSION_ID = UUID("7fd6ff67-1db4-4dd7-81a2-c9e1df99f7f5")
NOW = datetime(2026, 9, 23, 12, 0, tzinfo=timezone.utc)


def _request_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "name": "Jane Visitor",
        "email": "jane@example.com",
        "company": "Example Company",
        "subject": "Project inquiry",
        "message": "We would like to discuss a project.",
        "source_page": "/contact",
    }
    payload.update(overrides)
    return payload


def test_request_accepts_exact_contract_and_nullable_company() -> None:
    request = ContactCreateRequest.model_validate(_request_payload())
    without_company = ContactCreateRequest.model_validate(
        {
            key: value
            for key, value in _request_payload().items()
            if key != "company"
        }
    )
    null_company = ContactCreateRequest.model_validate(
        _request_payload(company=None)
    )

    assert request.source_page == "/contact"
    assert without_company.company is None
    assert null_company.company is None


@pytest.mark.parametrize("field", ["name", "subject", "message", "source_page"])
@pytest.mark.parametrize("value", ["", "   "])
def test_request_rejects_empty_required_strings(
    field: str,
    value: str,
) -> None:
    with pytest.raises(ValidationError):
        ContactCreateRequest.model_validate(
            _request_payload(**{field: value})
        )


def test_request_trims_required_strings_and_accepts_simple_source_page() -> None:
    request = ContactCreateRequest.model_validate(
        _request_payload(
            name="  Jane Visitor  ",
            subject="  Project inquiry  ",
            message="  Please contact us.  ",
            source_page="  /  ",
        )
    )

    assert request.name == "Jane Visitor"
    assert request.subject == "Project inquiry"
    assert request.message == "Please contact us."
    assert request.source_page == "/"


def test_request_rejects_invalid_email() -> None:
    with pytest.raises(ValidationError):
        ContactCreateRequest.model_validate(
            _request_payload(email="not-an-email")
        )


@pytest.mark.parametrize(
    "field",
    ["id", "status", "submitted_at", "notes", "resolved_at", "resolved_by"],
)
def test_request_rejects_backend_managed_fields(field: str) -> None:
    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        ContactCreateRequest.model_validate(
            _request_payload(**{field: "client-controlled"})
        )


def test_public_receipt_has_exact_fields() -> None:
    receipt = ContactSubmissionReceipt.model_validate(
        {"id": SUBMISSION_ID, "status": "new", "submitted_at": NOW}
    )

    assert set(receipt.model_dump()) == {"id", "status", "submitted_at"}
    with pytest.raises(ValidationError):
        ContactSubmissionReceipt.model_validate(
            {"id": SUBMISSION_ID, "status": "resolved", "submitted_at": NOW}
        )


def test_admin_response_has_exact_fields_and_nullable_metadata() -> None:
    response = ContactSubmissionAdminResponse.model_validate(
        {
            **_request_payload(company=None),
            "id": SUBMISSION_ID,
            "status": "new",
            "notes": None,
            "submitted_at": NOW,
            "resolved_at": None,
            "resolved_by": None,
        }
    )

    assert set(response.model_dump()) == {
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
