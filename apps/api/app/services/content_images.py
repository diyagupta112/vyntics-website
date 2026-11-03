"""Inline body images for Blog and Case Study content.

Body images live in their own bucket (never the cover buckets). A content image node may only
reference an object that was uploaded through the backend for the same resource, so authors cannot
bypass upload validation with an arbitrary URL. Lifecycle: when persisted content stops
referencing an image it is deleted after the commit; when the resource is deleted everything under
its folder is deleted. An image that was uploaded but never inserted into content cannot be tracked
without a registry table, so it stays until the resource is deleted.
"""

import logging
from uuid import UUID

from app.schemas.common import JsonObject
from app.schemas.content import content_image_urls
from app.storage.supabase import StorageError
from app.storage.uploads import PublicImageStorage

logger = logging.getLogger(__name__)


class ContentImageError(ValueError):
    """Raised when content references an image the resource does not own."""


def has_content_images(content: JsonObject) -> bool:
    return bool(content_image_urls(content))


def validate_content_images(storage: PublicImageStorage | None, content: JsonObject, resource_id: UUID) -> None:
    """Every image node must reference a managed object belonging to resource_id."""
    urls = content_image_urls(content)
    if not urls:
        return
    if storage is None:
        raise ContentImageError("Content images are unavailable because image storage is not configured")
    for url in sorted(urls):
        if storage.managed_object_path(url, resource_id) is None:
            raise ContentImageError("Content images must be uploaded to this resource through its content-images endpoint")


async def cleanup_removed_images(
    storage: PublicImageStorage | None,
    previous: JsonObject,
    current: JsonObject,
    resource_id: UUID,
    *,
    resource_type: str,
) -> None:
    """Delete images the persisted content no longer references; a still-referenced image is kept."""
    if storage is None:
        return
    still_used = content_image_urls(current)
    for url in sorted(content_image_urls(previous) - still_used):
        try:
            await storage.delete_managed_url(url, resource_id)
        except StorageError:
            logger.warning(
                "Could not clean up a removed content image.",
                extra={"resource_type": resource_type, "resource_id": str(resource_id)},
            )


async def cleanup_all_images(storage: PublicImageStorage | None, resource_id: UUID, *, resource_type: str) -> None:
    """Best-effort removal of every body image of a deleted resource."""
    if storage is None:
        return
    try:
        await storage.delete_all(resource_id)
    except StorageError:
        logger.warning(
            "Could not clean up content images of a deleted resource.",
            extra={"resource_type": resource_type, "resource_id": str(resource_id)},
        )
