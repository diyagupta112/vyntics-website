"""Vyntics administrator identity queries."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.admin_user import AdminUser


class AdminUserRepository:
    """Read application administrators without changing transactions."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_auth_user_id(self, auth_user_id: UUID) -> AdminUser | None:
        """Return the administrator mapped to a Supabase Auth user UUID."""

        statement = select(AdminUser).where(
            AdminUser.auth_user_id == auth_user_id
        )
        return await self._session.scalar(statement)

    async def list_all(self) -> list[AdminUser]:
        """Return active and inactive administrators in stable email order."""

        statement = select(AdminUser).order_by(
            AdminUser.email.asc(),
            AdminUser.id.asc(),
        )
        result = await self._session.scalars(statement)
        return list(result.all())
