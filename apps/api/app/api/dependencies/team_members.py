"""FastAPI dependency wiring for Team Member application services."""

from typing import Annotated

from fastapi import Depends, Request

from app.api.dependencies.database import DatabaseSession
from app.api.dependencies.storage import StorageGatewayDependency
from app.core.config import Settings
from app.services.team_members import TeamMemberService
from app.storage.uploads import SupabasePublicImageStorage


def get_team_member_service(
    session: DatabaseSession,
    request: Request,
    gateway: StorageGatewayDependency,
) -> TeamMemberService:
    """Create a request-scoped Team Member service."""

    settings: Settings = request.app.state.settings
    storage = (
        SupabasePublicImageStorage(
            gateway,
            bucket=settings.team_photos_bucket,
            max_bytes=settings.image_max_bytes,
        )
        if gateway is not None
        else None
    )
    return TeamMemberService(session, image_storage=storage)


TeamMemberServiceDependency = Annotated[
    TeamMemberService,
    Depends(get_team_member_service),
]
