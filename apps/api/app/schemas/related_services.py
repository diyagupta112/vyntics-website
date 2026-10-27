"""Stable service targeting values shared by Blog and Case Study contracts."""

from typing import Annotated, Literal, TypeAlias

from pydantic import AfterValidator, BeforeValidator, Field, StringConstraints

ServiceIdentifier: TypeAlias = Literal[
    "cloud_foundations",
    "data_engineering",
    "analytics_bi",
    "ai_solutions",
    "crm_revenue_ops",
]
# Sub-services are open-ended keys (no table or enum), so only their shape is fixed.
SubServiceIdentifier: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=100, pattern=r"^[a-z0-9]+(_[a-z0-9]+)*$"),
]
MAX_SUB_SERVICES = 50


def _blank_to_empty(value: object) -> object:
    return [] if value is None else value


def _trim_items(value: object) -> object:
    if isinstance(value, list):
        return [item.strip() if isinstance(item, str) else item for item in value]
    return value


def _unique_in_order(values: list[str]) -> list[str]:
    return list(dict.fromkeys(values))


RelatedServices: TypeAlias = Annotated[
    list[ServiceIdentifier],
    BeforeValidator(_blank_to_empty),
    BeforeValidator(_trim_items),
    AfterValidator(_unique_in_order),
]
RelatedSubServices: TypeAlias = Annotated[
    list[SubServiceIdentifier],
    Field(max_length=MAX_SUB_SERVICES),
    BeforeValidator(_blank_to_empty),
    BeforeValidator(_trim_items),
    AfterValidator(_unique_in_order),
]
