"""Shared-read and administrative-intent Team Member routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, HTTPException, Response, UploadFile, status

from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.team_members import TeamMemberServiceDependency
from app.schemas.team import (
    TeamListResponse,
    TeamMemberCreateRequest,
    TeamMemberResponse,
    TeamMemberUpdateRequest,
)
from app.services.team_members import TeamMemberNotFoundError
from app.storage.supabase import StorageError
from app.storage.uploads import UploadValidationError

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
    admin: AuthenticatedAdminDependency,
    service: TeamMemberServiceDependency,
) -> object:
    """Create a Team member as an authenticated administrator."""

    return await service.create(request, actor=admin)


@router.patch("/{team_member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    team_member_id: UUID,
    request: TeamMemberUpdateRequest,
    admin: AuthenticatedAdminDependency,
    service: TeamMemberServiceDependency,
) -> object:
    """Partially update a Team member as an authenticated administrator."""

    try:
        return await service.update(team_member_id, request, actor=admin)
    except TeamMemberNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found.",
        ) from None


@router.put("/{team_member_id}/photo", response_model=TeamMemberResponse)
async def upload_team_member_photo(
    team_member_id: UUID,
    file: Annotated[UploadFile, File()],
    admin: AuthenticatedAdminDependency,
    service: TeamMemberServiceDependency,
) -> object:
    """Upload or replace a Team member's backend-managed photo."""

    try:
        return await service.upload_photo(team_member_id, file, actor=admin)
    except TeamMemberNotFoundError:
        raise HTTPException(status_code=404, detail="Team member not found.") from None
    except UploadValidationError as error:
        raise HTTPException(status_code=422, detail=str(error)) from None
    except StorageError:
        raise HTTPException(
            status_code=503,
            detail="Image storage is temporarily unavailable.",
        ) from None


@router.delete(
    "/{team_member_id}/photo",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_team_member_photo(
    team_member_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: TeamMemberServiceDependency,
) -> Response:
    """Remove a Team member's optional managed photo."""

    try:
        await service.delete_photo(team_member_id, actor=admin)
    except TeamMemberNotFoundError:
        raise HTTPException(status_code=404, detail="Team member not found.") from None
    except StorageError:
        raise HTTPException(
            status_code=503,
            detail="Image storage is temporarily unavailable.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{team_member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_team_member(
    team_member_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: TeamMemberServiceDependency,
) -> Response:
    """Hard-delete a Team member as an authenticated administrator."""

    try:
        await service.delete(team_member_id, actor=admin)
    except TeamMemberNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
