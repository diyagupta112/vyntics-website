"""FastAPI dependency wiring for read-only Admin User queries."""

from typing import Annotated

from fastapi import Depends

from app.api.dependencies.database import DatabaseSession
from app.services.admin_users import AdminUserService


def get_admin_user_service(session: DatabaseSession) -> AdminUserService:
    return AdminUserService(session)


AdminUserServiceDependency = Annotated[
    AdminUserService,
    Depends(get_admin_user_service),
]
