"""Testimonial CRUD and existing audit logging in service-owned transactions."""

import logging
from uuid import UUID
from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.testimonial import Testimonial
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.testimonials import TestimonialRepository
from app.services.ordering import close_gap, insertion_position, locked_update
from app.schemas.testimonials import TestimonialCreateRequest, TestimonialUpdateRequest

from app.storage.supabase import StorageConfigurationError, StorageError
from app.storage.uploads import PublicImageStorage

logger = logging.getLogger(__name__)


class TestimonialNotFoundError(LookupError):
    pass


class TestimonialPersistenceError(RuntimeError):
    pass


class TestimonialService:
    def __init__(self, session: AsyncSession, *, repository: TestimonialRepository | None = None, audit_repository: AuditLogRepository | None = None, image_storage: PublicImageStorage | None = None) -> None:
        self._session = session
        self._resources = repository or TestimonialRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)
        self._image_storage = image_storage

    async def list_public(self) -> list[Testimonial]:
        try:
            return await self._resources.list_public()
        except SQLAlchemyError as error:
            raise TestimonialPersistenceError from error

    async def list_all(self) -> list[Testimonial]:
        try:
            return await self._resources.list_all()
        except SQLAlchemyError as error:
            raise TestimonialPersistenceError from error

    async def get_by_id(self, resource_id: UUID) -> Testimonial:
        try:
            resource = await self._resources.get_by_id(resource_id)
        except SQLAlchemyError as error:
            raise TestimonialPersistenceError from error
        if resource is None:
            raise TestimonialNotFoundError
        return resource

    async def create(self, request: TestimonialCreateRequest, *, actor: AuthenticatedAdmin) -> Testimonial:
        resource = Testimonial(**request.model_dump(mode="json", exclude={"display_order"}))
        try:
            await self._resources.lock_ordering()
            resource.display_order = await insertion_position(self._resources, request.display_order)
            await self._resources.add(resource)
            await self._audit_logs.add(self._audit("create", resource, self._context(resource), actor))
            await self._resources.refresh(resource)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise TestimonialPersistenceError from error
        return resource

    async def update(self, resource_id: UUID, request: TestimonialUpdateRequest, *, actor: AuthenticatedAdmin) -> Testimonial:
        resource = await self.get_by_id(resource_id)
        previous_url = resource.company_logo_url
        fields = request.model_dump(exclude_unset=True, mode="json")
        changed = []
        if "display_order" in fields:
            try:
                resource, changed = await locked_update(self._session, self._resources, resource_id, fields)
            except Exception as error:
                await self._session.rollback()
                raise TestimonialPersistenceError from error
            if resource is None:
                raise TestimonialNotFoundError
        else:
            for field, value in fields.items():
                if getattr(resource, field) != value:
                    setattr(resource, field, value)
                    changed.append(field)
        if not changed:
            return resource
        context = self._context(resource)
        context["changed_fields"] = sorted(changed)
        try:
            await self._audit_logs.add(self._audit("update", resource, context, actor))
            await self._resources.refresh(resource)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise TestimonialPersistenceError from error
        if "company_logo_url" in changed:
            await self._cleanup_logo(previous_url, resource_id)
        return resource

    async def delete(self, resource_id: UUID, *, actor: AuthenticatedAdmin) -> None:
        resource = await self.get_by_id(resource_id)
        previous_url = resource.company_logo_url
        try:
            await self._resources.lock_ordering()
            resource = await self._resources.get_for_update(resource_id)
            if resource is None:
                await self._session.rollback()
                raise TestimonialNotFoundError
            position = resource.display_order
            audit = self._audit("delete", resource, self._context(resource), actor)
            await self._resources.delete(resource)
            await close_gap(self._resources, position)
            await self._audit_logs.add(audit)
            await self._session.commit()
        except TestimonialNotFoundError:
            raise
        except Exception as error:
            await self._session.rollback()
            raise TestimonialPersistenceError from error

        await self._cleanup_logo(previous_url, resource_id)

    async def upload_logo(
        self,
        resource_id: UUID,
        upload: UploadFile,
        *,
        actor: AuthenticatedAdmin,
    ) -> Testimonial:
        resource = await self.get_by_id(resource_id)
        storage = self._require_storage()
        previous_url = resource.company_logo_url
        stored = await storage.upload(resource.id, upload)
        resource.company_logo_url = stored.public_url
        context = self._context(resource)
        context.update({
            "changed_fields": ["company_logo_url"],
            "logo_operation": "replace" if previous_url else "upload",
        })
        try:
            await self._audit_logs.add(self._audit("update", resource, context, actor))
            await self._resources.refresh(resource)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            try:
                if previous_url != stored.public_url:
                    await storage.delete_path(stored.object_path)
            except StorageError:
                logger.warning(
                    "Could not remove an unreferenced Testimonial logo after rollback.",
                    extra={"resource_type": "testimonial", "resource_id": str(resource_id)},
                )
            raise TestimonialPersistenceError from error
        if previous_url != stored.public_url:
            await self._cleanup_logo(previous_url, resource_id)
        return resource

    async def delete_logo(
        self,
        resource_id: UUID,
        *,
        actor: AuthenticatedAdmin,
    ) -> None:
        resource = await self.get_by_id(resource_id)
        previous_url = resource.company_logo_url
        if previous_url is None:
            return
        self._require_storage()
        resource.company_logo_url = None
        context = self._context(resource)
        context.update({"changed_fields": ["company_logo_url"], "logo_operation": "delete"})
        try:
            await self._audit_logs.add(self._audit("update", resource, context, actor))
            await self._resources.refresh(resource)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise TestimonialPersistenceError from error
        await self._cleanup_logo(previous_url, resource_id)

    def _require_storage(self) -> PublicImageStorage:
        if self._image_storage is None:
            raise StorageConfigurationError("Storage is not configured.")
        return self._image_storage

    async def _cleanup_logo(self, url: str | None, resource_id: UUID) -> None:
        if url is None or self._image_storage is None:
            return
        try:
            await self._image_storage.delete_managed_url(str(url), resource_id)
        except StorageError:
            logger.warning(
                "Could not clean up a previous Testimonial logo.",
                extra={"resource_type": "testimonial", "resource_id": str(resource_id)},
            )

    @staticmethod
    def _context(resource: Testimonial) -> dict[str, object]:
        return {"display_order": resource.display_order, "is_active": resource.is_active}

    @staticmethod
    def _audit(action: str, resource: Testimonial, context: dict[str, object], actor: AuthenticatedAdmin) -> AuditLog:
        return AuditLog(actor_id=actor.admin_id, actor_email=actor.admin_email, action=action, resource_type="testimonial", resource_id=resource.id, context=context)
