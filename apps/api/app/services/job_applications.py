"""Job Application business rules, storage, auditing, and transactions."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.audit_log import AuditLog
from app.db.models.job_application import JobApplication
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.careers import CareerRepository
from app.repositories.job_applications import JobApplicationRepository
from app.schemas.job_applications import (
    JobApplicationAdminDetail,
    JobApplicationAdminListItem,
    JobApplicationCreateRequest,
    JobApplicationUpdateRequest,
)
from app.storage.resumes import (
    ResumeStorage,
    ResumeStorageConfigurationError,
    prepare_resume,
)


class JobApplicationCareerNotFoundError(LookupError):
    """Raised when a Career-scoped operation cannot find its Career."""


class JobApplicationNotFoundError(LookupError):
    """Raised when an administrative operation cannot find an application."""


class JobApplicationPersistenceError(RuntimeError):
    """Raised when persistence fails without exposing database details."""


class JobApplicationService:
    """Coordinate Job Application persistence and private resume storage."""

    def __init__(
        self,
        session: AsyncSession,
        storage: ResumeStorage | None,
        *,
        resume_max_bytes: int,
        application_repository: JobApplicationRepository | None = None,
        career_repository: CareerRepository | None = None,
        audit_repository: AuditLogRepository | None = None,
        clock: Callable[[], datetime] | None = None,
        id_factory: Callable[[], UUID] | None = None,
    ) -> None:
        self._session = session
        self._storage = storage
        self._resume_max_bytes = resume_max_bytes
        self._applications = application_repository or JobApplicationRepository(
            session
        )
        self._careers = career_repository or CareerRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)
        self._clock = clock or (lambda: datetime.now(timezone.utc))
        self._id_factory = id_factory or uuid4

    async def create(
        self,
        slug: str,
        request: JobApplicationCreateRequest,
    ) -> JobApplication:
        """Validate, upload, persist, and audit one public application."""

        career = await self._careers.get_by_slug(slug)
        if career is None:
            raise JobApplicationCareerNotFoundError

        application_id = self._id_factory()
        object_path: str | None = None
        if request.resume is not None:
            storage = self._require_storage()
            resume = await prepare_resume(
                request.resume,
                max_bytes=self._resume_max_bytes,
            )
            object_path = await storage.upload(application_id, resume)
        application = JobApplication(
            id=application_id,
            career_id=career.id,
            career_title_snapshot=career.title,
            career_slug_snapshot=career.slug,
            name=request.name,
            email=str(request.email),
            phone=request.phone,
            resume_url=object_path,
            cover_letter=request.cover_letter,
            status="new",
            notes=None,
            submitted_at=self._clock(),
        )

        try:
            await self._applications.add(application)
            await self._audit_logs.add(
                self._build_audit_log(
                    action="create",
                    application=application,
                    context=self._safe_context(application),
                )
            )
            await self._applications.refresh(application)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            if object_path is not None and self._storage is not None:
                try:
                    await self._storage.delete(object_path)
                except Exception:
                    pass
            raise JobApplicationPersistenceError(
                "Job Application could not be persisted."
            ) from error
        return application

    async def list_all(self) -> list[JobApplicationAdminListItem]:
        """Return all current and historical applications newest-first."""

        applications = await self._applications.list_all()
        return list(
            await asyncio.gather(
                *(self._to_list_item(application) for application in applications)
            )
        )

    async def list_for_career(
        self,
        career_id: UUID,
    ) -> list[JobApplicationAdminListItem]:
        """Return signed admin list items for one existing Career."""

        if await self._careers.get_by_id(career_id) is None:
            raise JobApplicationCareerNotFoundError
        applications = await self._applications.list_for_career(career_id)
        return list(
            await asyncio.gather(
                *(self._to_list_item(application) for application in applications)
            )
        )

    async def get_by_id(self, application_id: UUID) -> JobApplicationAdminDetail:
        """Return one signed administrative detail response."""

        application = await self._require_application(application_id)
        return await self._to_detail(application)

    async def update(
        self,
        application_id: UUID,
        request: JobApplicationUpdateRequest,
    ) -> JobApplicationAdminDetail:
        """Update only supplied status/notes fields and audit real changes."""

        application = await self._require_application(application_id)
        updates = request.model_dump(exclude_unset=True, mode="json")
        changed_fields: list[str] = []
        for field_name, value in updates.items():
            if getattr(application, field_name) != value:
                setattr(application, field_name, value)
                changed_fields.append(field_name)

        if changed_fields:
            context = self._safe_context(application)
            context["changed_fields"] = sorted(changed_fields)
            try:
                await self._audit_logs.add(
                    self._build_audit_log(
                        action="update",
                        application=application,
                        context=context,
                    )
                )
                await self._applications.refresh(application)
                await self._session.commit()
            except Exception as error:
                await self._session.rollback()
                raise JobApplicationPersistenceError(
                    "Job Application could not be updated."
                ) from error

        return await self._to_detail(application)

    async def delete(self, application_id: UUID) -> None:
        """Delete the private resume, then hard-delete and audit the row."""

        application = await self._require_application(application_id)
        if application.resume_url is not None:
            await self._require_storage().delete(application.resume_url)
        audit_log = self._build_audit_log(
            action="delete",
            application=application,
            context=self._safe_context(application),
        )
        try:
            await self._applications.delete(application)
            await self._audit_logs.add(audit_log)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise JobApplicationPersistenceError(
                "Job Application could not be deleted."
            ) from error

    async def _require_application(self, application_id: UUID) -> JobApplication:
        application = await self._applications.get_by_id(application_id)
        if application is None:
            raise JobApplicationNotFoundError
        return application

    async def _to_list_item(
        self,
        application: JobApplication,
    ) -> JobApplicationAdminListItem:
        return JobApplicationAdminListItem(
            id=application.id,
            career_id=application.career_id,
            career_title_snapshot=application.career_title_snapshot,
            career_slug_snapshot=application.career_slug_snapshot,
            name=application.name,
            email=application.email,
            phone=application.phone,
            status=application.status,
            submitted_at=application.submitted_at,
            resume_url=(
                await self._require_storage().create_access_url(application.resume_url)
                if application.resume_url is not None
                else None
            ),
        )

    async def _to_detail(
        self,
        application: JobApplication,
    ) -> JobApplicationAdminDetail:
        list_item = await self._to_list_item(application)
        return JobApplicationAdminDetail(
            **list_item.model_dump(),
            cover_letter=application.cover_letter,
            notes=application.notes,
        )

    @staticmethod
    def _safe_context(application: JobApplication) -> dict[str, object]:
        return {
            "career_id": (
                str(application.career_id)
                if application.career_id is not None
                else None
            ),
            "status": application.status,
        }

    def _require_storage(self) -> ResumeStorage:
        if self._storage is None:
            raise ResumeStorageConfigurationError(
                "Resume storage is not configured."
            )
        return self._storage

    @staticmethod
    def _build_audit_log(
        *,
        action: str,
        application: JobApplication,
        context: dict[str, object],
    ) -> AuditLog:
        return AuditLog(
            actor_id=None,
            actor_email=None,
            action=action,
            resource_type="job_application",
            resource_id=application.id,
            context=context,
        )
