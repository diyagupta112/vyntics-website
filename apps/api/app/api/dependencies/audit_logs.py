"""Request-scoped audit read service."""

from typing import Annotated

from fastapi import Depends

from app.api.dependencies.database import DatabaseSession
from app.services.audit_logs import AuditLogService


def get_audit_log_service(session: DatabaseSession) -> AuditLogService:
    return AuditLogService(session)


AuditLogServiceDependency = Annotated[AuditLogService, Depends(get_audit_log_service)]
