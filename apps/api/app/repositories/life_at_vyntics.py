"""Life at Vyntics SQL queries using existing async sessions and transaction ownership."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.life_at_vyntics import LifeAtVyntics
from app.repositories.ordering import DisplayOrderRepositoryMixin

_ORDER = (LifeAtVyntics.display_order.asc(), LifeAtVyntics.created_at.asc(), LifeAtVyntics.id.asc())


class LifeAtVynticsRepository(DisplayOrderRepositoryMixin):
    ordering_model = LifeAtVyntics
    ordering_lock_key = "life_at_vyntics_display_order"

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[LifeAtVyntics]:
        return list((await self._session.scalars(select(LifeAtVyntics).order_by(*_ORDER))).all())

    async def get_by_id(self, resource_id: UUID) -> LifeAtVyntics | None:
        return await self._session.get(LifeAtVyntics, resource_id)

    async def add(self, resource: LifeAtVyntics) -> None:
        self._session.add(resource)
        await self._session.flush()

    async def refresh(self, resource: LifeAtVyntics) -> None:
        await self._session.flush()
        await self._session.refresh(resource)

    async def delete(self, resource: LifeAtVyntics) -> None:
        await self._session.delete(resource)
        await self._session.flush()
