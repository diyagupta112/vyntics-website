"""Opt-in Contact Submission integration test against PostgreSQL."""

import asyncio
import os
import sys
from uuid import uuid4

import pytest
from sqlalchemy import delete, select

from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.contact_submission import ContactSubmission
from app.db.session import create_database, dispose_database
from app.schemas.contact import ContactCreateRequest
from app.services.contact_submissions import ContactSubmissionService


RUN_DATABASE_INTEGRATION_TESTS = (
    os.getenv("RUN_DATABASE_INTEGRATION_TESTS", "").lower()
    in {"1", "true", "yes"}
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
def test_contact_lifecycle_against_configured_postgresql() -> None:
    async def exercise() -> None:
        settings = Settings()
        assert settings.database_url is not None, "DATABASE_URL is not configured"
        database = create_database(settings)
        run_id = uuid4()
        submission_id = None

        try:
            async with database.session_factory() as session:
                service = ContactSubmissionService(session)
                created = await service.create(
                    ContactCreateRequest(
                        name="Phase 11 Integration Visitor",
                        email=f"phase-11-{run_id}@example.com",
                        company=None,
                        subject="Temporary integration submission",
                        message="Temporary private integration message.",
                        source_page="/contact",
                    )
                )
                submission_id = created.id

                assert created.status == "new"
                assert created.submitted_at is not None
                assert await session.get(ContactSubmission, created.id) is not None

                listed_ids = {item.id for item in await service.list_all()}
                assert created.id in listed_ids
                detail = await service.get_by_id(created.id)
                assert detail.message == "Temporary private integration message."

                await service.delete(created.id)
                assert await session.get(ContactSubmission, created.id) is None

                audit = await session.scalar(
                    select(AuditLog).where(
                        AuditLog.resource_id == created.id,
                        AuditLog.resource_type == "contact_submission",
                        AuditLog.action == "delete",
                    )
                )
                assert audit is not None
                assert audit.context == {"status": "new"}
                assert "message" not in audit.context
        finally:
            if submission_id is not None:
                async with database.session_factory() as cleanup_session:
                    await cleanup_session.execute(
                        delete(AuditLog).where(
                            AuditLog.resource_id == submission_id
                        )
                    )
                    await cleanup_session.execute(
                        delete(ContactSubmission).where(
                            ContactSubmission.id == submission_id
                        )
                    )
                    await cleanup_session.commit()
            await dispose_database(database)

    _run(exercise())
