"""Read-only application-admin queries."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.admin_user import AdminUser
from app.repositories.admin_users import AdminUserRepository


class AdminUserService:
    """Expose application administrators without Auth-provider access."""

    def __init__(self, session: AsyncSession) -> None:
        self._admin_users = AdminUserRepository(session)

    async def list_all(self) -> list[AdminUser]:
        """Return all admins for historical Audit Log actor filtering."""

        return await self._admin_users.list_all()
