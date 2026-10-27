"""Life at Vyntics CRUD, image lifecycle, and existing audit logging."""

import logging
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.life_at_vyntics import LifeAtVyntics
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.life_at_vyntics import LifeAtVynticsRepository
from app.schemas.life_at_vyntics import LifeAtVynticsCreateRequest, LifeAtVynticsUpdateRequest
from app.storage.supabase import StorageConfigurationError, StorageError
from app.storage.uploads import PublicImageStorage

logger = logging.getLogger(__name__)


class LifeAtVynticsNotFoundError(LookupError):
    pass


class LifeAtVynticsPersistenceError(RuntimeError):
    pass


class LifeAtVynticsService:
    def __init__(self, session: AsyncSession, *, repository: LifeAtVynticsRepository | None = None, audit_repository: AuditLogRepository | None = None, image_storage: PublicImageStorage | None = None) -> None:
        self._session = session
        self._resources = repository or LifeAtVynticsRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)
        self._image_storage = image_storage

    async def list_all(self) -> list[LifeAtVyntics]:
        try:
            return await self._resources.list_all()
        except SQLAlchemyError as error:
            raise LifeAtVynticsPersistenceError from error

    async def get_by_id(self, resource_id: UUID) -> LifeAtVyntics:
        try:
            resource = await self._resources.get_by_id(resource_id)
        except SQLAlchemyError as error:
            raise LifeAtVynticsPersistenceError from error
        if resource is None:
            raise LifeAtVynticsNotFoundError
        return resource

    async def create(self, request: LifeAtVynticsCreateRequest, *, actor: AuthenticatedAdmin) -> LifeAtVyntics:
        try:
            await self._resources.lock_ordering()
            last = await self._resources.count()
            position = last + 1 if request.display_order is None else min(request.display_order, last + 1)
            if position <= last:
                await self._resources.shift(delta=1, first=position)
            resource = LifeAtVyntics(display_order=position)
            await self._resources.add(resource)
            await self._audit_logs.add(self._audit("create", resource, self._context(resource), actor))
            await self._resources.refresh(resource)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise LifeAtVynticsPersistenceError from error
        return resource

    async def update(self, resource_id: UUID, request: LifeAtVynticsUpdateRequest, *, actor: AuthenticatedAdmin) -> LifeAtVyntics:
        await self.get_by_id(resource_id)
        if request.display_order is None:
            return await self.get_by_id(resource_id)
        try:
            await self._resources.lock_ordering()
            resource = await self._resources.get_for_update(resource_id)
            if resource is None:
                await self._session.rollback()
                raise LifeAtVynticsNotFoundError
            previous = resource.display_order
            position = min(request.display_order, await self._resources.count())
            if position == previous:
                # Release the ordering lock; rollback expires the row, so reload it.
                await self._session.rollback()
                return await self.get_by_id(resource_id)
            # Shift the neighbors between the old and new slot; the unique constraint is deferred.
            if position < previous:
                await self._resources.shift(delta=1, first=position, last=previous - 1)
            else:
                await self._resources.shift(delta=-1, first=previous + 1, last=position)
            resource.display_order = position
            context = self._context(resource)
            context.update({"changed_fields": ["display_order"], "previous_display_order": previous})
            await self._audit_logs.add(self._audit("update", resource, context, actor))
            await self._resources.refresh(resource)
            await self._session.commit()
        except LifeAtVynticsNotFoundError:
            raise
        except Exception as error:
            await self._session.rollback()
            raise LifeAtVynticsPersistenceError from error
        return resource

    async def delete(self, resource_id: UUID, *, actor: AuthenticatedAdmin) -> None:
        await self.get_by_id(resource_id)
        try:
            await self._resources.lock_ordering()
            resource = await self._resources.get_for_update(resource_id)
            if resource is None:
                await self._session.rollback()
                raise LifeAtVynticsNotFoundError
            previous_url = resource.image_url
            position = resource.display_order
            audit = self._audit("delete", resource, self._context(resource), actor)
            await self._resources.delete(resource)
            await self._resources.shift(delta=-1, first=position + 1)
            await self._audit_logs.add(audit)
            await self._session.commit()
        except LifeAtVynticsNotFoundError:
            raise
        except Exception as error:
            await self._session.rollback()
            raise LifeAtVynticsPersistenceError from error
        await self._cleanup_image(previous_url, resource_id)

    async def upload_image(self, resource_id: UUID, upload: UploadFile, *, actor: AuthenticatedAdmin) -> LifeAtVyntics:
        resource = await self.get_by_id(resource_id)
        storage = self._require_storage()
        previous_url = resource.image_url
        stored = await storage.upload(resource.id, upload)
        resource.image_url = stored.public_url
        context = self._context(resource)
        context.update({"changed_fields": ["image_url"], "image_operation": "replace" if previous_url else "upload"})
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
                    "Could not remove an unreferenced Life at Vyntics image after rollback.",
                    extra={"resource_type": "life_at_vyntics", "resource_id": str(resource_id)},
                )
            raise LifeAtVynticsPersistenceError from error
        if previous_url != stored.public_url:
            await self._cleanup_image(previous_url, resource_id)
        return resource

    async def delete_image(self, resource_id: UUID, *, actor: AuthenticatedAdmin) -> None:
        resource = await self.get_by_id(resource_id)
        previous_url = resource.image_url
        if previous_url is None:
            return
        self._require_storage()
        resource.image_url = None
        context = self._context(resource)
        context.update({"changed_fields": ["image_url"], "image_operation": "delete"})
        try:
            await self._audit_logs.add(self._audit("update", resource, context, actor))
            await self._resources.refresh(resource)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise LifeAtVynticsPersistenceError from error
        await self._cleanup_image(previous_url, resource_id)

    def _require_storage(self) -> PublicImageStorage:
        if self._image_storage is None:
            raise StorageConfigurationError("Storage is not configured.")
        return self._image_storage

    async def _cleanup_image(self, url: str | None, resource_id: UUID) -> None:
        if url is None or self._image_storage is None:
            return
        try:
            await self._image_storage.delete_managed_url(str(url), resource_id)
        except StorageError:
            logger.warning(
                "Could not clean up a previous Life at Vyntics image.",
                extra={"resource_type": "life_at_vyntics", "resource_id": str(resource_id)},
            )

    @staticmethod
    def _context(resource: LifeAtVyntics) -> dict[str, object]:
        return {"display_order": resource.display_order}

    @staticmethod
    def _audit(action: str, resource: LifeAtVyntics, context: dict[str, object], actor: AuthenticatedAdmin) -> AuditLog:
        return AuditLog(actor_id=actor.admin_id, actor_email=actor.admin_email, action=action, resource_type="life_at_vyntics", resource_id=resource.id, context=context)
