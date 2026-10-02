"""Superadmin-only read API for existing audit logs."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import AwareDatetime
from sqlalchemy.exc import SQLAlchemyError

from app.api.dependencies.audit_logs import AuditLogServiceDependency
from app.api.dependencies.auth import require_admin_roles
from app.schemas.audit_logs import AuditLogDetail, AuditLogListResponse
from app.services.audit_logs import AuditLogNotFoundError


router = APIRouter(
    prefix="/admin/audit-logs",
    tags=["admin audit logs"],
    dependencies=[Depends(require_admin_roles("superadmin"))],
)


@router.get("", response_model=AuditLogListResponse)
async def list_audit_logs(
    service: AuditLogServiceDependency,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 25,
    actor_id: UUID | None = None,
    action: Annotated[str | None, Query(min_length=1)] = None,
    resource_type: Annotated[str | None, Query(min_length=1)] = None,
    resource_id: UUID | None = None,
    from_time: Annotated[
        AwareDatetime | None,
        Query(alias="from", description="Inclusive timestamp with timezone."),
    ] = None,
    to_time: Annotated[
        AwareDatetime | None,
        Query(alias="to", description="Inclusive timestamp with timezone."),
    ] = None,
) -> AuditLogListResponse:
    """List matching events newest-first; equal timestamps sort by UUID DESC."""

    if from_time is not None and to_time is not None and from_time > to_time:
        raise HTTPException(
            status_code=422, detail="from must be before or equal to to."
        )
    try:
        return await service.list_page(
            page=page,
            page_size=page_size,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            from_time=from_time,
            to_time=to_time,
        )
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503, detail="Audit logs are temporarily unavailable."
        ) from None


@router.get("/{audit_log_id}", response_model=AuditLogDetail)
async def get_audit_log(
    audit_log_id: UUID,
    service: AuditLogServiceDependency,
) -> object:
    """Return the complete stored event to an active superadmin."""

    try:
        return await service.get_by_id(audit_log_id)
    except AuditLogNotFoundError:
        raise HTTPException(status_code=404, detail="Audit Log not found.") from None
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503, detail="Audit logs are temporarily unavailable."
        ) from None
