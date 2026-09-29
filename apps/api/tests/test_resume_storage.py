"""Resume validation and private Supabase Storage adapter tests."""

import asyncio
from io import BytesIO
from uuid import UUID
from zipfile import ZipFile

import httpx
import pytest
from fastapi import UploadFile
from starlette.datastructures import Headers

from app.core.config import Settings
from app.storage.resumes import (
    PreparedResume,
    ResumeStorageConfigurationError,
    ResumeStorageError,
    ResumeValidationError,
    SupabaseResumeStorage,
    prepare_resume,
)
from app.storage.supabase import SupabaseStorageGateway


APPLICATION_ID = UUID("674da2ca-a558-4dd0-a1eb-d71e1073defe")


def _upload(filename: str, content: bytes, content_type: str) -> UploadFile:
    return UploadFile(
        file=BytesIO(content),
        filename=filename,
        headers=Headers({"content-type": content_type}),
    )


def _docx() -> bytes:
    output = BytesIO()
    with ZipFile(output, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types />")
        archive.writestr("word/document.xml", "<document />")
    return output.getvalue()


@pytest.mark.parametrize(
    "filename,content,content_type,extension",
    [
        ("resume.PDF", b"%PDF-1.7\nbody", "application/pdf", ".pdf"),
        (
            "resume.doc",
            bytes.fromhex("D0CF11E0A1B11AE1") + b"body",
            "application/msword",
            ".doc",
        ),
        (
            "resume.docx",
            _docx(),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".docx",
        ),
    ],
)
def test_prepare_resume_accepts_matching_extension_mime_and_signature(
    filename: str, content: bytes, content_type: str, extension: str
) -> None:
    prepared = asyncio.run(
        prepare_resume(_upload(filename, content, content_type), max_bytes=1024)
    )
    assert prepared.extension == extension
    assert prepared.content == content
    assert prepared.content_type == content_type


@pytest.mark.parametrize(
    "upload,max_bytes",
    [
        (_upload("resume.exe", b"MZ", "application/octet-stream"), 1024),
        (_upload("resume.pdf", b"", "application/pdf"), 1024),
        (_upload("resume.pdf", b"not-pdf", "application/pdf"), 1024),
        (_upload("resume.pdf", b"%PDF-1.7", "application/octet-stream"), 1024),
        (_upload("resume.pdf", b"%PDF-1.7", "application/pdf"), 4),
        (
            _upload(
                "resume.docx",
                b"PK\x03\x04not-a-docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ),
            1024,
        ),
    ],
)
def test_prepare_resume_rejects_unsupported_empty_mismatched_or_oversized(
    upload: UploadFile, max_bytes: int
) -> None:
    with pytest.raises(ResumeValidationError):
        asyncio.run(prepare_resume(upload, max_bytes=max_bytes))


def _settings(**overrides: object) -> Settings:
    values: dict[str, object] = {
        "_env_file": None,
        "debug": False,
        "supabase_url": "https://project.supabase.co",
        "supabase_service_role_key": "service-secret",
        "job_resumes_bucket": "job-applications",
        "resume_signed_url_ttl_seconds": 300,
    }
    values.update(overrides)
    return Settings(**values)


def test_storage_requires_supabase_configuration() -> None:
    with pytest.raises(ResumeStorageConfigurationError):
        SupabaseStorageGateway(
            Settings(_env_file=None, debug=False),
            httpx.AsyncClient(),
        )


def test_storage_upload_sign_and_delete_use_private_api_contract() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        if "/object/sign/" in str(request.url):
            return httpx.Response(
                200,
                json={"signedURL": "/object/sign/job-applications/path?token=private"},
            )
        return httpx.Response(200, json={})

    async def exercise() -> tuple[str, str]:
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            settings = _settings()
            gateway = SupabaseStorageGateway(settings, client)
            storage = SupabaseResumeStorage(settings, gateway=gateway)
            path = await storage.upload(
                APPLICATION_ID,
                PreparedResume(b"%PDF-1.7", ".pdf", "application/pdf"),
            )
            signed_url = await storage.create_access_url(path)
            await storage.delete(path)
            return path, signed_url

    path, signed_url = asyncio.run(exercise())
    assert path.startswith(f"{APPLICATION_ID}/") and path.endswith(".pdf")
    assert signed_url.startswith("https://project.supabase.co/storage/v1/object/sign/")
    assert "token=private" in signed_url
    assert [request.method for request in requests] == ["POST", "POST", "DELETE"]
    assert requests[0].headers["authorization"] == "Bearer service-secret"
    assert requests[0].headers["content-type"] == "application/pdf"
    assert b'"expiresIn":300' in requests[1].content
    assert f'"{path}"'.encode() in requests[2].content
    assert all("service-secret" not in str(request.url) for request in requests)


def test_storage_wraps_provider_errors_without_leaking_response() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, text="private bucket and SQL details")

    async def exercise() -> None:
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            settings = _settings()
            gateway = SupabaseStorageGateway(settings, client)
            storage = SupabaseResumeStorage(settings, gateway=gateway)
            await storage.create_access_url("private/path.pdf")

    with pytest.raises(ResumeStorageError) as raised:
        asyncio.run(exercise())
    assert "private bucket" not in str(raised.value)
