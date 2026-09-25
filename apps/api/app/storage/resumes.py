"""Validation and private Supabase Storage operations for resumes."""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Protocol
from urllib.parse import quote
from uuid import UUID
from zipfile import BadZipFile, ZipFile

import httpx
from fastapi import UploadFile

from app.core.config import Settings


RESUME_MIME_TYPES = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ),
}
PDF_SIGNATURE = b"%PDF-"
OLE_SIGNATURE = bytes.fromhex("D0CF11E0A1B11AE1")
ZIP_SIGNATURES = (b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08")


class ResumeValidationError(ValueError):
    """Raised when an uploaded resume violates the approved file contract."""


class ResumeStorageError(RuntimeError):
    """Raised when a private resume storage operation fails safely."""


class ResumeStorageConfigurationError(ResumeStorageError):
    """Raised when required Supabase Storage settings are unavailable."""


@dataclass(frozen=True, slots=True)
class PreparedResume:
    """Validated resume bytes ready for private storage."""

    content: bytes
    extension: str
    content_type: str


class ResumeStorage(Protocol):
    """Private storage boundary consumed by the Job Application service."""

    async def upload(self, application_id: UUID, resume: PreparedResume) -> str:
        """Upload a resume and return its private object-path reference."""

    async def create_access_url(self, object_path: str) -> str:
        """Create a short-lived administrative download URL."""

    async def delete(self, object_path: str) -> None:
        """Delete a stored resume object."""


async def prepare_resume(upload: UploadFile, *, max_bytes: int) -> PreparedResume:
    """Read and validate size, extension, MIME type, and file signature."""

    extension = Path(upload.filename or "").suffix.lower()
    expected_mime = RESUME_MIME_TYPES.get(extension)
    if expected_mime is None:
        raise ResumeValidationError("Unsupported resume file extension.")

    supplied_mime = (upload.content_type or "").split(";", 1)[0].strip().lower()
    if supplied_mime != expected_mime:
        raise ResumeValidationError("Resume content type does not match its extension.")

    try:
        content = await upload.read(max_bytes + 1)
    finally:
        await upload.close()

    if not content:
        raise ResumeValidationError("Resume file must not be empty.")
    if len(content) > max_bytes:
        raise ResumeValidationError("Resume file exceeds the maximum allowed size.")
    if not _content_matches_extension(extension, content):
        raise ResumeValidationError("Resume content does not match its extension.")

    return PreparedResume(
        content=content,
        extension=extension,
        content_type=expected_mime,
    )


def _content_matches_extension(extension: str, content: bytes) -> bool:
    if extension == ".pdf":
        return content.startswith(PDF_SIGNATURE)
    if extension == ".doc":
        return content.startswith(OLE_SIGNATURE)
    if extension != ".docx" or not content.startswith(ZIP_SIGNATURES):
        return False

    try:
        with ZipFile(BytesIO(content)) as archive:
            names = set(archive.namelist())
    except (BadZipFile, OSError):
        return False
    return "[Content_Types].xml" in names and any(
        name.startswith("word/") for name in names
    )


class SupabaseResumeStorage:
    """Private resume storage implemented through the Supabase Storage API."""

    def __init__(
        self,
        settings: Settings,
        *,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        if settings.supabase_url is None or settings.supabase_service_role_key is None:
            raise ResumeStorageConfigurationError(
                "Resume storage is not configured."
            )

        self._base_url = f"{str(settings.supabase_url).rstrip('/')}/storage/v1"
        self._bucket = settings.job_resumes_bucket
        self._ttl_seconds = settings.resume_signed_url_ttl_seconds
        service_key = settings.supabase_service_role_key.get_secret_value()
        self._headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
        }
        self._client = client

    async def upload(self, application_id: UUID, resume: PreparedResume) -> str:
        """Upload to an opaque per-application path without public access."""

        object_path = f"{application_id}/resume{resume.extension}"
        url = self._object_url(object_path)
        headers = {
            **self._headers,
            "Content-Type": resume.content_type,
            "cache-control": "no-store",
            "x-upsert": "false",
        }
        await self._request("POST", url, headers=headers, content=resume.content)
        return object_path

    async def create_access_url(self, object_path: str) -> str:
        """Create a five-minute signed download URL for an admin response."""

        url = (
            f"{self._base_url}/object/sign/{quote(self._bucket, safe='')}/"
            f"{quote(object_path, safe='/')}"
        )
        response = await self._request(
            "POST",
            url,
            headers=self._headers,
            json={"expiresIn": self._ttl_seconds},
        )
        try:
            signed_path = response.json()["signedURL"]
        except (KeyError, TypeError, ValueError) as error:
            raise ResumeStorageError("Resume access could not be created.") from error

        if not isinstance(signed_path, str) or not signed_path.startswith("/"):
            raise ResumeStorageError("Resume access could not be created.")
        return f"{self._base_url}{signed_path}"

    async def delete(self, object_path: str) -> None:
        """Remove one resume from the configured private bucket."""

        url = f"{self._base_url}/object/{quote(self._bucket, safe='')}"
        await self._request(
            "DELETE",
            url,
            headers=self._headers,
            json={"prefixes": [object_path]},
        )

    def _object_url(self, object_path: str) -> str:
        return (
            f"{self._base_url}/object/{quote(self._bucket, safe='')}/"
            f"{quote(object_path, safe='/')}"
        )

    async def _request(self, method: str, url: str, **kwargs: object) -> httpx.Response:
        try:
            if self._client is not None:
                response = await self._client.request(method, url, **kwargs)
            else:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.request(method, url, **kwargs)
            response.raise_for_status()
            return response
        except (httpx.HTTPError, OSError) as error:
            raise ResumeStorageError("Resume storage operation failed.") from error
