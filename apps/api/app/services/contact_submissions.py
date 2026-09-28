"""Contact Submission application logic and transaction boundaries."""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.contact_submission import ContactSubmission
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.contact_submissions import ContactSubmissionRepository
from app.schemas.contact import ContactCreateRequest


class ContactSubmissionNotFoundError(LookupError):
    """Raised when an administrative operation cannot find a submission."""


class ContactSubmissionService:
    """Coordinate Contact Submission persistence and delete auditing."""

    def __init__(
        self,
        session: AsyncSession,
        *,
        contact_repository: ContactSubmissionRepository | None = None,
        audit_repository: AuditLogRepository | None = None,
    ) -> None:
        self._session = session
        self._contacts = contact_repository or ContactSubmissionRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)

    async def create(self, request: ContactCreateRequest) -> ContactSubmission:
        """Persist a public submission with backend-controlled initial state."""

        submission = ContactSubmission(
            **request.model_dump(mode="json"),
            status="new",
        )
        try:
            await self._contacts.add(submission)
            await self._contacts.refresh(submission)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        return submission

    async def list_all(self) -> list[ContactSubmission]:
        """Return all submissions for future authenticated administration."""

        return await self._contacts.list_all()

    async def get_by_id(self, submission_id: UUID) -> ContactSubmission:
        """Return one submission or raise the administrative not-found error."""

        submission = await self._contacts.get_by_id(submission_id)
        if submission is None:
            raise ContactSubmissionNotFoundError
        return submission

    async def delete(
        self,
        submission_id: UUID,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> None:
        """Hard-delete and audit a submission in one transaction."""

        submission = await self._contacts.get_by_id(submission_id)
        if submission is None:
            raise ContactSubmissionNotFoundError

        audit_log = AuditLog(
            actor_id=actor.admin_id if actor is not None else None,
            actor_email=actor.admin_email if actor is not None else None,
            action="delete",
            resource_type="contact_submission",
            resource_id=submission.id,
            context={"status": submission.status},
        )

        try:
            await self._contacts.delete(submission)
            await self._audit_logs.add(audit_log)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
