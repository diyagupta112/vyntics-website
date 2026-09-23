"""Public blog response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import AnyHttpUrl

from app.schemas.common import JsonObject, ResponseSchema


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
    content: JsonObject
    published_at: datetime
