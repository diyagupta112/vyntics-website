"""Badge database queries and persistence operations."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.badge import Badge


class BadgeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_public(self) -> list[Badge]:
        statement = (
            select(Badge)
            .where(Badge.is_active.is_(True))
            .order_by(
                Badge.display_order.asc(),
                Badge.created_at.asc(),
                Badge.id.asc(),
            )
        )
        return list((await self._session.scalars(statement)).all())

    async def list_all(self) -> list[Badge]:
        statement = select(Badge).order_by(
            Badge.display_order.asc(),
            Badge.created_at.asc(),
            Badge.id.asc(),
        )
        return list((await self._session.scalars(statement)).all())

    async def get_by_id(self, badge_id: UUID) -> Badge | None:
        return await self._session.get(Badge, badge_id)

    async def add(self, badge: Badge) -> None:
        self._session.add(badge)
        await self._session.flush()

    async def refresh(self, badge: Badge) -> None:
        await self._session.flush()
        await self._session.refresh(badge)

    async def delete(self, badge: Badge) -> None:
        await self._session.delete(badge)
