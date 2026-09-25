"""Career request and public response schemas."""

from datetime import datetime
from typing import Annotated, TypeAlias
from uuid import UUID

from pydantic import Field, StringConstraints, field_validator

from app.schemas.common import JsonObject, RequestSchema, ResponseSchema


NonEmptyString: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]


class CareerCreateRequest(RequestSchema):
    """Client-controlled fields for creating a Career."""

    slug: NonEmptyString
    title: NonEmptyString
    location: NonEmptyString
    employment_type: NonEmptyString
    department: NonEmptyString
    experience: NonEmptyString
    short_description: NonEmptyString
    description: JsonObject
    responsibilities: JsonObject
    requirements: JsonObject
    nice_to_have: JsonObject = Field(default_factory=dict)
    benefits: JsonObject = Field(default_factory=dict)


class CareerUpdateRequest(RequestSchema):
    """Client-controlled fields that may be changed on a Career."""

    slug: NonEmptyString | None = None
    title: NonEmptyString | None = None
    location: NonEmptyString | None = None
    employment_type: NonEmptyString | None = None
    department: NonEmptyString | None = None
    experience: NonEmptyString | None = None
    short_description: NonEmptyString | None = None
    description: JsonObject | None = None
    responsibilities: JsonObject | None = None
    requirements: JsonObject | None = None
    nice_to_have: JsonObject | None = None
    benefits: JsonObject | None = None

    @field_validator(
        "slug",
        "title",
        "location",
        "employment_type",
        "department",
        "experience",
        "short_description",
        "description",
        "responsibilities",
        "requirements",
        "nice_to_have",
        "benefits",
    )
    @classmethod
    def reject_null_for_required_model_fields(cls, value: object) -> object:
        """Allow omission during PATCH but reject explicit null values."""

        if value is None:
            raise ValueError("field cannot be null")
        return value


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
