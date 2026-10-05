"""Contract tests for Phase 7 Case Study schemas."""

from datetime import datetime, timezone
from uuid import UUID

import pytest
from pydantic import ValidationError

from app.schemas.case_studies import (
    CaseStudyAdminResponse,
    CaseStudyCreateRequest,
    CaseStudyUpdateRequest,
)


RESOURCE_ID = UUID("a610eff3-433a-405f-b58c-f4f1d1648e80")
NOW = datetime(2026, 9, 23, 12, 0, tzinfo=timezone.utc)


def _create_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "slug": "phase-7-case-study",
        "title": "Phase 7 Case Study",
        "seo_title": "Phase 7 Case Study | Vyntics",
        "meta_description": "Case Study schema validation.",
        "client_name": "Example Client",
        "excerpt": "A focused Case Study schema test.",
        "cover_image_url": None,
        "tech_stack": ["Python", "FastAPI"],
        "tags": ["API", "Engineering"],
        "content": {"type": "doc", "content": []},
        "status": "draft",
        "featured": False,
    }
    payload.update(overrides)
    return payload


def test_create_request_accepts_documented_contract() -> None:
    draft = CaseStudyCreateRequest.model_validate(_create_payload())
    published = CaseStudyCreateRequest.model_validate(
        _create_payload(
            status="published",
            cover_image_url="https://example.com/case-study.jpg",
        )
    )

    assert draft.cover_image_url is None
    assert published.status == "published"
    assert published.tech_stack == ["Python", "FastAPI"]


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("title", "   "),
        ("status", "scheduled"),
        ("cover_image_url", "not-a-url"),
        ("content", ["not", "an", "object"]),
        ("tech_stack", "Python"),
        ("tags", [1]),
    ],
)
def test_create_request_rejects_invalid_contract_values(
    field: str,
    value: object,
) -> None:
    with pytest.raises(ValidationError):
        CaseStudyCreateRequest.model_validate(
            _create_payload(**{field: value})
        )


def test_create_requires_cover_when_published() -> None:
    with pytest.raises(ValidationError, match="cover_image_url is required"):
        CaseStudyCreateRequest.model_validate(
            _create_payload(status="published", cover_image_url=None)
        )


@pytest.mark.parametrize(
    "field",
    [
        "id",
        "published_at",
        "created_by",
        "updated_by",
        "created_at",
        "updated_at",
    ],
)
def test_requests_reject_backend_managed_fields(field: str) -> None:
    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        CaseStudyCreateRequest.model_validate(
            _create_payload(**{field: "client-controlled"})
        )

    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        CaseStudyUpdateRequest.model_validate(
            {"title": "Updated", field: "client-controlled"}
        )


@pytest.mark.parametrize(
    "field",
    [
        "slug",
        "title",
        "seo_title",
        "meta_description",
        "client_name",
        "excerpt",
        "tech_stack",
        "tags",
        "content",
        "status",
    ],
)
def test_update_allows_omission_but_rejects_required_field_null(
    field: str,
) -> None:
    assert CaseStudyUpdateRequest().model_dump(exclude_unset=True) == {}
    with pytest.raises(ValidationError, match="field cannot be null"):
        CaseStudyUpdateRequest.model_validate({field: None})


def test_update_allows_nullable_cover_image() -> None:
    request = CaseStudyUpdateRequest(cover_image_url=None)
    assert request.model_dump(exclude_unset=True) == {"cover_image_url": None}


def test_admin_response_matches_exact_contract() -> None:
    response = CaseStudyAdminResponse.model_validate(
        {
            **_create_payload(),
            "id": RESOURCE_ID,
            "published_at": None,
            "created_at": NOW,
            "updated_at": NOW,
        }
    )

    assert set(response.model_dump()) == {
        "id",
        "featured",
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
    assert "created_by" not in CaseStudyAdminResponse.model_fields
    assert "updated_by" not in CaseStudyAdminResponse.model_fields
