"""Case Study database queries and persistence operations."""

from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.case_study import CaseStudy


class CaseStudyRepository:
    """Data-access operations for Case Studies without transaction commits."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_published(self) -> list[CaseStudy]:
        """Return published Case Studies ordered newest-first."""

        statement = (
            select(CaseStudy)
            .where(CaseStudy.status == "published")
            .order_by(CaseStudy.published_at.desc())
        )
        result = await self._session.scalars(statement)
        return list(result.all())

    async def list_all(self) -> list[CaseStudy]:
        """Return Case Studies in every publication status."""

        result = await self._session.scalars(select(CaseStudy))
        return list(result.all())

    async def get_published_by_slug(self, slug: str) -> CaseStudy | None:
        """Return one published Case Study by slug."""

        statement = select(CaseStudy).where(
            CaseStudy.slug == slug,
            CaseStudy.status == "published",
        )
        return await self._session.scalar(statement)

    async def get_by_id(self, case_study_id: UUID) -> CaseStudy | None:
        """Return one Case Study by its database identifier."""

        return await self._session.get(CaseStudy, case_study_id)

    async def slug_exists(
        self,
        slug: str,
        *,
        exclude_id: UUID | None = None,
    ) -> bool:
        """Check whether a slug belongs to another Case Study."""

        statement = select(CaseStudy.id).where(CaseStudy.slug == slug)
        if exclude_id is not None:
            statement = statement.where(CaseStudy.id != exclude_id)
        return await self._session.scalar(statement) is not None

    async def count_featured_for_update(self, *, exclude_id: UUID | None = None) -> int:
        """Serialize slot claims until transaction end, then count featured records.

        PostgreSQL READ COMMITTED takes a fresh snapshot for the count after
        the lock statement. Distinct keys keep Blog and Case Study slots separate.
        Call before staging mutations; the service owns commit/rollback.
        """

        await self._session.execute(
            text("SELECT pg_advisory_xact_lock(1448693332, 2)")
        )
        statement = select(func.count()).select_from(CaseStudy).where(
            CaseStudy.featured.is_(True),
        )
        if exclude_id is not None:
            statement = statement.where(CaseStudy.id != exclude_id)
        return await self._session.scalar(statement)

    async def add(self, case_study: CaseStudy) -> None:
        """Stage a Case Study and flush database-generated fields."""

        self._session.add(case_study)
        await self._session.flush()

    async def delete(self, case_study: CaseStudy) -> None:
        """Stage a hard delete for a Case Study."""

        await self._session.delete(case_study)

    async def refresh(self, case_study: CaseStudy) -> None:
        """Flush changes and reload database-managed fields."""

        await self._session.flush()
        await self._session.refresh(case_study)
