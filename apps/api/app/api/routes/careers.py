"""Shared-read and administrative-intent Career API routes."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status

from app.api.dependencies.careers import CareerServiceDependency
from app.schemas.careers import (
    CareerCreateRequest,
    CareerDetailResponse,
    CareerListResponse,
    CareerUpdateRequest,
)
from app.services.careers import (
    CareerDeletionConflictError,
    CareerNotFoundError,
    CareerSlugConflictError,
)

router = APIRouter(prefix="/careers", tags=["careers"])


@router.get("", response_model=CareerListResponse)
async def list_careers(
    service: CareerServiceDependency,
) -> CareerListResponse:
    """List every existing Career ordered by publication time descending."""

    return CareerListResponse(data=await service.list_all())


@router.get("/{slug}", response_model=CareerDetailResponse)
async def get_career(
    slug: str,
    service: CareerServiceDependency,
) -> object:
    """Return one existing Career by slug."""

    try:
        return await service.get_by_slug(slug)
    except CareerNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found.",
        ) from None


@router.post(
    "",
    response_model=CareerDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_career(
    request: CareerCreateRequest,
    service: CareerServiceDependency,
) -> object:
    """Create a Career; authentication is deferred."""

    try:
        return await service.create(request)
    except CareerSlugConflictError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A Career with this slug already exists.",
        ) from None


@router.patch("/{career_id}", response_model=CareerDetailResponse)
async def update_career(
    career_id: UUID,
    request: CareerUpdateRequest,
    service: CareerServiceDependency,
) -> object:
    """Partially update a Career; authentication is deferred."""

    try:
        return await service.update(career_id, request)
    except CareerNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found.",
        ) from None
    except CareerSlugConflictError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A Career with this slug already exists.",
        ) from None


@router.delete(
    "/{career_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_career(
    career_id: UUID,
    service: CareerServiceDependency,
) -> Response:
    """Hard-delete a Career; authentication is deferred."""

    try:
        await service.delete(career_id)
    except CareerNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found.",
        ) from None
    except CareerDeletionConflictError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Career cannot be deleted while job applications exist.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
