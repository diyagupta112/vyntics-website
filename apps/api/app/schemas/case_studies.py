"""Public case-study response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import AnyHttpUrl

from app.schemas.common import JsonObject, ResponseSchema


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
    content: JsonObject
    published_at: datetime
