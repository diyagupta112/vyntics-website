"""Read endpoint for the authenticated administrator's own identity."""

from fastapi import APIRouter

from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.schemas.admin_identity import CurrentAdminResponse


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
