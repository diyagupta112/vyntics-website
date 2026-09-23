"""Opt-in Team Member lifecycle tests against configured PostgreSQL."""

import asyncio
import os
import sys
from uuid import uuid4

import pytest
from sqlalchemy import delete, select, text

from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.team_member import TeamMember
from app.db.session import create_database, dispose_database
from app.schemas.team import TeamMemberCreateRequest, TeamMemberUpdateRequest
from app.services.team_members import TeamMemberNotFoundError, TeamMemberService

RUN_DATABASE_INTEGRATION_TESTS = (
    os.getenv("RUN_DATABASE_INTEGRATION_TESTS", "").lower() in {"1", "true", "yes"}
)


def _run(coroutine) -> None:
    if sys.platform == "win32":
        with asyncio.Runner(loop_factory=asyncio.SelectorEventLoop) as runner:
            runner.run(coroutine)
    else:
        asyncio.run(coroutine)


@pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use the configured database",
)
def test_team_member_lifecycle_against_configured_postgresql() -> None:
    async def exercise() -> None:
        settings = Settings()
        assert settings.database_url is not None, "DATABASE_URL is not configured"
        database = create_database(settings)
        member_ids = []
        run_id = uuid4()

        try:
            async with database.session_factory() as session:
                visibility_column = await session.scalar(text("""
                    select count(*)
                    from information_schema.columns
                    where table_schema = 'public'
                      and table_name = 'team_members'
                      and column_name = 'is_visible'
                """))
                visibility_index = await session.scalar(text("""
                    select count(*)
                    from pg_indexes
                    where schemaname = 'public'
                      and indexname = 'ix_team_members_visible_order'
                """))
                assert visibility_column == 0
                assert visibility_index == 0

                service = TeamMemberService(session)
                for display_order in (30, 10, 20):
                    member = await service.create(TeamMemberCreateRequest(
                        name=f"Phase 10 {display_order} {run_id}",
                        role="Integration Tester",
                        bio="Temporary integration-test biography.",
                        photo_url=None,
                        linkedin_url=None,
                        display_order=display_order,
                        member_type="team",
                    ))
                    member_ids.append(member.id)

                listed = [
                    member for member in await service.list_all()
                    if member.id in member_ids
                ]
                assert [member.display_order for member in listed] == [10, 20, 30]
                selected = await service.get_by_id(member_ids[0])
                assert selected.photo_url is None and selected.linkedin_url is None

                updated = await service.update(
                    selected.id,
                    TeamMemberUpdateRequest(
                        role="Updated Integration Tester",
                        photo_url="https://example.com/team.jpg",
                    ),
                )
                assert updated.role == "Updated Integration Tester"
                cleared = await service.update(
                    selected.id,
                    TeamMemberUpdateRequest(photo_url=None),
                )
                assert cleared.photo_url is None

                for member_id in member_ids:
                    await service.delete(member_id)
                    with pytest.raises(TeamMemberNotFoundError):
                        await service.get_by_id(member_id)

                actions = set((await session.scalars(
                    select(AuditLog.action).where(AuditLog.resource_id == selected.id)
                )).all())
                assert actions == {"create", "update", "delete"}
        finally:
            if member_ids:
                async with database.session_factory() as cleanup_session:
                    await cleanup_session.execute(
                        delete(AuditLog).where(AuditLog.resource_id.in_(member_ids))
                    )
                    await cleanup_session.execute(
                        delete(TeamMember).where(TeamMember.id.in_(member_ids))
                    )
                    await cleanup_session.commit()
            await dispose_database(database)

    _run(exercise())
