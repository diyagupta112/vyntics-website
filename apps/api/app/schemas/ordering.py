"""Shared display_order request type: a 1-based position; omitted on create means append."""

from typing import Annotated, TypeAlias

from pydantic import Field

Position: TypeAlias = Annotated[int, Field(strict=True, ge=1)]


def reject_explicit_null_display_order(model):
    """Create requests may omit display_order but not send null."""
    if "display_order" in model.model_fields_set and model.display_order is None:
        raise ValueError("display_order cannot be null")
    return model
