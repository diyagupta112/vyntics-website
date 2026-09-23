"""Validation tests for Team Member API schemas."""

from uuid import UUID

import pytest
from pydantic import ValidationError

from app.schemas.team import (
    TeamMemberCreateRequest,
    TeamMemberResponse,
    TeamMemberUpdateRequest,
)

MEMBER_ID = UUID("ce8e3179-52a8-4109-b5b4-1c8f896d10b1")


def _create_body(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "name": "  Jane Doe  ",
        "role": "  Chief Executive Officer  ",
        "bio": "  Jane leads Vyntics.  ",
        "display_order": 1,
        "member_type": "leadership",
    }
    body.update(overrides)
    return body


def test_create_trims_strings_and_accepts_nullable_urls() -> None:
    omitted = TeamMemberCreateRequest.model_validate(_create_body())
    explicit_null = TeamMemberCreateRequest.model_validate(
        _create_body(photo_url=None, linkedin_url=None)
    )

    assert (omitted.name, omitted.role, omitted.bio) == (
        "Jane Doe",
        "Chief Executive Officer",
        "Jane leads Vyntics.",
    )
    assert omitted.photo_url is None and omitted.linkedin_url is None
    assert explicit_null.photo_url is None and explicit_null.linkedin_url is None


@pytest.mark.parametrize("field", ["name", "role", "bio"])
def test_create_rejects_blank_required_strings(field: str) -> None:
    with pytest.raises(ValidationError):
        TeamMemberCreateRequest.model_validate(_create_body(**{field: "   "}))


@pytest.mark.parametrize("member_type", ["leadership", "team"])
def test_create_accepts_only_approved_member_types(member_type: str) -> None:
    assert TeamMemberCreateRequest.model_validate(
        _create_body(member_type=member_type)
    ).member_type == member_type

    with pytest.raises(ValidationError):
        TeamMemberCreateRequest.model_validate(_create_body(member_type="contractor"))


@pytest.mark.parametrize("field", ["photo_url", "linkedin_url"])
def test_url_fields_require_http_or_https(field: str) -> None:
    TeamMemberCreateRequest.model_validate(
        _create_body(**{field: "https://example.com/profile"})
    )
    with pytest.raises(ValidationError):
        TeamMemberCreateRequest.model_validate(_create_body(**{field: "ftp://example.com"}))


@pytest.mark.parametrize(
    "field",
    ["id", "created_by", "updated_by", "created_at", "updated_at", "is_visible", "unknown"],
)
def test_create_rejects_backend_and_unknown_fields(field: str) -> None:
    with pytest.raises(ValidationError):
        TeamMemberCreateRequest.model_validate(_create_body(**{field: "forbidden"}))


def test_patch_distinguishes_omission_from_nullable_url_clearing() -> None:
    omitted = TeamMemberUpdateRequest()
    cleared = TeamMemberUpdateRequest(photo_url=None, linkedin_url=None)

    assert omitted.model_dump(exclude_unset=True) == {}
    assert cleared.model_dump(exclude_unset=True) == {
        "photo_url": None,
        "linkedin_url": None,
    }


@pytest.mark.parametrize("field", ["name", "role", "bio", "display_order", "member_type"])
def test_patch_rejects_null_for_database_required_fields(field: str) -> None:
    with pytest.raises(ValidationError):
        TeamMemberUpdateRequest.model_validate({field: None})


def test_response_returns_null_urls_and_exact_fields() -> None:
    response = TeamMemberResponse.model_validate(
        {
            "id": MEMBER_ID,
            "name": "Jane Doe",
            "role": "CEO",
            "bio": "Jane leads Vyntics.",
            "photo_url": None,
            "linkedin_url": None,
            "display_order": 1,
            "member_type": "leadership",
        }
    )

    assert response.photo_url is None and response.linkedin_url is None
    assert set(response.model_dump()) == {
        "id", "name", "role", "bio", "photo_url", "linkedin_url",
        "display_order", "member_type",
    }
