"""Public team response schemas."""

from typing import Literal
from uuid import UUID

from pydantic import AnyHttpUrl

from app.schemas.common import ResponseSchema


class TeamMemberResponse(ResponseSchema):
    """A visible leadership or team profile."""

    id: UUID
    name: str
    role: str
    bio: str
    photo_url: AnyHttpUrl
    linkedin_url: AnyHttpUrl
    display_order: int
    member_type: Literal["leadership", "team"]


class TeamListResponse(ResponseSchema):
    """Public visible-team-list envelope."""

    data: list[TeamMemberResponse]
