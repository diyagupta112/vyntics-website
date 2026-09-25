"""API contract tests for Job Application routes."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.job_applications import (
    get_job_application_service,
    get_resume_storage,
)
from app.core.config import Environment, Settings
from app.db.models.job_application import JobApplication
from app.main import create_app
from app.schemas.job_applications import (
    JobApplicationAdminDetail,
    JobApplicationAdminListItem,
)
from app.services.job_applications import (
    JobApplicationCareerNotFoundError,
    JobApplicationNotFoundError,
    JobApplicationService,
)
from app.storage.resumes import ResumeStorageError, ResumeValidationError


APPLICATION_ID = UUID("674da2ca-a558-4dd0-a1eb-d71e1073defe")
CAREER_ID = UUID("b6aa692a-6527-4266-a495-1080e742d210")
SUBMITTED_AT = datetime(2026, 9, 25, 12, 0, tzinfo=timezone.utc)
SIGNED_URL = "https://example.supabase.co/storage/v1/object/sign/job-resumes/file?token=x"
LIST_FIELDS = {
    "id", "name", "email", "phone", "status", "submitted_at", "resume_url",
}
DETAIL_FIELDS = LIST_FIELDS | {"career_id", "cover_letter", "notes"}


def _application(**overrides: object) -> JobApplication:
    values: dict[str, object] = {
        "id": APPLICATION_ID,
        "career_id": CAREER_ID,
        "name": "Ada Applicant",
        "email": "ada@example.com",
        "phone": "+91 9999999999",
        "resume_url": f"{APPLICATION_ID}/resume.pdf",
        "cover_letter": "Private cover letter",
        "status": "new",
        "notes": None,
        "submitted_at": SUBMITTED_AT,
    }
    values.update(overrides)
    return JobApplication(**values)


def _list_item(**overrides: object) -> JobApplicationAdminListItem:
    values: dict[str, object] = {
        "id": APPLICATION_ID,
        "name": "Ada Applicant",
        "email": "ada@example.com",
        "phone": "+91 9999999999",
        "status": "new",
        "submitted_at": SUBMITTED_AT,
        "resume_url": SIGNED_URL,
    }
    values.update(overrides)
    return JobApplicationAdminListItem(**values)


def _detail(**overrides: object) -> JobApplicationAdminDetail:
    values = _list_item().model_dump()
    values.update(
        career_id=CAREER_ID,
        cover_letter="Private cover letter",
        notes=None,
    )
    values.update(overrides)
    return JobApplicationAdminDetail(**values)


@pytest.fixture
def job_application_api() -> tuple[TestClient, AsyncMock]:
    service = AsyncMock(spec=JobApplicationService)
    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST, debug=False)
    )
    application.dependency_overrides[get_job_application_service] = lambda: service
    with TestClient(application, raise_server_exceptions=False) as client:
        yield client, service


def _multipart(**data_overrides: str):
    data = {
        "name": "Ada Applicant",
        "email": "ada@example.com",
        "phone": "+91 9999999999",
        "cover_letter": "Private cover letter",
    }
    data.update(data_overrides)
    files = {"resume": ("resume.pdf", b"%PDF-1.7\nresume", "application/pdf")}
    return data, files


def test_public_submission_returns_minimal_201_receipt(job_application_api) -> None:
    client, service = job_application_api
    service.create.return_value = _application()
    data, files = _multipart()

    response = client.post("/careers/Senior-Engineer/apply", data=data, files=files)

    assert response.status_code == 201
    assert set(response.json()) == {"id", "status", "submitted_at"}
    assert response.json()["status"] == "new"
    assert "resume_url" not in response.json() and "notes" not in response.json()
    slug, request = service.create.await_args.args
    assert slug == "Senior-Engineer"
    assert request.name == "Ada Applicant"
    assert request.resume.filename == "resume.pdf"


def test_public_submission_temporarily_accepts_no_resume(job_application_api) -> None:
    client, service = job_application_api
    service.create.return_value = _application(resume_url=None)

    response = client.post(
        "/careers/Senior-Engineer/apply",
        data={
            "name": "Ada Applicant",
            "email": "ada@example.com",
            "phone": "+91 9999999999",
        },
    )

    assert response.status_code == 201
    assert set(response.json()) == {"id", "status", "submitted_at"}
    request = service.create.await_args.args[1]
    assert request.resume is None


@pytest.mark.parametrize(
    "field,value",
    [
        ("career_id", str(CAREER_ID)),
        ("status", "hired"),
        ("submitted_at", "2026-09-25T12:00:00Z"),
        ("resume_url", "public-url"),
        ("notes", "forbidden"),
        ("id", str(APPLICATION_ID)),
    ],
)
def test_public_submission_rejects_internal_fields(
    job_application_api, field: str, value: str
) -> None:
    client, service = job_application_api
    data, files = _multipart(**{field: value})
    response = client.post("/careers/Senior-Engineer/apply", data=data, files=files)
    assert response.status_code == 422
    service.create.assert_not_awaited()


def test_public_submission_validates_required_email_and_extension(
    job_application_api,
) -> None:
    client, service = job_application_api
    _, files = _multipart()
    missing = client.post(
        "/careers/job/apply",
        data={"email": "ada@example.com", "phone": "1"},
        files=files,
    )
    assert missing.status_code == 422

    data, _ = _multipart(email="invalid")
    invalid_email = client.post(
        "/careers/job/apply",
        data=data,
        files={"resume": ("resume.pdf", b"%PDF-1.7", "application/pdf")},
    )
    assert invalid_email.status_code == 422

    data, _ = _multipart()
    invalid_file = client.post(
        "/careers/job/apply",
        data=data,
        files={"resume": ("resume.exe", b"MZ", "application/octet-stream")},
    )
    assert invalid_file.status_code == 422
    service.create.assert_not_awaited()


def test_public_submission_maps_domain_and_storage_errors(job_application_api) -> None:
    client, service = job_application_api
    data, files = _multipart()
    service.create.side_effect = JobApplicationCareerNotFoundError
    missing = client.post("/careers/missing/apply", data=data, files=files)
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Career not found."}

    data, files = _multipart()
    service.create.side_effect = ResumeValidationError("Invalid private file.")
    invalid = client.post("/careers/job/apply", data=data, files=files)
    assert invalid.status_code == 422
    assert invalid.json() == {"detail": "Invalid private file."}

    data, files = _multipart()
    service.create.side_effect = ResumeStorageError("secret bucket details")
    unavailable = client.post("/careers/job/apply", data=data, files=files)
    assert unavailable.status_code == 503
    assert "secret" not in unavailable.text


def test_admin_list_returns_exact_fields_and_maps_missing(job_application_api) -> None:
    client, service = job_application_api
    service.list_for_career.return_value = [
        _list_item(),
        _list_item(
            id=UUID("6713947a-7261-4174-811a-fdc93769658e"),
            status="reviewing",
        ),
    ]
    response = client.get(f"/admin/careers/{CAREER_ID}/applications")
    assert response.status_code == 200
    assert all(set(item) == LIST_FIELDS for item in response.json())
    assert response.json()[0]["resume_url"].startswith("https://")

    service.list_for_career.return_value = []
    assert client.get(f"/admin/careers/{CAREER_ID}/applications").json() == []

    service.list_for_career.side_effect = JobApplicationCareerNotFoundError
    missing = client.get(f"/admin/careers/{CAREER_ID}/applications")
    assert missing.status_code == 404


def test_admin_detail_returns_exact_fields_and_404(job_application_api) -> None:
    client, service = job_application_api
    service.get_by_id.return_value = _detail()
    response = client.get(f"/admin/job-applications/{APPLICATION_ID}")
    assert response.status_code == 200
    assert set(response.json()) == DETAIL_FIELDS

    service.get_by_id.side_effect = JobApplicationNotFoundError
    missing = client.get(f"/admin/job-applications/{APPLICATION_ID}")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Job Application not found."}


@pytest.mark.parametrize(
    "application_status",
    ["new", "reviewing", "shortlisted", "rejected", "hired"],
)
def test_admin_patch_accepts_all_statuses(
    job_application_api, application_status: str
) -> None:
    client, service = job_application_api
    service.update.return_value = _detail(status=application_status)
    response = client.patch(
        f"/admin/job-applications/{APPLICATION_ID}",
        json={"status": application_status},
    )
    assert response.status_code == 200
    assert response.json()["status"] == application_status
    assert service.update.await_args.args[1].status == application_status


@pytest.mark.parametrize(
    "body",
    [
        {"status": "interview"},
        {"status": None},
        {"career_id": str(CAREER_ID)},
        {"email": "changed@example.com"},
        {"resume_url": "https://example.com/replacement"},
        {"submitted_at": "2026-09-25T12:00:00Z"},
    ],
)
def test_admin_patch_rejects_invalid_or_immutable_fields(
    job_application_api, body: dict[str, object]
) -> None:
    client, service = job_application_api
    response = client.patch(f"/admin/job-applications/{APPLICATION_ID}", json=body)
    assert response.status_code == 422
    service.update.assert_not_awaited()


def test_admin_patch_allows_notes_null_and_maps_missing(job_application_api) -> None:
    client, service = job_application_api
    service.update.return_value = _detail(notes=None)
    response = client.patch(
        f"/admin/job-applications/{APPLICATION_ID}", json={"notes": None}
    )
    assert response.status_code == 200
    assert service.update.await_args.args[1].model_fields_set == {"notes"}

    service.update.side_effect = JobApplicationNotFoundError
    missing = client.patch(
        f"/admin/job-applications/{APPLICATION_ID}", json={"notes": "note"}
    )
    assert missing.status_code == 404


def test_admin_delete_returns_empty_204_and_safe_errors(job_application_api) -> None:
    client, service = job_application_api
    deleted = client.delete(f"/admin/job-applications/{APPLICATION_ID}")
    assert deleted.status_code == 204 and deleted.content == b""

    service.delete.side_effect = JobApplicationNotFoundError
    missing = client.delete(f"/admin/job-applications/{APPLICATION_ID}")
    assert missing.status_code == 404

    service.delete.side_effect = ResumeStorageError("private storage internals")
    failed = client.delete(f"/admin/job-applications/{APPLICATION_ID}")
    assert failed.status_code == 503
    assert "internals" not in failed.text


def test_invalid_admin_ids_use_standard_422(job_application_api) -> None:
    client, service = job_application_api
    assert client.get("/admin/job-applications/not-a-uuid").status_code == 422
    assert client.patch("/admin/job-applications/not-a-uuid", json={}).status_code == 422
    assert client.delete("/admin/job-applications/not-a-uuid").status_code == 422
    assert client.get("/admin/careers/not-a-uuid/applications").status_code == 422
    service.get_by_id.assert_not_awaited()


def test_openapi_exposes_exact_phase_nine_operations(job_application_api) -> None:
    client, _ = job_application_api
    paths = client.get("/openapi.json").json()["paths"]
    assert set(paths["/careers/{slug}/apply"]) == {"post"}
    assert set(paths["/admin/careers/{career_id}/applications"]) == {"get"}
    assert set(paths["/admin/job-applications/{application_id}"]) == {
        "get", "patch", "delete",
    }
    content = paths["/careers/{slug}/apply"]["post"]["requestBody"]["content"]
    assert set(content) == {"multipart/form-data"}
    assert "/job-applications" not in paths


def test_unconfigured_storage_dependency_returns_none() -> None:
    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST, debug=False)
    )
    request = type("Request", (), {"app": application})()
    assert get_resume_storage(request) is None
