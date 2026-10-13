"""Testimonial SQL queries using existing async sessions and transaction ownership."""

from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.testimonial import Testimonial


class TestimonialRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_public(self) -> list[Testimonial]:
        statement = select(Testimonial).where(Testimonial.is_active.is_(True)).order_by(Testimonial.display_order.asc(), Testimonial.created_at.asc(), Testimonial.id.asc())
        return list((await self._session.scalars(statement)).all())

    async def list_all(self) -> list[Testimonial]:
        statement = select(Testimonial).order_by(Testimonial.display_order.asc(), Testimonial.created_at.asc(), Testimonial.id.asc())
        return list((await self._session.scalars(statement)).all())

    async def get_by_id(self, resource_id: UUID) -> Testimonial | None:
        return await self._session.get(Testimonial, resource_id)

    async def add(self, resource: Testimonial) -> None:
        self._session.add(resource)
        await self._session.flush()

    async def refresh(self, resource: Testimonial) -> None:
        await self._session.flush()
        await self._session.refresh(resource)

    async def delete(self, resource: Testimonial) -> None:
        await self._session.delete(resource)
