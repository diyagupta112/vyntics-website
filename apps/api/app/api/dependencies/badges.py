"""FastAPI dependency wiring for Badge services."""

from typing import Annotated

from fastapi import Depends, Request

from app.api.dependencies.database import DatabaseSession
from app.api.dependencies.storage import StorageGatewayDependency
from app.core.config import Settings
from app.services.badges import BadgeService
from app.storage.uploads import SupabasePublicImageStorage


def get_badge_service(
    session: DatabaseSession,
    request: Request,
    gateway: StorageGatewayDependency,
) -> BadgeService:
    settings: Settings = request.app.state.settings
    storage = (
        SupabasePublicImageStorage(
            gateway,
            bucket=settings.badge_logos_bucket,
            max_bytes=settings.image_max_bytes,
        )
        if gateway is not None
        else None
    )
    return BadgeService(session, image_storage=storage)


BadgeServiceDependency = Annotated[BadgeService, Depends(get_badge_service)]
