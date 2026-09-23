"""Shared-read and administrative-intent Team Member routes."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status

from app.api.dependencies.team_members import TeamMemberServiceDependency
from app.schemas.team import (
    TeamListResponse,
    TeamMemberCreateRequest,
    TeamMemberResponse,
    TeamMemberUpdateRequest,
)
from app.services.team_members import TeamMemberNotFoundError

router = APIRouter(prefix="/our-team", tags=["our team"])


@router.get("", response_model=TeamListResponse)
async def list_team_members(
    service: TeamMemberServiceDependency,
) -> TeamListResponse:
    """List every Team member ordered by display order."""

    return TeamListResponse(data=await service.list_all())


@router.get("/{team_member_id}", response_model=TeamMemberResponse)
async def get_team_member(
    team_member_id: UUID,
    service: TeamMemberServiceDependency,
) -> object:
    """Return one Team member by UUID."""

    try:
        return await service.get_by_id(team_member_id)
    except TeamMemberNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found.",
        ) from None


@router.post(
    "",
    response_model=TeamMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_team_member(
    request: TeamMemberCreateRequest,
    service: TeamMemberServiceDependency,
) -> object:
    """Create a Team member; authentication is deferred."""

    return await service.create(request)


@router.patch("/{team_member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    team_member_id: UUID,
    request: TeamMemberUpdateRequest,
    service: TeamMemberServiceDependency,
) -> object:
    """Partially update a Team member; authentication is deferred."""

    try:
        return await service.update(team_member_id, request)
    except TeamMemberNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found.",
        ) from None


@router.delete(
    "/{team_member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_team_member(
    team_member_id: UUID,
    service: TeamMemberServiceDependency,
) -> Response:
    """Hard-delete a Team member; authentication is deferred."""

    try:
        await service.delete(team_member_id)
    except TeamMemberNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
