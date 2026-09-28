"""Public image validation, naming, and bucket-bound storage tests."""

import asyncio
from hashlib import sha256
from io import BytesIO
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi import UploadFile
from starlette.datastructures import Headers

from app.storage.supabase import SupabaseStorageGateway
from app.storage.uploads import (
    SupabasePublicImageStorage,
    UploadValidationError,
    prepare_image,
)


RESOURCE_ID = UUID("ce8e3179-52a8-4109-b5b4-1c8f896d10b1")
JPEG = b"\xff\xd8\xff\xe0image"
PNG = b"\x89PNG\r\n\x1a\nimage"
WEBP = b"RIFF\x04\x00\x00\x00WEBPimage"


def _upload(name: str, content: bytes, mime: str) -> UploadFile:
    return UploadFile(
        file=BytesIO(content),
        filename=name,
        headers=Headers({"content-type": mime}),
    )


@pytest.mark.parametrize(
    "name,content,mime,extension",
    [
        ("client-name.jpeg", JPEG, "image/jpeg", ".jpg"),
        ("image.png", PNG, "image/png", ".png"),
        ("image.webp", WEBP, "image/webp", ".webp"),
    ],
)
def test_image_validation_and_content_derived_object_naming(
    name: str, content: bytes, mime: str, extension: str
) -> None:
    prepared = asyncio.run(prepare_image(_upload(name, content, mime), max_bytes=100))
    assert prepared.extension == extension
    assert prepared.object_path(RESOURCE_ID) == (
        f"{RESOURCE_ID}/{sha256(content).hexdigest()}{extension}"
    )
    assert name not in prepared.object_path(RESOURCE_ID)


@pytest.mark.parametrize(
    "upload,max_bytes",
    [
        (_upload("image.gif", b"GIF89a", "image/gif"), 100),
        (_upload("image.jpg", b"", "image/jpeg"), 100),
        (_upload("image.jpg", PNG, "image/jpeg"), 100),
        (_upload("image.jpg", JPEG, "image/png"), 100),
        (_upload("image.jpg", JPEG, "image/jpeg"), 3),
    ],
)
def test_image_validation_rejects_unsupported_empty_mismatch_and_size(
    upload: UploadFile, max_bytes: int
) -> None:
    with pytest.raises(UploadValidationError):
        asyncio.run(prepare_image(upload, max_bytes=max_bytes))


def test_public_image_storage_uses_bound_bucket_and_protects_external_url() -> None:
    gateway = AsyncMock(spec=SupabaseStorageGateway)
    gateway.public_url.return_value = "https://project/storage/team-photos/path"
    gateway.managed_public_object_path.return_value = None
    storage = SupabasePublicImageStorage(
        gateway, bucket="team-photos", max_bytes=100
    )

    stored = asyncio.run(
        storage.upload(RESOURCE_ID, _upload("portrait.jpeg", JPEG, "image/jpeg"))
    )
    deleted = asyncio.run(
        storage.delete_managed_url("https://external/photo.jpg", RESOURCE_ID)
    )

    assert stored.object_path.startswith(f"{RESOURCE_ID}/")
    gateway.upload.assert_awaited_once()
    assert gateway.upload.await_args.args[0] == "team-photos"
    assert deleted is False
    gateway.delete.assert_not_awaited()

    gateway.managed_public_object_path.return_value = "other-id/hash.jpg"
    wrong_resource = asyncio.run(
        storage.delete_managed_url(
            "https://project/storage/team-photos/other-id/hash.jpg",
            RESOURCE_ID,
        )
    )
    assert wrong_resource is False
    gateway.delete.assert_not_awaited()

    gateway.managed_public_object_path.return_value = f"{RESOURCE_ID}/hash.jpg"
    managed = asyncio.run(
        storage.delete_managed_url(
            "https://project/storage/team-photos/resource/hash.jpg",
            RESOURCE_ID,
        )
    )
    assert managed is True
    gateway.delete.assert_awaited_once_with(
        "team-photos", f"{RESOURCE_ID}/hash.jpg"
    )
