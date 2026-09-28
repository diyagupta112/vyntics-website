"""Opt-in Career lifecycle tests against configured PostgreSQL."""

import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
from sqlalchemy import delete, select

from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.career import Career
from app.db.models.job_application import JobApplication
from app.db.session import create_database, dispose_database
from app.schemas.careers import CareerCreateRequest, CareerUpdateRequest
from app.services.careers import (
    CareerNotFoundError,
    CareerService,
)


RUN_DATABASE_INTEGRATION_TESTS = (
    os.getenv("RUN_DATABASE_INTEGRATION_TESTS", "").lower() in {"1", "true", "yes"}
)


def _run(coroutine) -> None:
    if sys.platform == "win32":
        with asyncio.Runner(loop_factory=asyncio.SelectorEventLoop) as runner:
            runner.run(coroutine)
    else:
        asyncio.run(coroutine)


def _request(slug: str, title: str) -> CareerCreateRequest:
    return CareerCreateRequest(
        slug=slug,
        title=title,
        location="Remote",
        employment_type="Full-time",
        department="Engineering",
        experience="5+ years",
        short_description="Temporary integration test.",
        description={"type": "doc"},
        responsibilities={"items": []},
        requirements={"items": []},
    )


@pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use the configured database",
)
def test_career_lifecycle_preserves_applications_against_postgresql() -> None:
    async def exercise() -> None:
        settings = Settings()
        assert settings.database_url is not None, "DATABASE_URL is not configured"
        database = create_database(settings)
        career_ids = []
        application_ids = []
        run_id = uuid4()

        try:
            async with database.session_factory() as session:
                older_time = datetime.now(timezone.utc) - timedelta(days=1)
                newer_time = datetime.now(timezone.utc)
                times = iter((older_time, newer_time))
                service = CareerService(session, clock=lambda: next(times))

                older = await service.create(
                    _request(f"phase-8-older-{run_id}", "Older Career")
                )
                newer = await service.create(
                    _request(f"phase-8-newer-{run_id}", "Newer Career")
                )
                older_id = older.id
                newer_id = newer.id
                older_slug = older.slug
                career_ids.extend((older_id, newer_id))

                assert older.nice_to_have == {} and older.benefits == {}
                assert older.published_at == older_time
                listed = [item for item in await service.list_all() if item.id in career_ids]
                assert [item.id for item in listed] == [newer_id, older_id]
                assert (await service.get_by_slug(older_slug)).id == older_id

                original_published_at = older.published_at
                updated = await service.update(
                    older_id,
                    CareerUpdateRequest(title="Updated Career", benefits={"items": []}),
                )
                assert updated.title == "Updated Career"
                assert updated.location == "Remote"
                assert updated.published_at == original_published_at

                application = JobApplication(
                    career_id=older_id,
                    career_title_snapshot=updated.title,
                    career_slug_snapshot=updated.slug,
                    name="Temporary Applicant",
                    email="temporary@example.com",
                    phone="0000000000",
                    resume_url="https://example.com/resume.pdf",
                )
                session.add(application)
                await session.commit()
                await session.refresh(application)
                application_id = application.id
                application_ids.append(application_id)

                original_status = application.status
                original_notes = application.notes
                await service.delete(older_id)
                assert await session.get(Career, older_id) is None

                persisted_application = await session.get(
                    JobApplication,
                    application_id,
                )
                assert persisted_application is not None
                await session.refresh(persisted_application)
                assert persisted_application.career_id is None
                assert persisted_application.career_title_snapshot == updated.title
                assert persisted_application.career_slug_snapshot == updated.slug
                assert persisted_application.status == original_status
                assert persisted_application.notes == original_notes
                await session.delete(persisted_application)
                await session.commit()
                application_ids.clear()

                await service.delete(newer_id)
                with pytest.raises(CareerNotFoundError):
                    await service.get_by_slug(older_slug)

                actions = set(
                    (
                        await session.scalars(
                            select(AuditLog.action).where(
                                AuditLog.resource_id == older_id
                            )
                        )
                    ).all()
                )
                assert actions == {"create", "update", "delete"}
        finally:
            async with database.session_factory() as cleanup_session:
                if application_ids:
                    await cleanup_session.execute(
                        delete(JobApplication).where(
                            JobApplication.id.in_(application_ids)
                        )
                    )
                if career_ids:
                    await cleanup_session.execute(
                        delete(AuditLog).where(AuditLog.resource_id.in_(career_ids))
                    )
                    await cleanup_session.execute(
                        delete(Career).where(Career.id.in_(career_ids))
                    )
                await cleanup_session.commit()
            await dispose_database(database)

    _run(exercise())
