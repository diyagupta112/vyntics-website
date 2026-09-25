"""Contract tests for Phase 8 Career schemas."""

from datetime import datetime, timezone
from uuid import UUID

import pytest
from pydantic import ValidationError

from app.schemas.careers import (
    CareerCreateRequest,
    CareerDetailResponse,
    CareerListItem,
    CareerUpdateRequest,
)


CAREER_ID = UUID("f36f3376-d338-46c1-91e3-f2b0fe723ec0")
PUBLISHED_AT = datetime(2026, 9, 25, 12, 0, tzinfo=timezone.utc)


def _create_body(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "slug": "  Senior Engineer  ",
        "title": "  Senior Engineer  ",
        "location": "  Remote  ",
        "employment_type": "  Full-time  ",
        "department": "  Engineering  ",
        "experience": "  5+ years  ",
        "short_description": "  Build reliable systems.  ",
        "description": {"type": "doc"},
        "responsibilities": {"items": []},
        "requirements": {"items": []},
    }
    body.update(overrides)
    return body


def test_create_trims_strings_preserves_slug_and_applies_json_defaults() -> None:
    request = CareerCreateRequest.model_validate(_create_body())

    assert request.slug == "Senior Engineer"
    assert request.title == "Senior Engineer"
    assert request.location == "Remote"
    assert request.nice_to_have == {}
    assert request.benefits == {}


@pytest.mark.parametrize(
    "field",
    [
        "slug",
        "title",
        "location",
        "employment_type",
        "department",
        "experience",
        "short_description",
    ],
)
def test_create_rejects_empty_required_strings(field: str) -> None:
    with pytest.raises(ValidationError):
        CareerCreateRequest.model_validate(_create_body(**{field: "   "}))


@pytest.mark.parametrize(
    "field",
    [
        "slug",
        "title",
        "location",
        "employment_type",
        "department",
        "experience",
        "short_description",
        "description",
        "responsibilities",
        "requirements",
        "nice_to_have",
        "benefits",
    ],
)
def test_create_rejects_explicit_null(field: str) -> None:
    with pytest.raises(ValidationError):
        CareerCreateRequest.model_validate(_create_body(**{field: None}))


@pytest.mark.parametrize(
    "field",
    ["description", "responsibilities", "requirements", "nice_to_have", "benefits"],
)
def test_structured_fields_require_json_objects(field: str) -> None:
    with pytest.raises(ValidationError):
        CareerCreateRequest.model_validate(_create_body(**{field: []}))


@pytest.mark.parametrize(
    "field",
    [
        "id",
        "published_at",
        "created_by",
        "updated_by",
        "created_at",
        "updated_at",
        "status",
        "unknown",
    ],
)
def test_requests_reject_backend_managed_and_unknown_fields(field: str) -> None:
    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        CareerCreateRequest.model_validate(
            _create_body(**{field: "client-controlled"})
        )

    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        CareerUpdateRequest.model_validate(
            {"title": "Updated", field: "client-controlled"}
        )


@pytest.mark.parametrize(
    "field",
    list(CareerUpdateRequest.model_fields),
)
def test_patch_allows_omission_but_rejects_explicit_null(field: str) -> None:
    assert CareerUpdateRequest().model_dump(exclude_unset=True) == {}
    with pytest.raises(ValidationError, match="field cannot be null"):
        CareerUpdateRequest.model_validate({field: None})


def test_response_schemas_expose_only_documented_fields() -> None:
    values = {
        **CareerCreateRequest.model_validate(_create_body()).model_dump(),
        "id": CAREER_ID,
        "published_at": PUBLISHED_AT,
    }
    detail = CareerDetailResponse.model_validate(values)
    item = CareerListItem.model_validate(
        {field: values[field] for field in CareerListItem.model_fields}
    )

    assert set(detail.model_dump()) == {
        "id", "slug", "title", "location", "employment_type", "department",
        "experience", "short_description", "description", "responsibilities",
        "requirements", "nice_to_have", "benefits", "published_at",
    }
    assert set(item.model_dump()) == {
        "id", "slug", "title", "location", "employment_type", "department",
        "experience", "short_description", "published_at",
    }
