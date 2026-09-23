"""Contact Submission database queries and persistence operations."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.contact_submission import ContactSubmission


class ContactSubmissionRepository:
    """Contact Submission data access without transaction commits."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[ContactSubmission]:
        """Return all submissions newest-first."""

        statement = select(ContactSubmission).order_by(
            ContactSubmission.submitted_at.desc()
        )
        result = await self._session.scalars(statement)
        return list(result.all())

    async def get_by_id(
        self,
        submission_id: UUID,
    ) -> ContactSubmission | None:
        """Return one submission by its database UUID."""

        return await self._session.get(ContactSubmission, submission_id)

    async def add(self, submission: ContactSubmission) -> None:
        """Stage a submission and flush database-generated fields."""

        self._session.add(submission)
        await self._session.flush()

    async def refresh(self, submission: ContactSubmission) -> None:
        """Reload database-generated values after flushing."""

        await self._session.refresh(submission)

    async def delete(self, submission: ContactSubmission) -> None:
        """Stage a hard delete for a submission."""

        await self._session.delete(submission)
