"""Request-scoped application export service."""

from typing import Annotated
from fastapi import Depends
from app.api.dependencies.database import DatabaseSession
from app.services.job_application_export import JobApplicationExportService


def get_job_application_export_service(session: DatabaseSession) -> JobApplicationExportService:
    return JobApplicationExportService(session)


JobApplicationExportDependency = Annotated[
    JobApplicationExportService, Depends(get_job_application_export_service),
]
