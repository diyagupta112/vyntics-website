"""Career application logic and transaction boundaries."""

from collections.abc import Callable
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.career import Career
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.careers import CareerRepository
from app.schemas.careers import CareerCreateRequest, CareerUpdateRequest


class CareerNotFoundError(LookupError):
    """Raised when a requested Career does not exist."""


class CareerSlugConflictError(ValueError):
    """Raised when a Career slug is already in use."""


class CareerService:
    """Coordinate Career rules, persistence, auditing, and transactions."""

    def __init__(
        self,
        session: AsyncSession,
        *,
        career_repository: CareerRepository | None = None,
        audit_repository: AuditLogRepository | None = None,
        clock: Callable[[], datetime] | None = None,
    ) -> None:
        self._session = session
        self._careers = career_repository or CareerRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)
        self._clock = clock or (lambda: datetime.now(timezone.utc))

    async def list_all(self) -> list[Career]:
        """Return every existing Career in repository-defined order."""

        return await self._careers.list_all()

    async def get_by_slug(self, slug: str) -> Career:
        """Return one Career by slug or raise the domain not-found error."""

        career = await self._careers.get_by_slug(slug)
        if career is None:
            raise CareerNotFoundError
        return career

    async def create(
        self,
        request: CareerCreateRequest,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> Career:
        """Create and audit a Career in one transaction."""

        if await self._careers.slug_exists(request.slug):
            raise CareerSlugConflictError

        career = Career(
            **request.model_dump(mode="json"),
            published_at=self._clock(),
        )
        try:
            await self._careers.add(career)
            await self._audit_logs.add(
                self._build_audit_log(
                    action="create",
                    career=career,
                    context=self._safe_context(career),
                    actor=actor,
                )
            )
            await self._careers.refresh(career)
            await self._session.commit()
        except IntegrityError as error:
            await self._session.rollback()
            raise CareerSlugConflictError from error
        except Exception:
            await self._session.rollback()
            raise
        return career

    async def update(
        self,
        career_id: UUID,
        request: CareerUpdateRequest,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> Career:
        """Apply supplied Career fields while preserving publication time."""

        career = await self._careers.get_by_id(career_id)
        if career is None:
            raise CareerNotFoundError

        updates = request.model_dump(exclude_unset=True, mode="json")
        next_slug = updates.get("slug", career.slug)
        if next_slug != career.slug and await self._careers.slug_exists(
            next_slug,
            exclude_id=career.id,
        ):
            raise CareerSlugConflictError

        changed_fields: list[str] = []
        for field_name, value in updates.items():
            if getattr(career, field_name) != value:
                setattr(career, field_name, value)
                changed_fields.append(field_name)

        if not changed_fields:
            return career

        context = self._safe_context(career)
        context["changed_fields"] = sorted(changed_fields)
        try:
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    career=career,
                    context=context,
                    actor=actor,
                )
            )
            await self._careers.refresh(career)
            await self._session.commit()
        except IntegrityError as error:
            await self._session.rollback()
            raise CareerSlugConflictError from error
        except Exception:
            await self._session.rollback()
            raise
        return career

    async def delete(
        self,
        career_id: UUID,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> None:
        """Hard-delete and audit a Career while preserving applications."""

        career = await self._careers.get_by_id(career_id)
        if career is None:
            raise CareerNotFoundError

        audit_log = self._build_audit_log(
            action="delete",
            career=career,
            context=self._safe_context(career),
            actor=actor,
        )
        try:
            await self._careers.delete(career)
            await self._audit_logs.add(audit_log)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

    @staticmethod
    def _safe_context(career: Career) -> dict[str, object]:
        """Return non-sensitive metadata suitable for audit context."""

        return {
            "slug": career.slug,
            "department": career.department,
            "employment_type": career.employment_type,
        }

    @staticmethod
    def _build_audit_log(
        *,
        action: str,
        career: Career,
        context: dict[str, object],
        actor: AuthenticatedAdmin | None = None,
    ) -> AuditLog:
        """Build the approved Career audit record."""

        return AuditLog(
            actor_id=actor.admin_id if actor is not None else None,
            actor_email=actor.admin_email if actor is not None else None,
            action=action,
            resource_type="career",
            resource_id=career.id,
            context=context,
        )
