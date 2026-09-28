"""Validation and private Supabase Storage operations for resumes."""

from __future__ import annotations

from io import BytesIO
from typing import Protocol
from uuid import UUID
from zipfile import BadZipFile, ZipFile

from fastapi import UploadFile

from app.core.config import Settings
from app.storage.supabase import (
    StorageConfigurationError,
    StorageError,
    SupabaseStorageGateway,
)
from app.storage.uploads import FileTypeRule, PreparedUpload, prepare_upload


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


ResumeStorageError = StorageError
ResumeStorageConfigurationError = StorageConfigurationError
PreparedResume = PreparedUpload


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
    try:
        return await prepare_upload(
            upload,
            max_bytes=max_bytes,
            rules=RESUME_RULES,
            label="resume",
        )
    except ValueError as error:
        raise ResumeValidationError(str(error)) from error


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


RESUME_RULES = tuple(
    FileTypeRule(
        extensions=frozenset({extension}),
        content_type=content_type,
        stored_extension=extension,
        matches_content=lambda content, extension=extension: _content_matches_extension(
            extension,
            content,
        ),
    )
    for extension, content_type in RESUME_MIME_TYPES.items()
)


class SupabaseResumeStorage:
    """Private resume storage implemented through the Supabase Storage API."""

    def __init__(
        self,
        settings: Settings,
        *,
        gateway: SupabaseStorageGateway,
    ) -> None:
        self._gateway = gateway
        self._bucket = settings.job_resumes_bucket
        self._ttl_seconds = settings.resume_signed_url_ttl_seconds

    async def upload(self, application_id: UUID, resume: PreparedResume) -> str:
        """Upload to an opaque per-application path without public access."""

        object_path = resume.object_path(application_id)
        await self._gateway.upload(
            self._bucket,
            object_path,
            resume.content,
            resume.content_type,
        )
        return object_path

    async def create_access_url(self, object_path: str) -> str:
        """Create a five-minute signed download URL for an admin response."""

        return await self._gateway.create_signed_url(
            self._bucket,
            object_path,
            self._ttl_seconds,
        )

    async def delete(self, object_path: str) -> None:
        """Remove one resume from the configured private bucket."""

        await self._gateway.delete(self._bucket, object_path)
