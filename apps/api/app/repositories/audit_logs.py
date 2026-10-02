"""Audit-log persistence operations."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.audit_log import AuditLog


class AuditLogRepository:
    """Data-access operations for audit records without transaction commits."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, audit_log: AuditLog) -> None:
        """Stage an audit record in the current transaction."""

        self._session.add(audit_log)

    async def get_by_id(self, audit_log_id: UUID) -> AuditLog | None:
        """Read one existing event without loading its actor relationship."""

        return await self._session.get(AuditLog, audit_log_id)

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
    ) -> tuple[list[AuditLog], int]:
        """Filter, count, order, and paginate in PostgreSQL."""

        conditions = []
        for column, value in (
            (AuditLog.actor_id, actor_id),
            (AuditLog.action, action),
            (AuditLog.resource_type, resource_type),
            (AuditLog.resource_id, resource_id),
        ):
            if value is not None:
                conditions.append(column == value)
        if from_time is not None:
            conditions.append(AuditLog.created_at >= from_time)
        if to_time is not None:
            conditions.append(AuditLog.created_at <= to_time)

        total = await self._session.scalar(
            select(func.count()).select_from(AuditLog).where(*conditions)
        )
        statement = (
            select(AuditLog)
            .where(*conditions)
            .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self._session.scalars(statement)
        return list(result.all()), int(total or 0)
