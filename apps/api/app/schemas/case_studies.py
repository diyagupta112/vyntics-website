"""Case Study request and response schemas."""

from datetime import datetime
from typing import Annotated, Literal, TypeAlias
from uuid import UUID

from pydantic import AliasChoices, Field, AnyHttpUrl, StringConstraints, field_validator, model_validator

from app.schemas.common import RequestSchema, ResponseSchema
from app.schemas.content import BodyContent, StoredBodyContent


CaseStudyStatus: TypeAlias = Literal["draft", "published", "unpublished"]
NonEmptyString: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]


class CaseStudyCreateRequest(RequestSchema):
    """Client-controlled fields for creating a Case Study."""

    slug: NonEmptyString
    title: NonEmptyString
    seo_title: NonEmptyString
    meta_description: NonEmptyString
    client_name: NonEmptyString
    excerpt: NonEmptyString
    cover_image_url: AnyHttpUrl | None = None
    tech_stack: list[str]
    tags: list[str]
    content: BodyContent
    status: CaseStudyStatus
    featured: bool = Field(default=False, validation_alias=AliasChoices("featured", "is_featured"))

    @model_validator(mode="after")
    def require_published_cover_image(self) -> "CaseStudyCreateRequest":
        """Require a cover image for content entering the published state."""

        if self.status == "published" and self.cover_image_url is None:
            raise ValueError(
                "cover_image_url is required for published Case Studies"
            )
        return self


class CaseStudyUpdateRequest(RequestSchema):
    """Client-controlled fields that may be changed on a Case Study."""

    slug: NonEmptyString | None = None
    title: NonEmptyString | None = None
    seo_title: NonEmptyString | None = None
    meta_description: NonEmptyString | None = None
    client_name: NonEmptyString | None = None
    excerpt: NonEmptyString | None = None
    cover_image_url: AnyHttpUrl | None = None
    tech_stack: list[str] | None = None
    tags: list[str] | None = None
    content: BodyContent | None = None
    status: CaseStudyStatus | None = None
    featured: bool | None = Field(default=None, validation_alias=AliasChoices("featured", "is_featured"))

    @field_validator(
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
        "featured",
    )
    @classmethod
    def reject_null_for_required_model_fields(cls, value: object) -> object:
        """Allow omission during PATCH but reject explicit null values."""

        if value is None:
            raise ValueError("field cannot be null")
        return value


class CaseStudyListItem(ResponseSchema):
    """A lightweight published case study shown in public listings."""

    id: UUID
    slug: str
    title: str
    client_name: str
    excerpt: str
    cover_image_url: AnyHttpUrl
    tech_stack: list[str]
    tags: list[str]
    featured: bool
    published_at: datetime


class CaseStudyListResponse(ResponseSchema):
    """Public case-study-list envelope."""

    data: list[CaseStudyListItem]


class CaseStudyDetailResponse(ResponseSchema):
    """A published case study with SEO metadata and structured content."""

    id: UUID
    slug: str
    title: str
    seo_title: str
    meta_description: str
    client_name: str
    excerpt: str
    cover_image_url: AnyHttpUrl
    tech_stack: list[str]
    tags: list[str]
    content: StoredBodyContent
    featured: bool
    published_at: datetime


class CaseStudyAdminResponse(ResponseSchema):
    """Administrative Case Study response without ownership fields."""

    id: UUID
    slug: str
    title: str
    seo_title: str
    meta_description: str
    client_name: str
    excerpt: str
    cover_image_url: AnyHttpUrl | None
    tech_stack: list[str]
    tags: list[str]
    content: StoredBodyContent
    status: CaseStudyStatus
    featured: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
