"""Life at Vyntics SQL queries using existing async sessions and transaction ownership."""

from uuid import UUID

from sqlalchemy import func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.life_at_vyntics import LifeAtVyntics

_ORDER = (LifeAtVyntics.display_order.asc(), LifeAtVyntics.created_at.asc(), LifeAtVyntics.id.asc())
_ORDERING_LOCK = "life_at_vyntics_display_order"


class LifeAtVynticsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[LifeAtVyntics]:
        return list((await self._session.scalars(select(LifeAtVyntics).order_by(*_ORDER))).all())

    async def get_by_id(self, resource_id: UUID) -> LifeAtVyntics | None:
        return await self._session.get(LifeAtVyntics, resource_id)

    async def lock_ordering(self) -> None:
        """Serialize ordering mutations until the current transaction ends."""
        await self._session.execute(text("select pg_advisory_xact_lock(hashtext(:key))"), {"key": _ORDERING_LOCK})

    async def count(self) -> int:
        return int(await self._session.scalar(select(func.count()).select_from(LifeAtVyntics)) or 0)

    async def get_for_update(self, resource_id: UUID) -> LifeAtVyntics | None:
        """Reload a row after the ordering lock so positions are current."""
        statement = select(LifeAtVyntics).where(LifeAtVyntics.id == resource_id).execution_options(populate_existing=True)
        return await self._session.scalar(statement)

    async def shift(self, *, delta: int, first: int, last: int | None = None) -> None:
        """Move positions in [first, last] (open-ended when last is None) by delta."""
        condition = [LifeAtVyntics.display_order >= first]
        if last is not None:
            condition.append(LifeAtVyntics.display_order <= last)
        await self._session.execute(
            update(LifeAtVyntics).where(*condition).values(display_order=LifeAtVyntics.display_order + delta).execution_options(synchronize_session=False)
        )

    async def add(self, resource: LifeAtVyntics) -> None:
        self._session.add(resource)
        await self._session.flush()

    async def refresh(self, resource: LifeAtVyntics) -> None:
        await self._session.flush()
        await self._session.refresh(resource)

    async def delete(self, resource: LifeAtVyntics) -> None:
        await self._session.delete(resource)
        await self._session.flush()
