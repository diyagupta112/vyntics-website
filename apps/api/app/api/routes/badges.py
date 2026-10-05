"""Public and administrative Badge API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, HTTPException, Response, UploadFile, status

from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.badges import BadgeServiceDependency
from app.schemas.badges import (
    BadgeAdminResponse,
    BadgeCreateRequest,
    BadgeListResponse,
    BadgeUpdateRequest,
)
from app.services.badges import (
    BadgeNotFoundError,
    BadgePersistenceError,
)
from app.storage.supabase import StorageError
from app.storage.uploads import UploadValidationError


router = APIRouter(prefix="/badges", tags=["badges"])
admin_router = APIRouter(prefix="/admin/badges", tags=["admin badges"])


def _not_found() -> HTTPException:
    return HTTPException(status_code=404, detail="Badge not found.")


def _persistence_error() -> HTTPException:
    return HTTPException(status_code=500, detail="Unable to persist Badge.")


@router.get("", response_model=BadgeListResponse)
async def list_public_badges(service: BadgeServiceDependency) -> BadgeListResponse:
    return BadgeListResponse(data=await service.list_public())


@admin_router.get("", response_model=list[BadgeAdminResponse])
async def list_admin_badges(
    _admin: AuthenticatedAdminDependency,
    service: BadgeServiceDependency,
) -> list[object]:
    return await service.list_all()


@admin_router.get("/{badge_id}", response_model=BadgeAdminResponse)
async def get_admin_badge(
    badge_id: UUID,
    _admin: AuthenticatedAdminDependency,
    service: BadgeServiceDependency,
) -> object:
    try:
        return await service.get_by_id(badge_id)
    except BadgeNotFoundError:
        raise _not_found() from None


@router.post("", response_model=BadgeAdminResponse, status_code=201)
async def create_badge(
    request: BadgeCreateRequest,
    admin: AuthenticatedAdminDependency,
    service: BadgeServiceDependency,
) -> object:
    try:
        return await service.create(request, actor=admin)
    except BadgePersistenceError:
        raise _persistence_error() from None


@router.patch("/{badge_id}", response_model=BadgeAdminResponse)
async def update_badge(
    badge_id: UUID,
    request: BadgeUpdateRequest,
    admin: AuthenticatedAdminDependency,
    service: BadgeServiceDependency,
) -> object:
    try:
        return await service.update(badge_id, request, actor=admin)
    except BadgeNotFoundError:
        raise _not_found() from None
    except BadgePersistenceError:
        raise _persistence_error() from None


@router.delete("/{badge_id}", status_code=204, response_class=Response)
async def delete_badge(
    badge_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: BadgeServiceDependency,
) -> Response:
    try:
        await service.delete(badge_id, actor=admin)
    except BadgeNotFoundError:
        raise _not_found() from None
    except BadgePersistenceError:
        raise _persistence_error() from None
    return Response(status_code=204)


@router.put("/{badge_id}/logo", response_model=BadgeAdminResponse)
async def upload_badge_logo(
    badge_id: UUID,
    file: Annotated[UploadFile, File()],
    admin: AuthenticatedAdminDependency,
    service: BadgeServiceDependency,
) -> object:
    try:
        return await service.upload_logo(badge_id, file, actor=admin)
    except BadgeNotFoundError:
        raise _not_found() from None
    except UploadValidationError as error:
        raise HTTPException(status_code=422, detail=str(error)) from None
    except StorageError:
        raise HTTPException(
            status_code=503,
            detail="Image storage is temporarily unavailable.",
        ) from None
    except BadgePersistenceError:
        raise _persistence_error() from None


@router.delete(
    "/{badge_id}/logo",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_badge_logo(
    badge_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: BadgeServiceDependency,
) -> Response:
    try:
        await service.delete_logo(badge_id, actor=admin)
    except BadgeNotFoundError:
        raise _not_found() from None
    except StorageError:
        raise HTTPException(
            status_code=503,
            detail="Image storage is temporarily unavailable.",
        ) from None
    except BadgePersistenceError:
        raise _persistence_error() from None
    return Response(status_code=204)
