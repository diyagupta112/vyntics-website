"""FastAPI dependency wiring for Blog application services."""

from typing import Annotated

from fastapi import Depends, Request

from app.api.dependencies.database import DatabaseSession
from app.api.dependencies.storage import StorageGatewayDependency
from app.core.config import Settings
from app.services.blogs import BlogService
from app.storage.uploads import SupabasePublicImageStorage


def get_blog_service(
    session: DatabaseSession,
    request: Request,
    gateway: StorageGatewayDependency,
) -> BlogService:
    """Create a request-scoped Blog service."""

    settings: Settings = request.app.state.settings
    storage = (
        SupabasePublicImageStorage(
            gateway,
            bucket=settings.blog_covers_bucket,
            max_bytes=settings.image_max_bytes,
        )
        if gateway is not None
        else None
    )
    content_storage = (
        SupabasePublicImageStorage(
            gateway,
            bucket=settings.content_images_bucket,
            max_bytes=settings.content_image_max_bytes,
        )
        if gateway is not None
        else None
    )
    return BlogService(session, image_storage=storage, content_image_storage=content_storage)


BlogServiceDependency = Annotated[BlogService, Depends(get_blog_service)]
