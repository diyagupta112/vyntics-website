"""FAQ SQL queries using existing async sessions and transaction ownership."""

from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.faq import FAQ


class FAQRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_public(self, *, page: str | None = None) -> list[FAQ]:
        statement = select(FAQ).where(FAQ.is_active.is_(True)).order_by(FAQ.page.asc(), FAQ.display_order.asc(), FAQ.created_at.asc(), FAQ.id.asc())
        if page is not None:
            statement = statement.where(FAQ.page == page)
        return list((await self._session.scalars(statement)).all())

    async def list_all(self, *, page: str | None = None) -> list[FAQ]:
        statement = select(FAQ).order_by(FAQ.page.asc(), FAQ.display_order.asc(), FAQ.created_at.asc(), FAQ.id.asc())
        if page is not None:
            statement = statement.where(FAQ.page == page)
        return list((await self._session.scalars(statement)).all())

    async def get_by_id(self, resource_id: UUID) -> FAQ | None:
        return await self._session.get(FAQ, resource_id)

    async def add(self, resource: FAQ) -> None:
        self._session.add(resource)
        await self._session.flush()

    async def refresh(self, resource: FAQ) -> None:
        await self._session.flush()
        await self._session.refresh(resource)

    async def delete(self, resource: FAQ) -> None:
        await self._session.delete(resource)
