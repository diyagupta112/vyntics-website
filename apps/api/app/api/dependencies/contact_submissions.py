"""FastAPI dependency wiring for Contact Submission services."""

from typing import Annotated

from fastapi import Depends

from app.api.dependencies.database import DatabaseSession
from app.services.contact_submissions import ContactSubmissionService


def get_contact_submission_service(
    session: DatabaseSession,
) -> ContactSubmissionService:
    """Create a request-scoped Contact Submission service."""

    return ContactSubmissionService(session)


ContactSubmissionServiceDependency = Annotated[
    ContactSubmissionService,
    Depends(get_contact_submission_service),
]
