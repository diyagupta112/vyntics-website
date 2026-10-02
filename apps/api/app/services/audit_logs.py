"""Read-only access to existing audit events."""

from datetime import datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.audit_log import AuditLog
from app.repositories.audit_logs import AuditLogRepository
from app.schemas.audit_logs import AuditLogListItem, AuditLogListResponse


class AuditLogNotFoundError(LookupError):
    """The requested audit record does not exist."""


class AuditLogService:
    """Retrieve audit records without mutations or commits."""

    def __init__(self, session: AsyncSession) -> None:
        self._audit_logs = AuditLogRepository(session)

    async def list_page(
        self,
        *,
        page: int,
        page_size: int,
        actor_id: UUID | None = None,
        action: str | None = None,
        resource_type: str | None = None,
        resource_id: UUID | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> AuditLogListResponse:
        items, total = await self._audit_logs.list_page(
            page=page,
            page_size=page_size,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            from_time=from_time,
            to_time=to_time,
        )
        return AuditLogListResponse(
            items=[AuditLogListItem.model_validate(item) for item in items],
            page=page,
            page_size=page_size,
            total=total,
        )

    async def get_by_id(self, audit_log_id: UUID) -> AuditLog:
        item = await self._audit_logs.get_by_id(audit_log_id)
        if item is None:
            raise AuditLogNotFoundError
        return item
