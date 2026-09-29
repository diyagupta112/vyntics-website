"""Team Member database queries and persistence operations."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.team_member import TeamMember


class TeamMemberRepository:
    """Data-access operations for Team members without transaction commits."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[TeamMember]:
        """Return every Team member ordered solely by display order."""

        statement = select(TeamMember).order_by(TeamMember.display_order.asc())
        result = await self._session.scalars(statement)
        return list(result.all())

    async def get_by_id(self, team_member_id: UUID) -> TeamMember | None:
        """Return one Team member by its database identifier."""

        return await self._session.get(TeamMember, team_member_id)

    async def add(self, team_member: TeamMember) -> None:
        """Stage a Team member and flush database-generated fields."""

        self._session.add(team_member)
        await self._session.flush()

    async def refresh(self, team_member: TeamMember) -> None:
        """Flush changes and reload database-managed fields."""

        await self._session.flush()
        await self._session.refresh(team_member)

    async def delete(self, team_member: TeamMember) -> None:
        """Stage a hard delete for a Team member."""

        await self._session.delete(team_member)
