"""Unit tests for Contact Submission data access."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.contact_submission import ContactSubmission
from app.repositories.contact_submissions import ContactSubmissionRepository


SUBMISSION_ID = UUID("7fd6ff67-1db4-4dd7-81a2-c9e1df99f7f5")


def test_list_all_orders_by_submitted_at_desc_without_filtering() -> None:
    submissions = [SimpleNamespace(status="new"), SimpleNamespace(status="other")]
    result = MagicMock()
    result.all.return_value = submissions
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = result
    repository = ContactSubmissionRepository(session)

    returned = asyncio.run(repository.list_all())
    statement = session.scalars.await_args.args[0]
    sql = str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )

    assert returned == submissions
    assert "FROM contact_submissions" in sql
    assert "WHERE" not in sql
    assert "ORDER BY contact_submissions.submitted_at DESC" in sql


def test_get_by_id_uses_database_uuid() -> None:
    submission = SimpleNamespace(id=SUBMISSION_ID)
    session = AsyncMock(spec=AsyncSession)
    session.get.return_value = submission
    repository = ContactSubmissionRepository(session)

    returned = asyncio.run(repository.get_by_id(SUBMISSION_ID))

    assert returned is submission
    session.get.assert_awaited_once_with(ContactSubmission, SUBMISSION_ID)


def test_repository_stages_changes_without_committing() -> None:
    submission = ContactSubmission(
        name="Jane Visitor",
        email="jane@example.com",
        company=None,
        subject="Project inquiry",
        message="Please contact us.",
        source_page="/contact",
        status="new",
    )
    session = AsyncMock(spec=AsyncSession)
    repository = ContactSubmissionRepository(session)

    asyncio.run(repository.add(submission))
    asyncio.run(repository.refresh(submission))
    asyncio.run(repository.delete(submission))

    session.add.assert_called_once_with(submission)
    session.flush.assert_awaited_once_with()
    session.refresh.assert_awaited_once_with(submission)
    session.delete.assert_awaited_once_with(submission)
    session.commit.assert_not_awaited()
