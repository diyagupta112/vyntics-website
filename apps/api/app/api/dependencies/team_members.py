"""FastAPI dependency wiring for Team Member application services."""

from typing import Annotated

from fastapi import Depends

from app.api.dependencies.database import DatabaseSession
from app.services.team_members import TeamMemberService


def get_team_member_service(session: DatabaseSession) -> TeamMemberService:
    """Create a request-scoped Team Member service."""

    return TeamMemberService(session)


TeamMemberServiceDependency = Annotated[
    TeamMemberService,
    Depends(get_team_member_service),
]
