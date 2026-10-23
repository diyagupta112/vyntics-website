"""Life at Vyntics image-gallery request and response contracts."""

from datetime import datetime
from typing import Annotated, TypeAlias
from uuid import UUID

from pydantic import Field, field_validator, model_validator

from app.schemas.common import RequestSchema, ResponseSchema

Position: TypeAlias = Annotated[int, Field(strict=True, ge=1)]


class LifeAtVynticsCreateRequest(RequestSchema):
    """Omitted display_order appends; a supplied one inserts and shifts the rest."""

    display_order: Position | None = None

    @model_validator(mode="after")
    def reject_explicit_null(self) -> "LifeAtVynticsCreateRequest":
        if "display_order" in self.model_fields_set and self.display_order is None:
            raise ValueError("display_order cannot be null")
        return self


class LifeAtVynticsUpdateRequest(RequestSchema):
    display_order: Position | None = None

    @field_validator("display_order")
    @classmethod
    def reject_null(cls, value: object) -> object:
        if value is None:
            raise ValueError("field cannot be null")
        return value


class LifeAtVynticsResponse(ResponseSchema):
    id: UUID
    image_url: str | None
    display_order: int
    created_at: datetime
    updated_at: datetime


class LifeAtVynticsListResponse(ResponseSchema):
    data: list[LifeAtVynticsResponse]
