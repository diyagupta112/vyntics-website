"""Public career response schemas."""

from datetime import datetime
from uuid import UUID

from app.schemas.common import JsonObject, ResponseSchema


class CareerListItem(ResponseSchema):
    """A career opportunity shown in the public listing."""

    id: UUID
    slug: str
    title: str
    location: str
    employment_type: str
    department: str
    experience: str
    short_description: str
    published_at: datetime


class CareerListResponse(ResponseSchema):
    """Public career-list envelope."""

    data: list[CareerListItem]


class CareerDetailResponse(ResponseSchema):
    """A career opportunity with its structured detail sections."""

    id: UUID
    slug: str
    title: str
    location: str
    employment_type: str
    department: str
    experience: str
    short_description: str
    description: JsonObject
    responsibilities: JsonObject
    requirements: JsonObject
    nice_to_have: JsonObject
    benefits: JsonObject
    published_at: datetime
