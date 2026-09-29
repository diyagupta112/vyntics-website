"""Audit-log persistence operations."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.audit_log import AuditLog


class AuditLogRepository:
    """Data-access operations for audit records without transaction commits."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, audit_log: AuditLog) -> None:
        """Stage an audit record in the current transaction."""

        self._session.add(audit_log)
