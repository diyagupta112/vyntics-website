"""Unit tests for Case Study data access."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.case_study import CaseStudy
from app.repositories.case_studies import CaseStudyRepository


CASE_STUDY_ID = UUID("a610eff3-433a-405f-b58c-f4f1d1648e80")


def _compiled_sql(statement: object) -> str:
    return str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )


def test_list_published_filters_and_orders_by_published_at_desc() -> None:
    case_study = SimpleNamespace(slug="published-case-study")
    result = MagicMock()
    result.all.return_value = [case_study]
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = result
    repository = CaseStudyRepository(session)

    returned = asyncio.run(repository.list_published())
    sql = _compiled_sql(session.scalars.await_args.args[0])

    assert returned == [case_study]
    assert "WHERE case_studies.status = 'published'" in sql
    assert "ORDER BY case_studies.published_at DESC" in sql


def test_get_published_by_slug_filters_status() -> None:
    case_study = SimpleNamespace(slug="published-case-study")
    session = AsyncMock(spec=AsyncSession)
    session.scalar.return_value = case_study
    repository = CaseStudyRepository(session)

    returned = asyncio.run(
        repository.get_published_by_slug("published-case-study")
    )
    sql = _compiled_sql(session.scalar.await_args.args[0])

    assert returned is case_study
    assert "case_studies.slug = 'published-case-study'" in sql
    assert "case_studies.status = 'published'" in sql


def test_list_all_has_no_public_status_filter() -> None:
    case_studies = [
        SimpleNamespace(status="draft"),
        SimpleNamespace(status="published"),
        SimpleNamespace(status="unpublished"),
    ]
    result = MagicMock()
    result.all.return_value = case_studies
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = result
    repository = CaseStudyRepository(session)

    returned = asyncio.run(repository.list_all())
    sql = _compiled_sql(session.scalars.await_args.args[0])

    assert returned == case_studies
    assert "FROM case_studies" in sql
    assert "WHERE" not in sql


def test_slug_exists_can_exclude_current_case_study() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.scalar.return_value = CASE_STUDY_ID
    repository = CaseStudyRepository(session)

    exists = asyncio.run(
        repository.slug_exists("new-slug", exclude_id=CASE_STUDY_ID)
    )
    sql = _compiled_sql(session.scalar.await_args.args[0])

    assert exists is True
    assert "case_studies.id !=" in sql


def test_repository_stages_changes_without_committing() -> None:
    session = AsyncMock(spec=AsyncSession)
    repository = CaseStudyRepository(session)
    case_study = CaseStudy(
        slug="repository-case-study",
        title="Repository Case Study",
        seo_title="Repository Case Study | Vyntics",
        meta_description="Repository test.",
        client_name="Example Client",
        excerpt="Repository test.",
        cover_image_url=None,
        tech_stack=["Python"],
        tags=["API"],
        content={},
        status="draft",
    )

    asyncio.run(repository.add(case_study))
    asyncio.run(repository.refresh(case_study))
    asyncio.run(repository.delete(case_study))

    session.add.assert_called_once_with(case_study)
    assert session.flush.await_count == 2
    session.refresh.assert_awaited_once_with(case_study)
    session.delete.assert_awaited_once_with(case_study)
    session.commit.assert_not_awaited()
