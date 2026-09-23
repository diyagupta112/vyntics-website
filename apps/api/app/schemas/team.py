"""Team Member request and shared response schemas."""

from typing import Annotated, Literal, TypeAlias
from uuid import UUID

from pydantic import AnyHttpUrl, StringConstraints, field_validator

from app.schemas.common import RequestSchema, ResponseSchema


TeamMemberType: TypeAlias = Literal["leadership", "team"]
NonEmptyString: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]


class TeamMemberCreateRequest(RequestSchema):
    """Client-controlled fields for creating a Team member."""

    name: NonEmptyString
    role: NonEmptyString
    bio: NonEmptyString
    photo_url: AnyHttpUrl | None = None
    linkedin_url: AnyHttpUrl | None = None
    display_order: int
    member_type: TeamMemberType


class TeamMemberUpdateRequest(RequestSchema):
    """Client-controlled fields that may be changed on a Team member."""

    name: NonEmptyString | None = None
    role: NonEmptyString | None = None
    bio: NonEmptyString | None = None
    photo_url: AnyHttpUrl | None = None
    linkedin_url: AnyHttpUrl | None = None
    display_order: int | None = None
    member_type: TeamMemberType | None = None

    @field_validator("name", "role", "bio", "display_order", "member_type")
    @classmethod
    def reject_null_for_required_model_fields(cls, value: object) -> object:
        """Allow omission during PATCH but reject null for required columns."""

        if value is None:
            raise ValueError("field cannot be null")
        return value


class TeamMemberResponse(ResponseSchema):
    """A leadership or team profile shared by both clients."""

    id: UUID
    name: str
    role: str
    bio: str
    photo_url: AnyHttpUrl | None
    linkedin_url: AnyHttpUrl | None
    display_order: int
    member_type: TeamMemberType


class TeamListResponse(ResponseSchema):
    """Shared Team-member-list envelope."""

    data: list[TeamMemberResponse]
