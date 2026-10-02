"""Opt-in Job Application lifecycle test against configured PostgreSQL."""

import asyncio
import os
import sys
from io import BytesIO
from uuid import UUID, uuid4

import pytest
from fastapi import UploadFile
from sqlalchemy import delete, select
from starlette.datastructures import Headers

from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.career import Career
from app.db.models.job_application import JobApplication
from app.db.session import create_database, dispose_database
from app.schemas.careers import CareerCreateRequest
from app.schemas.job_applications import (
    JobApplicationCreateRequest,
    JobApplicationUpdateRequest,
)
from app.services.careers import CareerService
from app.services.job_applications import JobApplicationService
from app.storage.resumes import PreparedResume


RUN_DATABASE_INTEGRATION_TESTS = (
    os.getenv("RUN_DATABASE_INTEGRATION_TESTS", "").lower()
    in {"1", "true", "yes"}
)


class InMemoryResumeStorage:
    """Private-storage test double retaining only temporary object bytes."""

    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}

    async def upload(self, application_id: UUID, resume: PreparedResume) -> str:
        path = f"{application_id}/resume{resume.extension}"
        self.objects[path] = resume.content
        return path

    async def create_access_url(self, object_path: str) -> str:
        assert object_path in self.objects
        return f"https://storage.example.test/private/{object_path}?token=test"

    async def delete(self, object_path: str) -> None:
        self.objects.pop(object_path, None)


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
def test_job_application_lifecycle_against_configured_postgresql() -> None:
    async def exercise() -> None:
        settings = Settings()
        assert settings.database_url is not None, "DATABASE_URL is not configured"
        database = create_database(settings)
        storage = InMemoryResumeStorage()
        career_id = None
        application_id = None
        run_id = uuid4()

        try:
            async with database.session_factory() as session:
                career_service = CareerService(session)
                career = await career_service.create(
                    CareerCreateRequest(
                        slug=f"phase-9-{run_id}",
                        title="Phase 9 Temporary Career",
                        location="Remote",
                        employment_type="Full-time",
                        department="Engineering",
                        experience="3+ years",
                        short_description="Temporary integration data.",
                        description={"type": "doc"},
                        responsibilities={"items": []},
                        requirements={"items": []},
                    )
                )
                career_id = career.id
                service = JobApplicationService(
                    session,
                    storage,
                    resume_max_bytes=1024,
                )
                created = await service.create(
                    career.slug,
                    JobApplicationCreateRequest(
                        name="Phase 9 Applicant",
                        email=f"phase-9-{run_id}@example.com",
                        phone="1234567890",
                        experience_years=5,
                        experience_months=2,
                        currently_working=True,
                        current_company="Integration Company",
                        notice_period="60_days",
                        resume=UploadFile(
                            file=BytesIO(b"%PDF-1.7\nintegration resume"),
                            filename="resume.pdf",
                            headers=Headers({"content-type": "application/pdf"}),
                        ),
                        cover_letter="Temporary private cover letter.",
                    ),
                )
                application_id = created.id

                assert created.status == "new" and created.submitted_at is not None
                assert created.experience_years == 5
                assert created.notice_period == "60_days"
                assert created.resume_url in storage.objects
                listed = await service.list_for_career(career.id)
                assert [item.id for item in listed] == [created.id]
                assert str(listed[0].resume_url).startswith(
                    "https://storage.example.test/private/"
                )
                assert listed[0].current_company == "Integration Company"

                detail = await service.get_by_id(created.id)
                assert detail.cover_letter == "Temporary private cover letter."
                updated = await service.update(
                    created.id,
                    JobApplicationUpdateRequest(
                        status="shortlisted",
                        notes="Temporary private note.",
                    ),
                )
                assert updated.status == "shortlisted"
                assert updated.notes == "Temporary private note."

                object_path = created.resume_url
                await service.delete(created.id)
                assert await session.get(JobApplication, created.id) is None
                assert await session.get(Career, career.id) is not None
                assert object_path not in storage.objects

                audits = list(
                    (
                        await session.scalars(
                            select(AuditLog).where(
                                AuditLog.resource_id == created.id,
                                AuditLog.resource_type == "job_application",
                            )
                        )
                    ).all()
                )
                assert {audit.action for audit in audits} == {
                    "create", "update", "delete",
                }
                assert all("email" not in audit.context for audit in audits)
                assert all("notes" not in audit.context for audit in audits)
        finally:
            async with database.session_factory() as cleanup_session:
                if application_id is not None:
                    await cleanup_session.execute(
                        delete(AuditLog).where(
                            AuditLog.resource_id == application_id
                        )
                    )
                    await cleanup_session.execute(
                        delete(JobApplication).where(
                            JobApplication.id == application_id
                        )
                    )
                if career_id is not None:
                    await cleanup_session.execute(
                        delete(AuditLog).where(AuditLog.resource_id == career_id)
                    )
                    await cleanup_session.execute(
                        delete(Career).where(Career.id == career_id)
                    )
                await cleanup_session.commit()
            await dispose_database(database)

    _run(exercise())
