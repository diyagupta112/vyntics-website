"""FAQ CRUD and existing audit logging in service-owned transactions."""

from uuid import UUID
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.faq import FAQ
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.faqs import FAQRepository
from app.schemas.faqs import FAQCreateRequest, FAQUpdateRequest


class FAQNotFoundError(LookupError):
    pass


class FAQPersistenceError(RuntimeError):
    pass


class FAQService:
    def __init__(self, session: AsyncSession, *, repository: FAQRepository | None = None, audit_repository: AuditLogRepository | None = None) -> None:
        self._session = session
        self._resources = repository or FAQRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)

    async def list_public(self, *, page: str | None = None) -> list[FAQ]:
        try:
            return await self._resources.list_public(page=page)
        except SQLAlchemyError as error:
            raise FAQPersistenceError from error

    async def list_all(self, *, page: str | None = None) -> list[FAQ]:
        try:
            return await self._resources.list_all(page=page)
        except SQLAlchemyError as error:
            raise FAQPersistenceError from error

    async def get_by_id(self, resource_id: UUID) -> FAQ:
        try:
            resource = await self._resources.get_by_id(resource_id)
        except SQLAlchemyError as error:
            raise FAQPersistenceError from error
        if resource is None:
            raise FAQNotFoundError
        return resource

    async def create(self, request: FAQCreateRequest, *, actor: AuthenticatedAdmin) -> FAQ:
        resource = FAQ(**request.model_dump(mode="json"))
        try:
            await self._resources.add(resource)
            await self._audit_logs.add(self._audit("create", resource, self._context(resource), actor))
            await self._resources.refresh(resource)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise FAQPersistenceError from error
        return resource

    async def update(self, resource_id: UUID, request: FAQUpdateRequest, *, actor: AuthenticatedAdmin) -> FAQ:
        resource = await self.get_by_id(resource_id)
        changed = []
        for field, value in request.model_dump(exclude_unset=True, mode="json").items():
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
            raise FAQPersistenceError from error
        return resource

    async def delete(self, resource_id: UUID, *, actor: AuthenticatedAdmin) -> None:
        resource = await self.get_by_id(resource_id)
        audit = self._audit("delete", resource, self._context(resource), actor)
        try:
            await self._resources.delete(resource)
            await self._audit_logs.add(audit)
            await self._session.commit()
        except Exception as error:
            await self._session.rollback()
            raise FAQPersistenceError from error

    @staticmethod
    def _context(resource: FAQ) -> dict[str, object]:
        return {"page": resource.page, "display_order": resource.display_order, "is_active": resource.is_active}

    @staticmethod
    def _audit(action: str, resource: FAQ, context: dict[str, object], actor: AuthenticatedAdmin) -> AuditLog:
        return AuditLog(actor_id=actor.admin_id, actor_email=actor.admin_email, action=action, resource_type="faq", resource_id=resource.id, context=context)
