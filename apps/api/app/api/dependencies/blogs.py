"""FastAPI dependency wiring for Blog application services."""

from typing import Annotated

from fastapi import Depends

from app.api.dependencies.database import DatabaseSession
from app.services.blogs import BlogService


def get_blog_service(session: DatabaseSession) -> BlogService:
    """Create a request-scoped Blog service."""

    return BlogService(session)


BlogServiceDependency = Annotated[BlogService, Depends(get_blog_service)]
