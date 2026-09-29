"""Shared upload validation and public image storage workflow."""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from typing import Callable, Protocol
from uuid import UUID

from fastapi import UploadFile

from app.storage.supabase import SupabaseStorageGateway


class UploadValidationError(ValueError):
    """Raised when a supplied file violates its resource contract."""


@dataclass(frozen=True, slots=True)
class PreparedUpload:
    """Validated content with a canonical provider-facing file type."""

    content: bytes
    extension: str
    content_type: str

    @property
    def content_digest(self) -> str:
        return sha256(self.content).hexdigest()

    def object_path(self, resource_id: UUID) -> str:
        return f"{resource_id}/{self.content_digest}{self.extension}"


@dataclass(frozen=True, slots=True)
class FileTypeRule:
    extensions: frozenset[str]
    content_type: str
    stored_extension: str
    matches_content: Callable[[bytes], bool]


@dataclass(frozen=True, slots=True)
class StoredPublicObject:
    public_url: str
    object_path: str


class PublicImageStorage(Protocol):
    async def upload(self, resource_id: UUID, upload: UploadFile) -> StoredPublicObject:
        """Validate and upload a public image."""

    async def delete_path(self, object_path: str) -> None:
        """Delete a trusted path, normally as upload compensation."""

    async def delete_managed_url(self, value: str, resource_id: UUID) -> bool:
        """Delete only an exact URL managed by this bucket."""


def _jpeg(content: bytes) -> bool:
    return len(content) >= 3 and content.startswith(b"\xff\xd8\xff")


def _png(content: bytes) -> bool:
    return content.startswith(b"\x89PNG\r\n\x1a\n")


def _webp(content: bytes) -> bool:
    return len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"


IMAGE_RULES = (
    FileTypeRule(frozenset({".jpg", ".jpeg"}), "image/jpeg", ".jpg", _jpeg),
    FileTypeRule(frozenset({".png"}), "image/png", ".png", _png),
    FileTypeRule(frozenset({".webp"}), "image/webp", ".webp", _webp),
)


async def prepare_upload(
    upload: UploadFile,
    *,
    max_bytes: int,
    rules: tuple[FileTypeRule, ...],
    label: str,
) -> PreparedUpload:
    """Validate size, extension, MIME, and content, returning a canonical type."""

    supplied_extension = Path(upload.filename or "").suffix.lower()
    supplied_mime = (upload.content_type or "").split(";", 1)[0].strip().lower()
    extension_rule = next(
        (rule for rule in rules if supplied_extension in rule.extensions),
        None,
    )
    if extension_rule is None:
        await upload.close()
        raise UploadValidationError(f"Unsupported {label} file extension.")
    if supplied_mime != extension_rule.content_type:
        await upload.close()
        raise UploadValidationError(f"{label.capitalize()} content type does not match its extension.")

    try:
        content = await upload.read(max_bytes + 1)
    finally:
        await upload.close()
    if not content:
        raise UploadValidationError(f"{label.capitalize()} file must not be empty.")
    if len(content) > max_bytes:
        raise UploadValidationError(f"{label.capitalize()} file exceeds the maximum allowed size.")
    if not extension_rule.matches_content(content):
        raise UploadValidationError(f"{label.capitalize()} content does not match its extension.")
    return PreparedUpload(
        content=content,
        extension=extension_rule.stored_extension,
        content_type=extension_rule.content_type,
    )


async def prepare_image(upload: UploadFile, *, max_bytes: int) -> PreparedUpload:
    return await prepare_upload(
        upload,
        max_bytes=max_bytes,
        rules=IMAGE_RULES,
        label="image",
    )


class SupabasePublicImageStorage:
    """Resource-bound public image storage; clients cannot select its bucket."""

    def __init__(
        self,
        gateway: SupabaseStorageGateway,
        *,
        bucket: str,
        max_bytes: int,
    ) -> None:
        self._gateway = gateway
        self._bucket = bucket
        self._max_bytes = max_bytes

    async def upload(self, resource_id: UUID, upload: UploadFile) -> StoredPublicObject:
        prepared = await prepare_image(upload, max_bytes=self._max_bytes)
        object_path = prepared.object_path(resource_id)
        await self._gateway.upload(
            self._bucket,
            object_path,
            prepared.content,
            prepared.content_type,
        )
        return StoredPublicObject(
            public_url=self._gateway.public_url(self._bucket, object_path),
            object_path=object_path,
        )

    async def delete_path(self, object_path: str) -> None:
        await self._gateway.delete(self._bucket, object_path)

    async def delete_managed_url(self, value: str, resource_id: UUID) -> bool:
        object_path = self._gateway.managed_public_object_path(self._bucket, value)
        if object_path is None or not object_path.startswith(f"{resource_id}/"):
            return False
        await self.delete_path(object_path)
        return True
