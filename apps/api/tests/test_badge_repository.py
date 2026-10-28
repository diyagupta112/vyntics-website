"""Badge repository SQL contract tests."""

import asyncio
from unittest.mock import AsyncMock, MagicMock

from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.badges import BadgeRepository


def _compiled_statement(repository_call: str) -> str:
    session = AsyncMock(spec=AsyncSession)
    result = MagicMock()
    result.all.return_value = []
    session.scalars.return_value = result
    repository = BadgeRepository(session)
    asyncio.run(getattr(repository, repository_call)())
    statement = session.scalars.await_args.args[0]
    return str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )


def test_public_query_filters_active_and_has_deterministic_order() -> None:
    sql = _compiled_statement("list_public")

    assert "badges.is_active IS true" in sql
    assert "badges.display_order ASC" in sql
    assert "badges.created_at ASC" in sql
    assert "badges.id ASC" in sql


def test_admin_query_has_no_visibility_filter() -> None:
    sql = _compiled_statement("list_all")

    assert "WHERE" not in sql
    assert "badges.display_order ASC" in sql
