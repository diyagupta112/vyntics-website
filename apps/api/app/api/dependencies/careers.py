"""FastAPI dependency wiring for Career application services."""

from typing import Annotated

from fastapi import Depends

from app.api.dependencies.database import DatabaseSession
from app.services.careers import CareerService


def get_career_service(session: DatabaseSession) -> CareerService:
    """Create a request-scoped Career service."""

    return CareerService(session)


CareerServiceDependency = Annotated[CareerService, Depends(get_career_service)]
