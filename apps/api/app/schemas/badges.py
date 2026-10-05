"""Badge request and response schemas."""

from datetime import datetime
from typing import Annotated, TypeAlias
from uuid import UUID

from pydantic import (
    AfterValidator,
    AnyHttpUrl,
    StringConstraints,
    TypeAdapter,
    field_validator,
)

from app.schemas.common import RequestSchema, ResponseSchema


Name: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=200),
]
Description: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=1000),
]


def _validate_website_url(value: str) -> str:
    """Validate an absolute HTTP(S) URL while preserving the supplied text."""

    TypeAdapter(AnyHttpUrl).validate_python(value)
    return value


WebsiteUrl: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=2048),
    AfterValidator(_validate_website_url),
]


class BadgeCreateRequest(RequestSchema):
    name: Name
    description: Description | None = None
    website_url: WebsiteUrl | None = None
    display_order: int
    is_active: bool


class BadgeUpdateRequest(RequestSchema):
    name: Name | None = None
    description: Description | None = None
    website_url: WebsiteUrl | None = None
    display_order: int | None = None
    is_active: bool | None = None

    @field_validator("name", "display_order", "is_active")
    @classmethod
    def reject_null_required_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("field cannot be null")
        return value


class BadgePublicItem(ResponseSchema):
    id: UUID
    name: str
    description: str | None
    logo_url: AnyHttpUrl | None
    website_url: str | None
    display_order: int


class BadgeListResponse(ResponseSchema):
    data: list[BadgePublicItem]


class BadgeAdminResponse(ResponseSchema):
    id: UUID
    name: str
    description: str | None
    logo_url: AnyHttpUrl | None
    website_url: str | None
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
