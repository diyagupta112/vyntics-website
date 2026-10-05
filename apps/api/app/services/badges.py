"""Badge business rules, storage, auditing, and transactions."""

import logging
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.badge import Badge
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.badges import BadgeRepository
from app.schemas.badges import BadgeCreateRequest, BadgeUpdateRequest
from app.storage.supabase import StorageConfigurationError, StorageError
from app.storage.uploads import PublicImageStorage


logger = logging.getLogger(__name__)


class BadgeNotFoundError(LookupError):
    pass


class BadgePersistenceError(RuntimeError):
    pass


class BadgeService:
    def __init__(
        self,
        session: AsyncSession,
        *,
        badge_repository: BadgeRepository | None = None,
        audit_repository: AuditLogRepository | None = None,
        image_storage: PublicImageStorage | None = None,
    ) -> None:
        self._session = session
        self._badges = badge_repository or BadgeRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)
        self._image_storage = image_storage

    async def list_public(self) -> list[Badge]:
        return await self._badges.list_public()

    async def list_all(self) -> list[Badge]:
        return await self._badges.list_all()

    async def get_by_id(self, badge_id: UUID) -> Badge:
        badge = await self._badges.get_by_id(badge_id)
        if badge is None:
            raise BadgeNotFoundError
        return badge

    async def create(
        self,
        request: BadgeCreateRequest,
        *,
        actor: AuthenticatedAdmin,
    ) -> Badge:
        badge = Badge(logo_url=None, **request.model_dump(mode="json"))
        try:
            await self._badges.add(badge)
            await self._audit_logs.add(
                self._audit("create", badge, self._safe_context(badge), actor)
            )
            await self._badges.refresh(badge)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise BadgePersistenceError from error
        return badge

    async def update(
        self,
        badge_id: UUID,
        request: BadgeUpdateRequest,
        *,
        actor: AuthenticatedAdmin,
    ) -> Badge:
        badge = await self.get_by_id(badge_id)
        changed: list[str] = []
        for field, value in request.model_dump(exclude_unset=True, mode="json").items():
            if getattr(badge, field) != value:
                setattr(badge, field, value)
                changed.append(field)
        if not changed:
            return badge
        context = self._safe_context(badge)
        context["changed_fields"] = sorted(changed)
        try:
            await self._audit_logs.add(self._audit("update", badge, context, actor))
            await self._badges.refresh(badge)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise BadgePersistenceError from error
        return badge

    async def delete(self, badge_id: UUID, *, actor: AuthenticatedAdmin) -> None:
        badge = await self.get_by_id(badge_id)
        previous_url = badge.logo_url
        audit = self._audit("delete", badge, self._safe_context(badge), actor)
        try:
            await self._badges.delete(badge)
            await self._audit_logs.add(audit)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise BadgePersistenceError from error
        if self._image_storage is not None:
            await self._cleanup_logo(previous_url, badge.id)

    async def upload_logo(
        self,
        badge_id: UUID,
        upload: UploadFile,
        *,
        actor: AuthenticatedAdmin,
    ) -> Badge:
        badge = await self.get_by_id(badge_id)
        storage = self._require_storage()
        previous_url = badge.logo_url
        stored = await storage.upload(badge.id, upload)
        badge.logo_url = stored.public_url
        context = self._safe_context(badge)
        context.update({
            "changed_fields": ["logo_url"],
            "logo_operation": "replace" if previous_url else "upload",
        })
        try:
            await self._audit_logs.add(self._audit("update", badge, context, actor))
            await self._badges.refresh(badge)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            try:
                await storage.delete_path(stored.object_path)
            except StorageError:
                logger.warning(
                    "Could not remove an unreferenced Badge logo after rollback.",
                    extra={"resource_type": "badge", "resource_id": str(badge.id)},
                )
            raise BadgePersistenceError from error
        await self._cleanup_logo(previous_url, badge.id)
        return badge

    async def delete_logo(
        self,
        badge_id: UUID,
        *,
        actor: AuthenticatedAdmin,
    ) -> None:
        badge = await self.get_by_id(badge_id)
        previous_url = badge.logo_url
        if previous_url is None:
            return
        self._require_storage()
        badge.logo_url = None
        context = self._safe_context(badge)
        context.update({"changed_fields": ["logo_url"], "logo_operation": "delete"})
        try:
            await self._audit_logs.add(self._audit("update", badge, context, actor))
            await self._badges.refresh(badge)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise BadgePersistenceError from error
        await self._cleanup_logo(previous_url, badge.id)

    def _require_storage(self) -> PublicImageStorage:
        if self._image_storage is None:
            raise StorageConfigurationError("Storage is not configured.")
        return self._image_storage

    async def _cleanup_logo(self, url: str | None, badge_id: UUID) -> None:
        if url is None or self._image_storage is None:
            return
        try:
            await self._image_storage.delete_managed_url(str(url), badge_id)
        except StorageError:
            logger.warning(
                "Could not clean up a previous Badge logo.",
                extra={"resource_type": "badge", "resource_id": str(badge_id)},
            )

    @staticmethod
    def _safe_context(badge: Badge) -> dict[str, object]:
        return {"display_order": badge.display_order, "is_active": badge.is_active}

    @staticmethod
    def _audit(
        action: str,
        badge: Badge,
        context: dict[str, object],
        actor: AuthenticatedAdmin,
    ) -> AuditLog:
        return AuditLog(
            actor_id=actor.admin_id,
            actor_email=actor.admin_email,
            action=action,
            resource_type="badge",
            resource_id=badge.id,
            context=context,
        )
