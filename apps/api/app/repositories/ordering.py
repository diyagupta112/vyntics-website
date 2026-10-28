"""Shared display_order persistence: advisory lock, scoped count and range shifts.

A scope is a mapping of column name to value (None matches NULL). It limits every
operation to one logical sequence, for example one FAQ page and sub-page. An empty
scope means the whole table is one sequence.
"""

from collections.abc import Mapping
from typing import Any
from uuid import UUID

from sqlalchemy import func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

Scope = Mapping[str, object]


class DisplayOrderRepositoryMixin:
    """Mix into a repository that has `_session`; set `ordering_model` and `ordering_lock_key`."""

    _session: AsyncSession
    ordering_model: Any
    ordering_lock_key: str

    def _scope_conditions(self, scope: Scope | None) -> list[Any]:
        conditions = []
        for name, value in (scope or {}).items():
            column = getattr(self.ordering_model, name)
            conditions.append(column.is_(None) if value is None else column == value)
        return conditions

    async def lock_ordering(self) -> None:
        """Serialize ordering mutations on this table until the current transaction ends."""
        await self._session.execute(text("select pg_advisory_xact_lock(hashtext(:key))"), {"key": self.ordering_lock_key})

    async def count(self, scope: Scope | None = None) -> int:
        statement = select(func.count()).select_from(self.ordering_model).where(*self._scope_conditions(scope))
        return int(await self._session.scalar(statement) or 0)

    async def get_for_update(self, resource_id: UUID) -> Any | None:
        """Reload a row after the ordering lock so positions are current."""
        statement = select(self.ordering_model).where(self.ordering_model.id == resource_id).execution_options(populate_existing=True)
        return await self._session.scalar(statement)

    async def shift(self, *, delta: int, first: int, last: int | None = None, scope: Scope | None = None) -> None:
        """Move positions in [first, last] (open-ended when last is None) by delta, within scope."""
        model = self.ordering_model
        conditions = [*self._scope_conditions(scope), model.display_order >= first]
        if last is not None:
            conditions.append(model.display_order <= last)
        await self._session.execute(
            update(model).where(*conditions).values(display_order=model.display_order + delta).execution_options(synchronize_session=False)
        )
