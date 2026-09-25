"""Opt-in end-to-end FastAPI Job Application verification against PostgreSQL."""

import asyncio
import os
import sys
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

from app.api.dependencies.job_applications import get_resume_storage
from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.career import Career
from app.db.models.job_application import JobApplication
from app.db.session import create_database, dispose_database
from app.main import create_app
from app.storage.resumes import PreparedResume


RUN_DATABASE_INTEGRATION_TESTS = (
    os.getenv("RUN_DATABASE_INTEGRATION_TESTS", "").lower()
    in {"1", "true", "yes"}
)


class PrivateTestStorage:
    """Private in-memory storage used only by this API integration test."""

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
def test_complete_job_application_http_lifecycle_against_postgresql() -> None:
    settings = Settings(debug=False)
    assert settings.database_url is not None, "DATABASE_URL is not configured"
    application = create_app(settings)
    storage = PrivateTestStorage()
    application.dependency_overrides[get_resume_storage] = lambda: storage
    run_id = uuid4()
    slug = f"phase-9-api-{run_id}"
    career_id: UUID | None = None
    application_id: UUID | None = None

    try:
        with TestClient(
            application,
            backend_options={"loop_factory": asyncio.SelectorEventLoop},
        ) as client:
            openapi = client.get("/openapi.json")
            assert openapi.status_code == 200
            assert "/careers/{slug}/apply" in openapi.json()["paths"]

            career_response = client.post(
                "/careers",
                json={
                    "slug": slug,
                    "title": "Phase 9 API Temporary Career",
                    "location": "Remote",
                    "employment_type": "Full-time",
                    "department": "Engineering",
                    "experience": "3+ years",
                    "short_description": "Temporary API verification data.",
                    "description": {"type": "doc"},
                    "responsibilities": {"items": []},
                    "requirements": {"items": []},
                },
            )
            assert career_response.status_code == 201
            career_id = UUID(career_response.json()["id"])

            submitted = client.post(
                f"/careers/{slug}/apply",
                data={
                    "name": "Phase 9 API Applicant",
                    "email": f"phase-9-{run_id}@example.com",
                    "phone": "1234567890",
                    "cover_letter": "Temporary private cover letter.",
                },
            )
            assert submitted.status_code == 201
            assert set(submitted.json()) == {"id", "status", "submitted_at"}
            assert submitted.json()["status"] == "new"
            application_id = UUID(submitted.json()["id"])
            assert storage.objects == {}

            listed = client.get(f"/admin/careers/{career_id}/applications")
            assert listed.status_code == 200
            row = next(
                item for item in listed.json() if item["id"] == str(application_id)
            )
            assert row["resume_url"] is None
            assert "cover_letter" not in row and "notes" not in row

            detail = client.get(f"/admin/job-applications/{application_id}")
            assert detail.status_code == 200
            assert detail.json()["career_id"] == str(career_id)
            assert detail.json()["cover_letter"] == "Temporary private cover letter."
            assert detail.json()["resume_url"] is None

            updated = client.patch(
                f"/admin/job-applications/{application_id}",
                json={"status": "shortlisted", "notes": "Temporary note."},
            )
            assert updated.status_code == 200
            assert updated.json()["status"] == "shortlisted"
            assert updated.json()["notes"] == "Temporary note."

            restricted = client.delete(f"/careers/{career_id}")
            assert restricted.status_code == 409

            removed = client.delete(f"/admin/job-applications/{application_id}")
            assert removed.status_code == 204 and removed.content == b""
            assert storage.objects == {}
            assert client.get(f"/careers/{slug}").status_code == 200
            assert client.get(
                f"/admin/job-applications/{application_id}"
            ).status_code == 404

            deleted_career = client.delete(f"/careers/{career_id}")
            assert deleted_career.status_code == 204
    finally:
        async def cleanup() -> None:
            database = create_database(settings)
            try:
                async with database.session_factory() as session:
                    ids = [item for item in (application_id, career_id) if item]
                    if ids:
                        await session.execute(
                            delete(AuditLog).where(AuditLog.resource_id.in_(ids))
                        )
                    if application_id is not None:
                        await session.execute(
                            delete(JobApplication).where(
                                JobApplication.id == application_id
                            )
                        )
                    if career_id is not None:
                        await session.execute(
                            delete(Career).where(Career.id == career_id)
                        )
                    await session.commit()
            finally:
                await dispose_database(database)

        _run(cleanup())

    assert storage.objects == {}
