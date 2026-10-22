"""Life at Vyntics request and public/admin response contracts."""

from datetime import datetime
from typing import Annotated, TypeAlias
from uuid import UUID

from pydantic import StrictBool, StrictInt, StringConstraints, field_validator

from app.schemas.common import RequestSchema, ResponseSchema

NonEmptyText: TypeAlias = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class LifeAtVynticsCreateRequest(RequestSchema):
    title: NonEmptyText
    description: str | None = None
    display_order: StrictInt = 0
    is_active: StrictBool = True


class LifeAtVynticsUpdateRequest(RequestSchema):
    title: NonEmptyText | None = None
    description: str | None = None
    display_order: StrictInt | None = None
    is_active: StrictBool | None = None

    @field_validator("title", "display_order", "is_active")
    @classmethod
    def reject_null_required_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("field cannot be null")
        return value


class LifeAtVynticsPublicItem(ResponseSchema):
    id: UUID
    title: str
    description: str | None
    image_url: str | None
    display_order: int


class LifeAtVynticsListResponse(ResponseSchema):
    data: list[LifeAtVynticsPublicItem]


class LifeAtVynticsAdminResponse(LifeAtVynticsPublicItem):
    is_active: bool
    created_at: datetime
    updated_at: datetime
