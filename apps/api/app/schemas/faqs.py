"""FAQ contracts with open-ended canonical page paths, never a page enum."""

from datetime import datetime
from typing import Annotated, TypeAlias
from uuid import UUID

from pydantic import Field, StringConstraints, field_validator, model_validator

from app.schemas.common import RequestSchema, ResponseSchema
from app.schemas.ordering import Position, reject_explicit_null_display_order

PAGE_KEY_PATTERN = r"^[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)*$"
PageKey: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=255, pattern=PAGE_KEY_PATTERN),
    Field(description="Canonical lowercase page path without a leading slash, domain, query or fragment. New page paths do not require a migration.", examples=["services/cloud-foundations", "careers", "technologies/data-platform"]),
]
SubPageKey: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=255, pattern=PAGE_KEY_PATTERN),
    Field(description="Optional stable key of a sub-page within the page, using the same format as page. New sub-pages do not require a migration. Null targets the main page.", examples=["cloud-migration"]),
]
NonEmptyText: TypeAlias = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class FAQCreateRequest(RequestSchema):
    page: PageKey
    sub_page: SubPageKey | None = None
    question: NonEmptyText
    answer: NonEmptyText
    display_order: Position | None = None  # omitted appends within the page and sub-page
    is_active: bool = True

    no_null_order = model_validator(mode="after")(reject_explicit_null_display_order)


class FAQUpdateRequest(RequestSchema):
    page: PageKey | None = None
    sub_page: SubPageKey | None = None  # explicit null clears; omitted keeps
    question: NonEmptyText | None = None
    answer: NonEmptyText | None = None
    display_order: Position | None = None
    is_active: bool | None = None

    @field_validator("page", "question", "answer", "display_order", "is_active")
    @classmethod
    def reject_null_required_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("field cannot be null")
        return value


class FAQPublicItem(ResponseSchema):
    id: UUID
    page: str
    sub_page: str | None = None
    question: str
    answer: str
    display_order: int


class FAQListResponse(ResponseSchema):
    data: list[FAQPublicItem]


class FAQAdminResponse(FAQPublicItem):
    is_active: bool
    created_at: datetime
    updated_at: datetime
