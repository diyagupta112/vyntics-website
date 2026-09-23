"""Unit tests for Team Member data access."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.team_member import TeamMember
from app.repositories.team_members import TeamMemberRepository

MEMBER_ID = UUID("ce8e3179-52a8-4109-b5b4-1c8f896d10b1")


def test_list_all_orders_only_by_display_order_without_filtering() -> None:
    members = [SimpleNamespace(display_order=1), SimpleNamespace(display_order=2)]
    result = MagicMock()
    result.all.return_value = members
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = result
    repository = TeamMemberRepository(session)

    returned = asyncio.run(repository.list_all())
    statement = session.scalars.await_args.args[0]
    sql = str(statement.compile(dialect=postgresql.dialect()))

    assert returned == members
    assert "WHERE" not in sql
    assert "ORDER BY team_members.display_order ASC" in sql
    assert sql.count(" ASC") == 1


def test_get_by_id_uses_database_uuid() -> None:
    member = SimpleNamespace(id=MEMBER_ID)
    session = AsyncMock(spec=AsyncSession)
    session.get.return_value = member
    repository = TeamMemberRepository(session)

    assert asyncio.run(repository.get_by_id(MEMBER_ID)) is member
    session.get.assert_awaited_once_with(TeamMember, MEMBER_ID)


def test_repository_stages_changes_without_committing() -> None:
    member = TeamMember(
        name="Jane Doe", role="CEO", bio="Leader", display_order=1,
        member_type="leadership", photo_url=None, linkedin_url=None,
    )
    session = AsyncMock(spec=AsyncSession)
    repository = TeamMemberRepository(session)

    asyncio.run(repository.add(member))
    asyncio.run(repository.refresh(member))
    asyncio.run(repository.delete(member))

    session.add.assert_called_once_with(member)
    assert session.flush.await_count == 2
    session.refresh.assert_awaited_once_with(member)
    session.delete.assert_awaited_once_with(member)
    session.commit.assert_not_awaited()
