"""Testimonial request and public/admin response contracts."""

from datetime import datetime
from typing import Annotated, TypeAlias
from uuid import UUID

from pydantic import AnyHttpUrl, StringConstraints, field_validator

from app.schemas.common import RequestSchema, ResponseSchema

NonEmptyText: TypeAlias = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class TestimonialCreateRequest(RequestSchema):
    quote: NonEmptyText
    author_name: NonEmptyText
    author_role: NonEmptyText | None = None
    company_name: NonEmptyText | None = None
    company_logo_url: AnyHttpUrl | None = None
    display_order: int = 0
    is_active: bool = True


class TestimonialUpdateRequest(RequestSchema):
    quote: NonEmptyText | None = None
    author_name: NonEmptyText | None = None
    author_role: NonEmptyText | None = None
    company_name: NonEmptyText | None = None
    company_logo_url: AnyHttpUrl | None = None
    display_order: int | None = None
    is_active: bool | None = None

    @field_validator("quote", "author_name", "display_order", "is_active")
    @classmethod
    def reject_null_required_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("field cannot be null")
        return value


class TestimonialPublicItem(ResponseSchema):
    id: UUID
    quote: str
    author_name: str
    author_role: str | None
    company_name: str | None
    company_logo_url: AnyHttpUrl | None
    display_order: int


class TestimonialListResponse(ResponseSchema):
    data: list[TestimonialPublicItem]


class TestimonialAdminResponse(TestimonialPublicItem):
    is_active: bool
    created_at: datetime
    updated_at: datetime
