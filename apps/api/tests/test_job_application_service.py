"""Unit tests for Job Application business logic and transactions."""

import asyncio
from datetime import datetime, timezone
from io import BytesIO
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.datastructures import Headers

from app.db.models.job_application import JobApplication
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.careers import CareerRepository
from app.repositories.job_applications import JobApplicationRepository
from app.schemas.job_applications import (
    JobApplicationCreateRequest,
    JobApplicationUpdateRequest,
)
from app.services.job_applications import (
    JobApplicationCareerNotFoundError,
    JobApplicationNotFoundError,
    JobApplicationPersistenceError,
    JobApplicationService,
)
from app.storage.resumes import ResumeStorage


APPLICATION_ID = UUID("674da2ca-a558-4dd0-a1eb-d71e1073defe")
CAREER_ID = UUID("b6aa692a-6527-4266-a495-1080e742d210")
NOW = datetime(2026, 9, 25, 12, 0, tzinfo=timezone.utc)
OBJECT_PATH = f"{APPLICATION_ID}/resume.pdf"
SIGNED_URL = "https://example.supabase.co/storage/v1/object/sign/file?token=x"


def _request() -> JobApplicationCreateRequest:
    return JobApplicationCreateRequest(
        name="Ada Applicant",
        email="ada@example.com",
        phone="123",
        resume=UploadFile(
            file=BytesIO(b"%PDF-1.7\nresume"),
            filename="resume.pdf",
            headers=Headers({"content-type": "application/pdf"}),
        ),
        cover_letter="Private letter",
    )


def _application(**overrides: object) -> JobApplication:
    values: dict[str, object] = {
        "id": APPLICATION_ID,
        "career_id": CAREER_ID,
        "name": "Ada Applicant",
        "email": "ada@example.com",
        "phone": "123",
        "resume_url": OBJECT_PATH,
        "cover_letter": "Private letter",
        "status": "new",
        "notes": None,
        "submitted_at": NOW,
    }
    values.update(overrides)
    return JobApplication(**values)


def _service():
    session = AsyncMock(spec=AsyncSession)
    applications = AsyncMock(spec=JobApplicationRepository)
    careers = AsyncMock(spec=CareerRepository)
    audits = AsyncMock(spec=AuditLogRepository)
    storage = AsyncMock(spec=ResumeStorage)
    storage.upload.return_value = OBJECT_PATH
    storage.create_access_url.return_value = SIGNED_URL
    service = JobApplicationService(
        session,
        storage,
        resume_max_bytes=1024,
        application_repository=applications,
        career_repository=careers,
        audit_repository=audits,
        clock=lambda: NOW,
        id_factory=lambda: APPLICATION_ID,
    )
    return service, session, applications, careers, audits, storage


def test_create_resolves_career_uploads_sets_backend_fields_and_audits() -> None:
    service, session, applications, careers, audits, storage = _service()
    careers.get_by_slug.return_value = SimpleNamespace(id=CAREER_ID)

    created = asyncio.run(service.create("Senior-Engineer", _request()))

    careers.get_by_slug.assert_awaited_once_with("Senior-Engineer")
    assert created.id == APPLICATION_ID and created.career_id == CAREER_ID
    assert created.status == "new" and created.notes is None
    assert created.submitted_at == NOW and created.resume_url == OBJECT_PATH
    storage.upload.assert_awaited_once()
    applications.add.assert_awaited_once_with(created)
    applications.refresh.assert_awaited_once_with(created)
    audit = audits.add.await_args.args[0]
    assert audit.action == "create"
    assert audit.resource_type == "job_application"
    assert audit.resource_id == APPLICATION_ID
    assert audit.actor_id is None and audit.actor_email is None
    assert audit.context == {"career_id": str(CAREER_ID), "status": "new"}
    assert "email" not in audit.context and "resume" not in audit.context
    session.commit.assert_awaited_once_with()


def test_create_without_resume_persists_null_and_skips_storage() -> None:
    session = AsyncMock(spec=AsyncSession)
    applications = AsyncMock(spec=JobApplicationRepository)
    careers = AsyncMock(spec=CareerRepository)
    careers.get_by_slug.return_value = SimpleNamespace(id=CAREER_ID)
    audits = AsyncMock(spec=AuditLogRepository)
    service = JobApplicationService(
        session,
        None,
        resume_max_bytes=1024,
        application_repository=applications,
        career_repository=careers,
        audit_repository=audits,
        clock=lambda: NOW,
        id_factory=lambda: APPLICATION_ID,
    )
    request = JobApplicationCreateRequest(
        name="Ada Applicant",
        email="ada@example.com",
        phone="123",
    )

    created = asyncio.run(service.create("Senior-Engineer", request))

    assert created.resume_url is None
    applications.add.assert_awaited_once_with(created)
    session.commit.assert_awaited_once_with()


def test_admin_read_and_delete_without_resume_skip_storage() -> None:
    service, session, applications, _, audits, storage = _service()
    service._storage = None
    application = _application(resume_url=None)
    applications.get_by_id.return_value = application

    detail = asyncio.run(service.get_by_id(APPLICATION_ID))
    assert detail.resume_url is None

    asyncio.run(service.delete(APPLICATION_ID))
    storage.create_access_url.assert_not_awaited()
    storage.delete.assert_not_awaited()
    applications.delete.assert_awaited_once_with(application)
    audits.add.assert_awaited_once()
    session.commit.assert_awaited_once_with()


def test_create_missing_career_does_not_read_or_upload_resume() -> None:
    service, _, applications, careers, _, storage = _service()
    careers.get_by_slug.return_value = None
    with pytest.raises(JobApplicationCareerNotFoundError):
        asyncio.run(service.create("missing", _request()))
    storage.upload.assert_not_awaited()
    applications.add.assert_not_awaited()


