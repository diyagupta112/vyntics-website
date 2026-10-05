"""Public blog response schemas."""

from datetime import datetime
from typing import Annotated, Literal, TypeAlias
from uuid import UUID

from pydantic import AnyHttpUrl, StringConstraints, field_validator, model_validator

from app.schemas.common import RequestSchema, ResponseSchema
from app.schemas.content import BodyContent, StoredBodyContent


BlogStatus: TypeAlias = Literal["draft", "published", "unpublished"]
NonEmptyString: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]


class BlogCreateRequest(RequestSchema):
    """Client-controlled fields for creating a Blog."""

    slug: NonEmptyString
    title: NonEmptyString
    seo_title: NonEmptyString
    meta_description: NonEmptyString
    author: NonEmptyString
    category: NonEmptyString
    excerpt: NonEmptyString
    cover_image_url: AnyHttpUrl | None = None
    read_time: int
    content: BodyContent
    status: BlogStatus
    is_featured: bool = False

    @model_validator(mode="after")
    def require_published_cover_image(self) -> "BlogCreateRequest":
        """Require a cover image for content entering the published state."""

        if self.status == "published" and self.cover_image_url is None:
            raise ValueError("cover_image_url is required for published Blogs")
        return self


class BlogUpdateRequest(RequestSchema):
    """Client-controlled fields that may be changed on an existing Blog."""

    slug: NonEmptyString | None = None
    title: NonEmptyString | None = None
    seo_title: NonEmptyString | None = None
    meta_description: NonEmptyString | None = None
    author: NonEmptyString | None = None
    category: NonEmptyString | None = None
    excerpt: NonEmptyString | None = None
    cover_image_url: AnyHttpUrl | None = None
    read_time: int | None = None
    content: BodyContent | None = None
    status: BlogStatus | None = None
    is_featured: bool | None = None

    @field_validator(
        "slug",
        "title",
        "seo_title",
        "meta_description",
        "author",
        "category",
        "excerpt",
        "read_time",
        "content",
        "status",
        "is_featured",
    )
    @classmethod
    def reject_null_for_required_model_fields(cls, value: object) -> object:
        """Allow omission during PATCH but reject explicit null values."""

        if value is None:
            raise ValueError("field cannot be null")
        return value


class BlogListItem(ResponseSchema):
    """A lightweight published blog shown in public listings."""

    id: UUID
    slug: str
    title: str
    author: str
    category: str
    excerpt: str
    cover_image_url: AnyHttpUrl
    read_time: int
    is_featured: bool
    published_at: datetime


class BlogListResponse(ResponseSchema):
    """Public blog-list envelope."""

    data: list[BlogListItem]


class BlogDetailResponse(ResponseSchema):
    """A published blog with SEO metadata and structured content."""

    id: UUID
    slug: str
    title: str
    seo_title: str
    meta_description: str
    author: str
    category: str
    excerpt: str
    cover_image_url: AnyHttpUrl
    read_time: int
    content: StoredBodyContent
    is_featured: bool
    published_at: datetime


class BlogAdminResponse(ResponseSchema):
    """Confirmed admin response for Blog create and update operations."""

    id: UUID
    slug: str
    title: str
    seo_title: str
    meta_description: str
    author: str
    category: str
    excerpt: str
    cover_image_url: AnyHttpUrl | None
    read_time: int
    content: StoredBodyContent
    status: BlogStatus
    is_featured: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
