"""Read endpoints for authenticated Vyntics administrator identities."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.api.dependencies.admin_users import AdminUserServiceDependency
from app.api.dependencies.auth import (
    AuthenticatedAdminDependency,
    require_admin_roles,
)
from app.auth.models import AuthenticatedAdmin
from app.schemas.admin_identity import AdminUserListItem, CurrentAdminResponse


router = APIRouter(prefix="/admin", tags=["admin identity"])


@router.get("/me", response_model=CurrentAdminResponse)
async def get_current_admin(
    admin: AuthenticatedAdminDependency,
) -> CurrentAdminResponse:
    """Return the active Vyntics admin mapped to the verified access token."""

    return CurrentAdminResponse(
        id=admin.admin_id,
        auth_user_id=admin.admin_auth_user_id,
        email=admin.admin_email,
        role=admin.role,
        is_active=admin.is_active,
        created_at=admin.created_at,
        updated_at=admin.updated_at,
    )


@router.get("/users", response_model=list[AdminUserListItem])
async def list_admin_users(
    _superadmin: Annotated[
        AuthenticatedAdmin,
        Depends(require_admin_roles("superadmin")),
    ],
    service: AdminUserServiceDependency,
) -> list[object]:
    """List active and inactive admins for Audit Log actor filtering."""

    try:
        return await service.list_all()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Admin users are temporarily unavailable.",
        ) from None
