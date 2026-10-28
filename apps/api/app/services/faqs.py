"""FAQ CRUD and existing audit logging in service-owned transactions."""

from uuid import UUID
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.faq import FAQ
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.faqs import FAQRepository
from app.services.ordering import close_gap, insertion_position, locked_update
from app.schemas.faqs import FAQCreateRequest, FAQUpdateRequest


# display_order is a separate 1..N sequence per (page, sub_page).
SCOPE_FIELDS = ("page", "sub_page")


class FAQNotFoundError(LookupError):
    pass


class FAQPersistenceError(RuntimeError):
    pass


class FAQService:
    def __init__(self, session: AsyncSession, *, repository: FAQRepository | None = None, audit_repository: AuditLogRepository | None = None) -> None:
        self._session = session
        self._resources = repository or FAQRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)

    async def list_public(self, *, page: str | None = None, sub_page: str | None = None) -> list[FAQ]:
        try:
            filters = {} if sub_page is None else {"sub_page": sub_page}
            return await self._resources.list_public(page=page, **filters)
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
        resource = FAQ(**request.model_dump(mode="json", exclude={"display_order"}))
        try:
            await self._resources.lock_ordering()
            scope = {"page": resource.page, "sub_page": resource.sub_page}
            resource.display_order = await insertion_position(self._resources, request.display_order, scope)
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
        fields = request.model_dump(exclude_unset=True, mode="json")
        changed = []
        if "display_order" in fields or any(name in fields for name in SCOPE_FIELDS):
            try:
                resource, changed = await locked_update(self._session, self._resources, resource_id, fields, SCOPE_FIELDS)
            except Exception as error:
                await self._session.rollback()
                raise FAQPersistenceError from error
            if resource is None:
                raise FAQNotFoundError
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
            raise FAQPersistenceError from error
        return resource

    async def delete(self, resource_id: UUID, *, actor: AuthenticatedAdmin) -> None:
        await self.get_by_id(resource_id)
        try:
            await self._resources.lock_ordering()
            resource = await self._resources.get_for_update(resource_id)
            if resource is None:
                await self._session.rollback()
                raise FAQNotFoundError
            position, scope = resource.display_order, {"page": resource.page, "sub_page": resource.sub_page}
            audit = self._audit("delete", resource, self._context(resource), actor)
            await self._resources.delete(resource)
            await close_gap(self._resources, position, scope)
            await self._audit_logs.add(audit)
            await self._session.commit()
        except FAQNotFoundError:
            raise
        except Exception as error:
            await self._session.rollback()
            raise FAQPersistenceError from error

    @staticmethod
    def _context(resource: FAQ) -> dict[str, object]:
        return {"page": resource.page, "display_order": resource.display_order, "is_active": resource.is_active}

    @staticmethod
    def _audit(action: str, resource: FAQ, context: dict[str, object], actor: AuthenticatedAdmin) -> AuditLog:
        return AuditLog(actor_id=actor.admin_id, actor_email=actor.admin_email, action=action, resource_type="faq", resource_id=resource.id, context=context)
