"""Unit tests for Contact Submission business logic and transactions."""

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.contact_submission import ContactSubmission
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.contact_submissions import ContactSubmissionRepository
from app.schemas.contact import ContactCreateRequest
from app.services.contact_submissions import (
    ContactSubmissionNotFoundError,
    ContactSubmissionService,
)


SUBMISSION_ID = UUID("7fd6ff67-1db4-4dd7-81a2-c9e1df99f7f5")
NOW = datetime(2026, 9, 23, 12, 0, tzinfo=timezone.utc)


def _submission() -> ContactSubmission:
    return ContactSubmission(
        id=SUBMISSION_ID,
        name="Jane Visitor",
        email="jane@example.com",
        company="Example Company",
        subject="Project inquiry",
        message="Private visitor message.",
        source_page="/contact",
        status="new",
        notes=None,
        submitted_at=NOW,
        resolved_at=None,
        resolved_by=None,
    )


def _request() -> ContactCreateRequest:
    return ContactCreateRequest(
        name="Jane Visitor",
        email="jane@example.com",
        company="Example Company",
        subject="Project inquiry",
        message="Private visitor message.",
        source_page="/contact",
    )


def _service(
    contacts: ContactSubmissionRepository,
    audits: AuditLogRepository,
):
    session = AsyncMock(spec=AsyncSession)
    service = ContactSubmissionService(
        session,
        contact_repository=contacts,
        audit_repository=audits,
    )
    return service, session


def test_create_sets_new_commits_and_does_not_audit() -> None:
    contacts = AsyncMock(spec=ContactSubmissionRepository)
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(contacts, audits)

    created = asyncio.run(service.create(_request()))

    assert created.status == "new"
    assert created.message == "Private visitor message."
    contacts.add.assert_awaited_once_with(created)
    contacts.refresh.assert_awaited_once_with(created)
    audits.add.assert_not_awaited()
    session.commit.assert_awaited_once_with()


def test_create_failure_rolls_back() -> None:
    contacts = AsyncMock(spec=ContactSubmissionRepository)
    contacts.add.side_effect = RuntimeError("database failure")
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(contacts, audits)

    with pytest.raises(RuntimeError, match="database failure"):
        asyncio.run(service.create(_request()))

    session.rollback.assert_awaited_once_with()
    session.commit.assert_not_awaited()


def test_admin_reads_do_not_start_transactions() -> None:
    submission = _submission()
    contacts = AsyncMock(spec=ContactSubmissionRepository)
    contacts.list_all.return_value = [submission]
    contacts.get_by_id.return_value = submission
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(contacts, audits)

    assert asyncio.run(service.list_all()) == [submission]
    assert asyncio.run(service.get_by_id(SUBMISSION_ID)) is submission
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()


def test_missing_detail_and_delete_raise_not_found() -> None:
    contacts = AsyncMock(spec=ContactSubmissionRepository)
    contacts.get_by_id.return_value = None
    audits = AsyncMock(spec=AuditLogRepository)
    service, _ = _service(contacts, audits)

    with pytest.raises(ContactSubmissionNotFoundError):
        asyncio.run(service.get_by_id(SUBMISSION_ID))
    with pytest.raises(ContactSubmissionNotFoundError):
        asyncio.run(service.delete(SUBMISSION_ID))


def test_delete_hard_deletes_with_safe_audit_and_commits() -> None:
    submission = _submission()
    contacts = AsyncMock(spec=ContactSubmissionRepository)
    contacts.get_by_id.return_value = submission
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(contacts, audits)

    asyncio.run(service.delete(SUBMISSION_ID))

    contacts.delete.assert_awaited_once_with(submission)
    audit = audits.add.await_args.args[0]
    assert audit.action == "delete"
    assert audit.resource_type == "contact_submission"
    assert audit.resource_id == SUBMISSION_ID
    assert audit.actor_id is None
    assert audit.context == {"status": "new"}
    serialized_context = str(audit.context)
    assert submission.email not in serialized_context
    assert submission.message not in serialized_context
    session.commit.assert_awaited_once_with()


def test_delete_audit_failure_rolls_back() -> None:
    contacts = AsyncMock(spec=ContactSubmissionRepository)
    contacts.get_by_id.return_value = _submission()
    audits = AsyncMock(spec=AuditLogRepository)
    audits.add.side_effect = RuntimeError("audit failure")
    service, session = _service(contacts, audits)

    with pytest.raises(RuntimeError, match="audit failure"):
        asyncio.run(service.delete(SUBMISSION_ID))

    session.rollback.assert_awaited_once_with()
    session.commit.assert_not_awaited()
