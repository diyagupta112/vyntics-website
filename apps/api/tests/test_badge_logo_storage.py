"""Badge-logo use of the shared public-image storage adapter."""

import asyncio
from hashlib import sha256
from io import BytesIO
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi import UploadFile
from starlette.datastructures import Headers

from app.storage.supabase import SupabaseStorageGateway
from app.storage.uploads import SupabasePublicImageStorage, UploadValidationError


BADGE_ID = UUID("a9ef2526-f734-47aa-b6f8-b3a6cfb18366")
JPEG = b"\xff\xd8\xff\xe0badge"
PNG = b"\x89PNG\r\n\x1a\nbadge"
WEBP = b"RIFF\x04\x00\x00\x00WEBPbadge"
MAX_BYTES = 5 * 1024 * 1024


def _upload(filename: str, content: bytes, content_type: str) -> UploadFile:
    return UploadFile(
        filename=filename,
        file=BytesIO(content),
        headers=Headers({"content-type": content_type}),
    )


@pytest.mark.parametrize(
    ("filename", "content", "content_type", "extension"),
    [
        ("partner.jpeg", JPEG, "image/jpeg", ".jpg"),
        ("partner.png", PNG, "image/png", ".png"),
        ("partner.webp", WEBP, "image/webp", ".webp"),
    ],
)
def test_badge_logo_upload_uses_public_bucket_and_digest_path(
    filename: str,
    content: bytes,
    content_type: str,
    extension: str,
) -> None:
    gateway = AsyncMock(spec=SupabaseStorageGateway)
    expected_path = f"{BADGE_ID}/{sha256(content).hexdigest()}{extension}"
    gateway.public_url.return_value = (
        f"https://project.supabase.co/storage/v1/object/public/"
        f"badge-logos/{expected_path}"
    )
    storage = SupabasePublicImageStorage(
        gateway,
        bucket="badge-logos",
        max_bytes=MAX_BYTES,
    )

    stored = asyncio.run(
        storage.upload(BADGE_ID, _upload(filename, content, content_type))
    )

    assert stored.object_path == expected_path
    assert "/public/badge-logos/" in stored.public_url
    gateway.upload.assert_awaited_once_with(
        "badge-logos",
        expected_path,
        content,
        content_type,
    )


@pytest.mark.parametrize(
    "upload",
    [
        _upload("partner.gif", b"GIF89a", "image/gif"),
        _upload("partner.svg", b"<svg/>", "image/svg+xml"),
        _upload("partner.png", JPEG, "image/png"),
        _upload("partner.png", PNG, "image/jpeg"),
        _upload("partner.png", PNG + b"x" * MAX_BYTES, "image/png"),
    ],
)
def test_badge_logo_rejects_unsupported_mismatch_and_oversize(
    upload: UploadFile,
) -> None:
    storage = SupabasePublicImageStorage(
        AsyncMock(spec=SupabaseStorageGateway),
        bucket="badge-logos",
        max_bytes=MAX_BYTES,
    )

    with pytest.raises(UploadValidationError):
        asyncio.run(storage.upload(BADGE_ID, upload))
