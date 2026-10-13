"""Stable service targeting values shared by Blog and Case Study contracts."""

from typing import Literal, TypeAlias

ServiceIdentifier: TypeAlias = Literal[
    "cloud_foundations",
    "data_engineering",
    "analytics_bi",
    "ai_solutions",
    "crm_revenue_ops",
]
RelatedService: TypeAlias = ServiceIdentifier | Literal["all"]
