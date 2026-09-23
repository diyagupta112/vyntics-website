"""FastAPI dependency wiring for Case Study application services."""

from typing import Annotated

from fastapi import Depends

from app.api.dependencies.database import DatabaseSession
from app.services.case_studies import CaseStudyService


def get_case_study_service(session: DatabaseSession) -> CaseStudyService:
    """Create a request-scoped Case Study service."""

    return CaseStudyService(session)


CaseStudyServiceDependency = Annotated[
    CaseStudyService,
    Depends(get_case_study_service),
]
