"""Unit tests for Job Application data access."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.job_application import JobApplication
from app.repositories.job_applications import JobApplicationRepository


CAREER_ID = UUID("b6aa692a-6527-4266-a495-1080e742d210")
APPLICATION_ID = UUID("674da2ca-a558-4dd0-a1eb-d71e1073defe")


def test_list_all_orders_current_and_historical_applications_newest_first() -> None:
    applications = [SimpleNamespace(id=APPLICATION_ID)]
    result = MagicMock()
    result.all.return_value = applications
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = result
    repository = JobApplicationRepository(session)

    returned = asyncio.run(repository.list_all())
    statement = session.scalars.await_args.args[0]
    sql = str(statement.compile(dialect=postgresql.dialect()))

    assert returned == applications
    assert "WHERE" not in sql
    assert "ORDER BY job_applications.submitted_at DESC" in sql


def test_list_for_career_filters_and_orders_newest_first() -> None:
    applications = [SimpleNamespace(id=APPLICATION_ID)]
    result = MagicMock()
    result.all.return_value = applications
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = result
    repository = JobApplicationRepository(session)

    returned = asyncio.run(repository.list_for_career(CAREER_ID))
    statement = session.scalars.await_args.args[0]
    sql = str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )
    assert returned == applications
    assert f"job_applications.career_id = '{CAREER_ID}'" in sql
    assert "ORDER BY job_applications.submitted_at DESC" in sql


def test_get_add_refresh_delete_never_commit() -> None:
    application = JobApplication(
        id=APPLICATION_ID,
        career_id=CAREER_ID,
        career_title_snapshot="Senior Engineer",
        career_slug_snapshot="senior-engineer",
        name="Ada",
        email="ada@example.com",
        phone="1",
        resume_url=f"{APPLICATION_ID}/resume.pdf",
    )
    session = AsyncMock(spec=AsyncSession)
    session.get.return_value = application
    repository = JobApplicationRepository(session)

    assert asyncio.run(repository.get_by_id(APPLICATION_ID)) is application
    asyncio.run(repository.add(application))
    asyncio.run(repository.refresh(application))
    asyncio.run(repository.delete(application))

    session.get.assert_awaited_once_with(JobApplication, APPLICATION_ID)
    session.add.assert_called_once_with(application)
    assert session.flush.await_count == 2
    session.refresh.assert_awaited_once_with(application)
    session.delete.assert_awaited_once_with(application)
    session.commit.assert_not_awaited()
