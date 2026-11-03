"""FastAPI dependency wiring for Case Study application services."""

from typing import Annotated

from fastapi import Depends, Request

from app.api.dependencies.database import DatabaseSession
from app.api.dependencies.storage import StorageGatewayDependency
from app.core.config import Settings
from app.services.case_studies import CaseStudyService
from app.storage.uploads import SupabasePublicImageStorage


def get_case_study_service(
    session: DatabaseSession,
    request: Request,
    gateway: StorageGatewayDependency,
) -> CaseStudyService:
    """Create a request-scoped Case Study service."""

    settings: Settings = request.app.state.settings
    storage = (
        SupabasePublicImageStorage(
            gateway,
            bucket=settings.case_study_covers_bucket,
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
    return CaseStudyService(session, image_storage=storage, content_image_storage=content_storage)


CaseStudyServiceDependency = Annotated[
    CaseStudyService,
    Depends(get_case_study_service),
]
