"""Public gallery reads and authenticated administrator management for Life at Vyntics."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, HTTPException, Response, UploadFile

from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.life_at_vyntics import LifeAtVynticsServiceDependency
from app.schemas.life_at_vyntics import (
    LifeAtVynticsCreateRequest,
    LifeAtVynticsListResponse,
    LifeAtVynticsResponse,
    LifeAtVynticsUpdateRequest,
)
from app.services.life_at_vyntics import LifeAtVynticsNotFoundError, LifeAtVynticsPersistenceError
from app.storage.supabase import StorageError
from app.storage.uploads import UploadValidationError

router = APIRouter(prefix="/life-at-vyntics", tags=["life at vyntics"])
admin_router = APIRouter(prefix="/admin/life-at-vyntics", tags=["admin life at vyntics"])


def _not_found() -> HTTPException:
    return HTTPException(status_code=404, detail="Life at Vyntics image not found.")


def _service_error() -> HTTPException:
    return HTTPException(status_code=500, detail="Unable to process Life at Vyntics request.")


def _storage_unavailable() -> HTTPException:
    return HTTPException(status_code=503, detail="Image storage is temporarily unavailable.")


@router.get("", response_model=LifeAtVynticsListResponse)
async def list_public_life_at_vyntics(service: LifeAtVynticsServiceDependency) -> LifeAtVynticsListResponse:
    try:
        return LifeAtVynticsListResponse(data=await service.list_all())
    except LifeAtVynticsPersistenceError:
        raise _service_error() from None


@router.get("/{resource_id}", response_model=LifeAtVynticsResponse)
async def get_public_life_at_vyntics(resource_id: UUID, service: LifeAtVynticsServiceDependency) -> object:
    try:
        return await service.get_by_id(resource_id)
    except LifeAtVynticsNotFoundError:
        raise _not_found() from None
    except LifeAtVynticsPersistenceError:
        raise _service_error() from None


@admin_router.get("", response_model=list[LifeAtVynticsResponse])
async def list_admin_life_at_vyntics(_admin: AuthenticatedAdminDependency, service: LifeAtVynticsServiceDependency) -> list[object]:
    try:
        return await service.list_all()
    except LifeAtVynticsPersistenceError:
        raise _service_error() from None


@admin_router.get("/{resource_id}", response_model=LifeAtVynticsResponse)
async def get_admin_life_at_vyntics(resource_id: UUID, _admin: AuthenticatedAdminDependency, service: LifeAtVynticsServiceDependency) -> object:
    try:
        return await service.get_by_id(resource_id)
    except LifeAtVynticsNotFoundError:
        raise _not_found() from None
    except LifeAtVynticsPersistenceError:
        raise _service_error() from None


@router.post("", response_model=LifeAtVynticsResponse, status_code=201)
async def create_life_at_vyntics(request: LifeAtVynticsCreateRequest, admin: AuthenticatedAdminDependency, service: LifeAtVynticsServiceDependency) -> object:
    try:
        return await service.create(request, actor=admin)
    except LifeAtVynticsPersistenceError:
        raise _service_error() from None


@router.patch("/{resource_id}", response_model=LifeAtVynticsResponse)
async def update_life_at_vyntics(resource_id: UUID, request: LifeAtVynticsUpdateRequest, admin: AuthenticatedAdminDependency, service: LifeAtVynticsServiceDependency) -> object:
    try:
        return await service.update(resource_id, request, actor=admin)
    except LifeAtVynticsNotFoundError:
        raise _not_found() from None
    except LifeAtVynticsPersistenceError:
        raise _service_error() from None


@router.delete("/{resource_id}", status_code=204, response_class=Response)
async def delete_life_at_vyntics(resource_id: UUID, admin: AuthenticatedAdminDependency, service: LifeAtVynticsServiceDependency) -> Response:
    try:
        await service.delete(resource_id, actor=admin)
    except LifeAtVynticsNotFoundError:
        raise _not_found() from None
    except LifeAtVynticsPersistenceError:
        raise _service_error() from None
    return Response(status_code=204)


@router.put("/{resource_id}/image", response_model=LifeAtVynticsResponse)
async def upload_life_at_vyntics_image(
    resource_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: LifeAtVynticsServiceDependency,
    file: Annotated[UploadFile, File(description="JPEG, PNG, or WebP image; maximum 5 MiB.")],
) -> object:
    """Upload or replace the photo in the existing life-at-vyntics bucket."""
    try:
        return await service.upload_image(resource_id, file, actor=admin)
    except LifeAtVynticsNotFoundError:
        raise _not_found() from None
    except UploadValidationError as error:
        raise HTTPException(status_code=422, detail=str(error)) from None
    except StorageError:
        raise _storage_unavailable() from None
    except LifeAtVynticsPersistenceError:
        raise _service_error() from None


@router.delete("/{resource_id}/image", status_code=204, response_class=Response)
async def delete_life_at_vyntics_image(resource_id: UUID, admin: AuthenticatedAdminDependency, service: LifeAtVynticsServiceDependency) -> Response:
    """Clear the image reference and clean up only this item's managed object."""
    try:
        await service.delete_image(resource_id, actor=admin)
    except LifeAtVynticsNotFoundError:
        raise _not_found() from None
    except StorageError:
        raise _storage_unavailable() from None
    except LifeAtVynticsPersistenceError:
        raise _service_error() from None
    return Response(status_code=204)
