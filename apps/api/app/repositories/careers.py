"""Career database queries and persistence operations."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.career import Career


class CareerRepository:
    """Data-access operations for Careers without transaction commits."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[Career]:
        """Return every Career ordered newest-first."""

        statement = select(Career).order_by(Career.published_at.desc())
        result = await self._session.scalars(statement)
        return list(result.all())

    async def get_by_slug(self, slug: str) -> Career | None:
        """Return one Career by its exact stored slug."""

        return await self._session.scalar(select(Career).where(Career.slug == slug))

    async def get_by_id(self, career_id: UUID) -> Career | None:
        """Return one Career by its database identifier."""

        return await self._session.get(Career, career_id)

    async def slug_exists(
        self,
        slug: str,
        *,
        exclude_id: UUID | None = None,
    ) -> bool:
        """Check whether the exact slug belongs to another Career."""

        statement = select(Career.id).where(Career.slug == slug)
        if exclude_id is not None:
            statement = statement.where(Career.id != exclude_id)
        return await self._session.scalar(statement) is not None

    async def add(self, career: Career) -> None:
        """Stage a Career and flush database-generated fields."""

        self._session.add(career)
        await self._session.flush()

    async def refresh(self, career: Career) -> None:
        """Flush changes and reload database-managed fields."""

        await self._session.flush()
        await self._session.refresh(career)

    async def delete(self, career: Career) -> None:
        """Stage a hard delete for a Career."""

        await self._session.delete(career)