def test_create_database_failure_rolls_back_and_cleans_uploaded_resume() -> None:
    service, session, applications, careers, _, storage = _service()
    careers.get_by_slug.return_value = SimpleNamespace(id=CAREER_ID)
    applications.add.side_effect = RuntimeError("raw database details")
    with pytest.raises(JobApplicationPersistenceError) as raised:
        asyncio.run(service.create("job", _request()))
    assert "raw database" not in str(raised.value)
    session.rollback.assert_awaited_once_with()
    storage.delete.assert_awaited_once_with(OBJECT_PATH)
    session.commit.assert_not_awaited()


def test_list_requires_career_preserves_repository_order_and_signs_urls() -> None:
    service, _, applications, careers, _, storage = _service()
    careers.get_by_id.return_value = SimpleNamespace(id=CAREER_ID)
    newest = _application()
    older = _application(id=UUID("6713947a-7261-4174-811a-fdc93769658e"))
    applications.list_for_career.return_value = [newest, older]
    returned = asyncio.run(service.list_for_career(CAREER_ID))
    assert [item.id for item in returned] == [newest.id, older.id]
    assert all(str(item.resume_url) == SIGNED_URL for item in returned)
    assert storage.create_access_url.await_count == 2

    careers.get_by_id.return_value = None
    with pytest.raises(JobApplicationCareerNotFoundError):
        asyncio.run(service.list_for_career(CAREER_ID))


def test_detail_returns_signed_complete_response_and_missing_raises() -> None:
    service, _, applications, _, _, _ = _service()
    applications.get_by_id.return_value = _application()
    detail = asyncio.run(service.get_by_id(APPLICATION_ID))
    assert detail.career_id == CAREER_ID
    assert detail.cover_letter == "Private letter"
    assert str(detail.resume_url) == SIGNED_URL

    applications.get_by_id.return_value = None
    with pytest.raises(JobApplicationNotFoundError):
        asyncio.run(service.get_by_id(APPLICATION_ID))


@pytest.mark.parametrize(
    "application_status",
    ["new", "reviewing", "shortlisted", "rejected", "hired"],
)
def test_update_accepts_every_status_and_audits_safe_context(
    application_status: str,
) -> None:
    service, session, applications, _, audits, _ = _service()
    application = _application(status="new")
    applications.get_by_id.return_value = application
    detail = asyncio.run(
        service.update(
            APPLICATION_ID,
            JobApplicationUpdateRequest(status=application_status, notes="private"),
        )
    )
    assert detail.status == application_status and detail.notes == "private"
    if application_status == "new":
        expected_fields = ["notes"]
    else:
        expected_fields = ["notes", "status"]
    audit = audits.add.await_args.args[0]
    assert audit.context == {
        "career_id": str(CAREER_ID),
        "status": application_status,
        "changed_fields": expected_fields,
    }
    assert "private" not in str(audit.context)
    session.commit.assert_awaited_once_with()


def test_update_omission_and_null_notes_have_distinct_behavior() -> None:
    service, session, applications, _, audits, _ = _service()
    application = _application(status="reviewing", notes="existing")
    applications.get_by_id.return_value = application

    unchanged = asyncio.run(
        service.update(APPLICATION_ID, JobApplicationUpdateRequest())
    )
    assert unchanged.status == "reviewing" and unchanged.notes == "existing"
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()

    cleared = asyncio.run(
        service.update(APPLICATION_ID, JobApplicationUpdateRequest(notes=None))
    )
    assert cleared.notes is None
    assert audits.add.await_args.args[0].context["changed_fields"] == ["notes"]


def test_update_without_resume_completes_without_storage_access() -> None:
    service, session, applications, _, audits, storage = _service()
    application = _application(resume_url=None)
    applications.get_by_id.return_value = application

    detail = asyncio.run(
        service.update(
            APPLICATION_ID,
            JobApplicationUpdateRequest(status="reviewing", notes="Reviewing."),
        )
    )

    assert detail.status == "reviewing" and detail.notes == "Reviewing."
    storage.create_access_url.assert_not_awaited()
    applications.refresh.assert_awaited_once_with(application)
    audits.add.assert_awaited_once()
    session.commit.assert_awaited_once_with()


def test_update_failure_rolls_back_and_hides_database_details() -> None:
    service, session, applications, _, audits, _ = _service()
    applications.get_by_id.return_value = _application()
    audits.add.side_effect = RuntimeError("SQL and constraint details")
    with pytest.raises(JobApplicationPersistenceError) as raised:
        asyncio.run(
            service.update(
                APPLICATION_ID,
                JobApplicationUpdateRequest(status="hired"),
            )
        )
    assert "constraint" not in str(raised.value)
    session.rollback.assert_awaited_once_with()


def test_delete_removes_resume_then_row_and_creates_surviving_safe_audit() -> None:
    service, session, applications, _, audits, storage = _service()
    application = _application(status="shortlisted")
    applications.get_by_id.return_value = application
    asyncio.run(service.delete(APPLICATION_ID))
    storage.delete.assert_awaited_once_with(OBJECT_PATH)
    applications.delete.assert_awaited_once_with(application)
    audit = audits.add.await_args.args[0]
    assert audit.action == "delete"
    assert audit.context == {
        "career_id": str(CAREER_ID),
        "status": "shortlisted",
    }
    session.commit.assert_awaited_once_with()


def test_delete_storage_failure_preserves_database_row() -> None:
    service, session, applications, _, audits, storage = _service()
    applications.get_by_id.return_value = _application()
    storage.delete.side_effect = RuntimeError("storage failure")
    with pytest.raises(RuntimeError, match="storage failure"):
        asyncio.run(service.delete(APPLICATION_ID))
    applications.delete.assert_not_awaited()
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()
