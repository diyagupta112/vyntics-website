"""Public lists and authenticated administrator CRUD for testimonials."""

from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, File, HTTPException, Response, UploadFile
from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.testimonials import TestimonialServiceDependency
from app.schemas.testimonials import TestimonialAdminResponse, TestimonialCreateRequest, TestimonialListResponse, TestimonialUpdateRequest
from app.services.testimonials import TestimonialNotFoundError, TestimonialPersistenceError

from app.storage.supabase import StorageError
from app.storage.uploads import UploadValidationError

router = APIRouter(prefix="/testimonials", tags=["testimonials"])
admin_router = APIRouter(prefix="/admin/testimonials", tags=["admin testimonials"])


def _not_found() -> HTTPException:
    return HTTPException(status_code=404, detail="Testimonial not found.")


def _service_error() -> HTTPException:
    return HTTPException(status_code=500, detail="Unable to process Testimonial request.")


@router.get("", response_model=TestimonialListResponse)
async def list_public_testimonials(
    service: TestimonialServiceDependency,
) -> TestimonialListResponse:
    try:
        return TestimonialListResponse(data=await service.list_public())
    except TestimonialPersistenceError:
        raise _service_error() from None


@admin_router.get("", response_model=list[TestimonialAdminResponse])
async def list_admin_testimonials(
    _admin: AuthenticatedAdminDependency,
    service: TestimonialServiceDependency,
) -> list[object]:
    try:
        return await service.list_all()
    except TestimonialPersistenceError:
        raise _service_error() from None


@admin_router.get("/{resource_id}", response_model=TestimonialAdminResponse)
async def get_admin_testimonial(resource_id: UUID, _admin: AuthenticatedAdminDependency, service: TestimonialServiceDependency) -> object:
    try:
        return await service.get_by_id(resource_id)
    except TestimonialNotFoundError:
        raise _not_found() from None
    except TestimonialPersistenceError:
        raise _service_error() from None


@router.post("", response_model=TestimonialAdminResponse, status_code=201)
async def create_testimonial(request: TestimonialCreateRequest, admin: AuthenticatedAdminDependency, service: TestimonialServiceDependency) -> object:
    try:
        return await service.create(request, actor=admin)
    except TestimonialPersistenceError:
        raise _service_error() from None


@router.patch("/{resource_id}", response_model=TestimonialAdminResponse)
async def update_testimonial(resource_id: UUID, request: TestimonialUpdateRequest, admin: AuthenticatedAdminDependency, service: TestimonialServiceDependency) -> object:
    try:
        return await service.update(resource_id, request, actor=admin)
    except TestimonialNotFoundError:
        raise _not_found() from None
    except TestimonialPersistenceError:
        raise _service_error() from None


@router.delete("/{resource_id}", status_code=204, response_class=Response)
async def delete_testimonial(resource_id: UUID, admin: AuthenticatedAdminDependency, service: TestimonialServiceDependency) -> Response:
    try:
        await service.delete(resource_id, actor=admin)
    except TestimonialNotFoundError:
        raise _not_found() from None
    except TestimonialPersistenceError:
        raise _service_error() from None
    return Response(status_code=204)


@router.put("/{testimonial_id}/company-logo", response_model=TestimonialAdminResponse)
async def upload_testimonial_company_logo(
    testimonial_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: TestimonialServiceDependency,
    file: Annotated[UploadFile, File(description="JPEG, PNG, or WebP image; maximum 5 MiB.")],
) -> object:
    """Upload or replace a company logo in the existing testimonial-logos bucket."""
    try:
        return await service.upload_logo(testimonial_id, file, actor=admin)
    except TestimonialNotFoundError:
        raise _not_found() from None
    except UploadValidationError as error:
        raise HTTPException(status_code=422, detail=str(error)) from None
    except StorageError:
        raise HTTPException(status_code=503, detail="Image storage is temporarily unavailable.") from None
    except TestimonialPersistenceError:
        raise _service_error() from None


@router.delete("/{testimonial_id}/company-logo", status_code=204, response_class=Response)
async def delete_testimonial_company_logo(
    testimonial_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: TestimonialServiceDependency,
) -> Response:
    """Clear the logo reference and clean up only this testimonial's managed object."""
    try:
        await service.delete_logo(testimonial_id, actor=admin)
    except TestimonialNotFoundError:
        raise _not_found() from None
    except StorageError:
        raise HTTPException(status_code=503, detail="Image storage is temporarily unavailable.") from None
    except TestimonialPersistenceError:
        raise _service_error() from None
    return Response(status_code=204)
