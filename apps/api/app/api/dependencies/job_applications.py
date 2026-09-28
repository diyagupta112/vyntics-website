"""FastAPI dependency wiring for Job Application services."""

from typing import Annotated

from fastapi import Depends, Request

from app.api.dependencies.database import DatabaseSession
from app.api.dependencies.storage import StorageGatewayDependency
from app.core.config import Settings
from app.services.job_applications import JobApplicationService
from app.storage.resumes import (
    ResumeStorage,
    SupabaseResumeStorage,
)


def get_resume_storage(
    request: Request,
    gateway: StorageGatewayDependency,
) -> ResumeStorage | None:
    """Return configured storage, or none while resume storage is unavailable."""

    settings: Settings = request.app.state.settings
    if gateway is None:
        return None
    return SupabaseResumeStorage(settings, gateway=gateway)


ResumeStorageDependency = Annotated[
    ResumeStorage | None,
    Depends(get_resume_storage),
]


def get_job_application_service(
    storage: ResumeStorageDependency,
    session: DatabaseSession,
    request: Request,
) -> JobApplicationService:
    """Create a request-scoped Job Application service."""

    settings: Settings = request.app.state.settings
    return JobApplicationService(
        session,
        storage,
        resume_max_bytes=settings.resume_max_bytes,
    )


JobApplicationServiceDependency = Annotated[
    JobApplicationService,
    Depends(get_job_application_service),
]
