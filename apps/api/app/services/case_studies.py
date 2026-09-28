"""Case Study application logic and transaction boundaries."""

import logging
from collections.abc import Callable
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile

from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.case_study import CaseStudy
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.case_studies import CaseStudyRepository
from app.schemas.case_studies import (
    CaseStudyCreateRequest,
    CaseStudyUpdateRequest,
)
from app.storage.supabase import StorageConfigurationError, StorageError
from app.storage.uploads import PublicImageStorage


logger = logging.getLogger(__name__)


class CaseStudyNotFoundError(LookupError):
    """Raised when a Case Study does not exist in the required scope."""


class CaseStudySlugConflictError(ValueError):
    """Raised when a Case Study slug is already in use."""


class CaseStudyValidationError(ValueError):
    """Raised when state-dependent Case Study validation fails."""


class CaseStudyService:
    """Coordinate Case Study rules, persistence, auditing, and transactions."""

    def __init__(
        self,
        session: AsyncSession,
        *,
        case_study_repository: CaseStudyRepository | None = None,
        audit_repository: AuditLogRepository | None = None,
        clock: Callable[[], datetime] | None = None,
        image_storage: PublicImageStorage | None = None,
    ) -> None:
        self._session = session
        self._case_studies = case_study_repository or CaseStudyRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)
        self._clock = clock or (lambda: datetime.now(timezone.utc))
        self._image_storage = image_storage

    async def list_published(self) -> list[CaseStudy]:
        """Return Case Studies eligible for public listing."""

        return await self._case_studies.list_published()

    async def list_all(self) -> list[CaseStudy]:
        """Return all Case Studies for future authenticated administration."""

        return await self._case_studies.list_all()

    async def get_by_id(self, case_study_id: UUID) -> CaseStudy:
        """Return one Case Study by UUID regardless of publication status."""

        case_study = await self._case_studies.get_by_id(case_study_id)
        if case_study is None:
            raise CaseStudyNotFoundError
        return case_study

    async def get_published_by_slug(self, slug: str) -> CaseStudy:
        """Return a published Case Study or raise the public not-found error."""

        case_study = await self._case_studies.get_published_by_slug(slug)
        if case_study is None:
            raise CaseStudyNotFoundError
        return case_study

    async def create(
        self,
        request: CaseStudyCreateRequest,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> CaseStudy:
        """Create and audit a Case Study in one transaction."""

        if await self._case_studies.slug_exists(request.slug):
            raise CaseStudySlugConflictError

        values = request.model_dump(mode="json")
        published_at = self._clock() if request.status == "published" else None
        case_study = CaseStudy(**values, published_at=published_at)

        try:
            await self._case_studies.add(case_study)
            await self._audit_logs.add(
                self._build_audit_log(
                    action="create",
                    case_study=case_study,
                    context={
                        "slug": case_study.slug,
                        "status": case_study.status,
                    },
                    actor=actor,
                )
            )
            await self._case_studies.refresh(case_study)
            await self._session.commit()
        except IntegrityError as error:
            await self._session.rollback()
            raise CaseStudySlugConflictError from error
        except Exception:
            await self._session.rollback()
            raise

        return case_study

    async def update(
        self,
        case_study_id: UUID,
        request: CaseStudyUpdateRequest,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> CaseStudy:
        """Update permitted fields and apply publication transitions."""

        case_study = await self._case_studies.get_by_id(case_study_id)
        if case_study is None:
            raise CaseStudyNotFoundError
        previous_cover_url = case_study.cover_image_url

        updates = request.model_dump(exclude_unset=True, mode="json")
        next_slug = updates.get("slug", case_study.slug)
        if next_slug != case_study.slug and await self._case_studies.slug_exists(
            next_slug,
            exclude_id=case_study.id,
        ):
            raise CaseStudySlugConflictError

        next_status = updates.get("status", case_study.status)
        next_cover_image_url = updates.get(
            "cover_image_url",
            case_study.cover_image_url,
        )
        if next_status == "published" and next_cover_image_url is None:
            raise CaseStudyValidationError(
                "cover_image_url is required for published Case Studies"
            )

        changed_fields: list[str] = []
        for field_name, value in updates.items():
            if getattr(case_study, field_name) != value:
                setattr(case_study, field_name, value)
                changed_fields.append(field_name)

        if case_study.status == "published" and case_study.published_at is None:
            case_study.published_at = self._clock()
            changed_fields.append("published_at")
        elif next_status != "published" and case_study.published_at is not None:
            case_study.published_at = None
            changed_fields.append("published_at")

        if not changed_fields:
            return case_study

        try:
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    case_study=case_study,
                    context={
                        "slug": case_study.slug,
                        "status": case_study.status,
                        "changed_fields": sorted(set(changed_fields)),
                    },
                    actor=actor,
                )
            )
            await self._case_studies.refresh(case_study)
            await self._session.commit()
        except IntegrityError as error:
            await self._session.rollback()
            raise CaseStudySlugConflictError from error
        except Exception:
            await self._session.rollback()
            raise

        if "cover_image_url" in changed_fields and self._image_storage is not None:
            await self._cleanup_previous_cover(
                self._image_storage,
                previous_cover_url,
                case_study.id,
            )
        return case_study

    async def delete(
        self,
        case_study_id: UUID,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> None:
        """Hard-delete a Case Study and preserve an audit event."""

        case_study = await self._case_studies.get_by_id(case_study_id)
        if case_study is None:
            raise CaseStudyNotFoundError

        audit_log = self._build_audit_log(
            action="delete",
            case_study=case_study,
            context={"slug": case_study.slug, "status": case_study.status},
            actor=actor,
        )
        previous_cover_url = case_study.cover_image_url

        try:
            await self._case_studies.delete(case_study)
            await self._audit_logs.add(audit_log)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

        if self._image_storage is not None:
            await self._cleanup_previous_cover(
                self._image_storage,
                previous_cover_url,
                case_study.id,
            )

    async def upload_cover(
        self,
        case_study_id: UUID,
        upload: UploadFile,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> CaseStudy:
        """Replace a Case Study cover with a backend-managed object."""

        case_study = await self.get_by_id(case_study_id)
        storage = self._require_image_storage()
        previous_url = case_study.cover_image_url
        stored = await storage.upload(case_study.id, upload)
        case_study.cover_image_url = stored.public_url
        try:
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    case_study=case_study,
                    context={
                        "slug": case_study.slug,
                        "status": case_study.status,
                        "changed_fields": ["cover_image_url"],
                    },
                    actor=actor,
                )
            )
            await self._case_studies.refresh(case_study)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            try:
                await storage.delete_path(stored.object_path)
            except StorageError:
                logger.warning(
                    "Could not remove an unreferenced Case Study cover after rollback.",
                    extra={"resource_type": "case_study", "resource_id": str(case_study.id)},
                )
            raise
        await self._cleanup_previous_cover(storage, previous_url, case_study.id)
        return case_study

    async def delete_cover(
        self,
        case_study_id: UUID,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> None:
        """Clear and clean up a draft or unpublished Case Study cover."""

        case_study = await self.get_by_id(case_study_id)
        if case_study.status == "published":
            raise CaseStudyValidationError(
                "Published Case Studies must be changed to draft or unpublished before deleting their cover."
            )
        previous_url = case_study.cover_image_url
        if previous_url is None:
            return
        storage = self._require_image_storage()
        case_study.cover_image_url = None
        try:
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    case_study=case_study,
                    context={
                        "slug": case_study.slug,
                        "status": case_study.status,
                        "changed_fields": ["cover_image_url"],
                    },
                    actor=actor,
                )
            )
            await self._case_studies.refresh(case_study)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        await self._cleanup_previous_cover(storage, previous_url, case_study.id)

    def _require_image_storage(self) -> PublicImageStorage:
        if self._image_storage is None:
            raise StorageConfigurationError("Storage is not configured.")
        return self._image_storage

    @staticmethod
    async def _cleanup_previous_cover(
        storage: PublicImageStorage,
        previous_url: str | None,
        case_study_id: UUID,
    ) -> None:
        if previous_url is None:
            return
        try:
            await storage.delete_managed_url(str(previous_url), case_study_id)
        except StorageError:
            logger.warning(
                "Could not clean up a previous Case Study cover.",
                extra={
                    "resource_type": "case_study",
                    "resource_id": str(case_study_id),
                },
            )

    @staticmethod
    def _build_audit_log(
        *,
        action: str,
        case_study: CaseStudy,
        context: dict[str, object],
        actor: AuthenticatedAdmin | None = None,
    ) -> AuditLog:
        """Build an approved non-sensitive Case Study audit record."""

        return AuditLog(
            actor_id=actor.admin_id if actor is not None else None,
            actor_email=actor.admin_email if actor is not None else None,
            action=action,
            resource_type="case_study",
            resource_id=case_study.id,
            context=context,
        )
