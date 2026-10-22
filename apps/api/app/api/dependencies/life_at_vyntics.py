"""Existing session and Storage dependency wiring for Life at Vyntics."""

from typing import Annotated

from fastapi import Depends, Request

from app.api.dependencies.database import DatabaseSession
from app.api.dependencies.storage import StorageGatewayDependency
from app.core.config import Settings
from app.services.life_at_vyntics import LifeAtVynticsService
from app.storage.uploads import SupabasePublicImageStorage


def get_life_at_vyntics_service(
    session: DatabaseSession,
    request: Request,
    gateway: StorageGatewayDependency,
) -> LifeAtVynticsService:
    settings: Settings = request.app.state.settings
    storage = (
        SupabasePublicImageStorage(
            gateway,
            bucket=settings.life_at_vyntics_bucket,
            max_bytes=min(settings.image_max_bytes, 5 * 1024 * 1024),
        )
        if gateway is not None
        else None
    )
    return LifeAtVynticsService(session, image_storage=storage)


LifeAtVynticsServiceDependency = Annotated[LifeAtVynticsService, Depends(get_life_at_vyntics_service)]
