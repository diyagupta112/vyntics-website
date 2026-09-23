"""Shared configuration and structured-content types for API schemas."""

from typing import TypeAlias

from pydantic import BaseModel, ConfigDict, JsonValue


JsonObject: TypeAlias = dict[str, JsonValue]


class RequestSchema(BaseModel):
    """Base for client-controlled inputs with undeclared fields rejected."""

    model_config = ConfigDict(extra="forbid")


class ResponseSchema(BaseModel):
    """Base for public responses populated from mappings or ORM attributes."""

    model_config = ConfigDict(extra="forbid", from_attributes=True)
