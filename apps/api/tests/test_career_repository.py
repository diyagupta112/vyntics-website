"""Unit tests for Career data access."""

import asyncio
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.career import Career
from app.repositories.careers import CareerRepository


CAREER_ID = UUID("f36f3376-d338-46c1-91e3-f2b0fe723ec0")


def _compiled_sql(statement: object) -> str:
    return str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )


def test_list_all_has_no_filter_and_orders_by_published_at_desc() -> None:
    careers = [SimpleNamespace(slug="newest"), SimpleNamespace(slug="older")]
    result = MagicMock()
    result.all.return_value = careers
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = result

    returned = asyncio.run(CareerRepository(session).list_all())
    sql = _compiled_sql(session.scalars.await_args.args[0])

    assert returned == careers
    assert "FROM careers" in sql
    assert "WHERE" not in sql
    assert "ORDER BY careers.published_at DESC" in sql


def test_exact_slug_lookup_and_uniqueness_are_case_sensitive() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.scalar.side_effect = [SimpleNamespace(slug="Senior-Engineer"), CAREER_ID]
    repository = CareerRepository(session)

    found = asyncio.run(repository.get_by_slug("Senior-Engineer"))
    exists = asyncio.run(repository.slug_exists("senior-engineer"))
    lookup_sql = _compiled_sql(session.scalar.await_args_list[0].args[0])
    exists_sql = _compiled_sql(session.scalar.await_args_list[1].args[0])

    assert found.slug == "Senior-Engineer"
    assert exists is True
    assert "careers.slug = 'Senior-Engineer'" in lookup_sql
    assert "careers.slug = 'senior-engineer'" in exists_sql
    assert "lower(" not in lookup_sql.lower()
    assert "lower(" not in exists_sql.lower()


def test_slug_exists_can_exclude_current_career() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.scalar.return_value = CAREER_ID
    repository = CareerRepository(session)

    assert asyncio.run(
        repository.slug_exists("new-slug", exclude_id=CAREER_ID)
    )
    sql = _compiled_sql(session.scalar.await_args.args[0])
    assert "careers.id !=" in sql


def test_repository_stages_changes_without_committing() -> None:
    session = AsyncMock(spec=AsyncSession)
    repository = CareerRepository(session)
    career = Career(
        slug="repository-career",
        title="Repository Career",
        location="Remote",
        employment_type="Full-time",
        department="Engineering",
        experience="5+ years",
        short_description="Repository test.",
        description={},
        responsibilities={},
        requirements={},
        nice_to_have={},
        benefits={},
        published_at=datetime.now(timezone.utc),
    )

    asyncio.run(repository.add(career))
    asyncio.run(repository.refresh(career))
    asyncio.run(repository.delete(career))

    session.add.assert_called_once_with(career)
    assert session.flush.await_count == 2
    session.refresh.assert_awaited_once_with(career)
    session.delete.assert_awaited_once_with(career)
    session.commit.assert_not_awaited()
