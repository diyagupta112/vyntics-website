"""Job Application database queries and persistence operations."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.job_application import JobApplication


class JobApplicationRepository:
    """Job Application data access without transaction commits."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[JobApplication]:
        """Return every application newest-first, including historical rows."""

        statement = select(JobApplication).order_by(
            JobApplication.submitted_at.desc()
        )
        result = await self._session.scalars(statement)
        return list(result.all())

    async def list_for_career(self, career_id: UUID) -> list[JobApplication]:
        """Return one Career's applications newest-first."""

        statement = (
            select(JobApplication)
            .where(JobApplication.career_id == career_id)
            .order_by(JobApplication.submitted_at.desc())
        )
        result = await self._session.scalars(statement)
        return list(result.all())

    async def get_by_id(self, application_id: UUID) -> JobApplication | None:
        """Return one application by database UUID."""

        return await self._session.get(JobApplication, application_id)

    async def add(self, application: JobApplication) -> None:
        """Stage a new application and flush it."""

        self._session.add(application)
        await self._session.flush()

    async def refresh(self, application: JobApplication) -> None:
        """Flush changes and reload database-managed fields."""

        await self._session.flush()
        await self._session.refresh(application)

    async def delete(self, application: JobApplication) -> None:
        """Stage a hard delete."""

        await self._session.delete(application)
