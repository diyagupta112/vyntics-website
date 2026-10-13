"""Existing session dependency wiring for testimonials."""

from typing import Annotated
from fastapi import Depends, Request
from app.api.dependencies.database import DatabaseSession
from app.api.dependencies.storage import StorageGatewayDependency
from app.core.config import Settings
from app.storage.uploads import SupabasePublicImageStorage
from app.services.testimonials import TestimonialService


def get_testimonial_service(
    session: DatabaseSession,
    request: Request,
    gateway: StorageGatewayDependency,
) -> TestimonialService:
    settings: Settings = request.app.state.settings
    storage = (
        SupabasePublicImageStorage(
            gateway,
            bucket=settings.testimonial_logos_bucket,
            max_bytes=min(settings.image_max_bytes, 5 * 1024 * 1024),
        )
        if gateway is not None
        else None
    )
    return TestimonialService(session, image_storage=storage)


TestimonialServiceDependency = Annotated[TestimonialService, Depends(get_testimonial_service)]
