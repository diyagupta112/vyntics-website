"""Public and administrative Case Study API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, HTTPException, Response, UploadFile, status

from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.case_studies import CaseStudyServiceDependency
from app.schemas.case_studies import (
    CaseStudyAdminResponse,
    CaseStudyCreateRequest,
    CaseStudyDetailResponse,
    CaseStudyListResponse,
    CaseStudyUpdateRequest,
)
from app.services.case_studies import (
    CaseStudyNotFoundError,
    CaseStudySlugConflictError,
    CaseStudyValidationError,
)
from app.storage.supabase import StorageError
from app.storage.uploads import UploadValidationError

router = APIRouter(prefix="/case-studies", tags=["case studies"])
admin_router = APIRouter(
    prefix="/admin/case-studies",
    tags=["admin case studies"],
)


@router.get("", response_model=CaseStudyListResponse)
async def list_case_studies(
    service: CaseStudyServiceDependency,
) -> CaseStudyListResponse:
    """List published Case Studies ordered by publication time descending."""

    case_studies = await service.list_published()
    return CaseStudyListResponse(data=case_studies)


@router.get("/{slug}", response_model=CaseStudyDetailResponse)
async def get_case_study(
    slug: str,
    service: CaseStudyServiceDependency,
) -> object:
    """Return one published Case Study by slug."""

    try:
        return await service.get_published_by_slug(slug)
    except CaseStudyNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case Study not found.",
        ) from None


@admin_router.get("", response_model=list[CaseStudyAdminResponse])
async def list_admin_case_studies(
    _admin: AuthenticatedAdminDependency,
    service: CaseStudyServiceDependency,
) -> list[object]:
    """List Case Studies in every status for future administration."""

    return await service.list_all()


@admin_router.get("/{case_study_id}", response_model=CaseStudyAdminResponse)
async def get_admin_case_study(
    case_study_id: UUID,
    _admin: AuthenticatedAdminDependency,
    service: CaseStudyServiceDependency,
) -> object:
    """Return one Case Study by UUID regardless of publication status."""

    try:
        return await service.get_by_id(case_study_id)
    except CaseStudyNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case Study not found.",
        ) from None


@router.post(
    "",
    response_model=CaseStudyAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_case_study(
    request: CaseStudyCreateRequest,
    admin: AuthenticatedAdminDependency,
    service: CaseStudyServiceDependency,
) -> object:
    """Create a Case Study as an authenticated administrator."""

    try:
        return await service.create(request, actor=admin)
    except CaseStudySlugConflictError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A Case Study with this slug already exists.",
        ) from None
    except CaseStudyValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from None


@router.patch("/{case_study_id}", response_model=CaseStudyAdminResponse)
async def update_case_study(
    case_study_id: UUID,
    request: CaseStudyUpdateRequest,
    admin: AuthenticatedAdminDependency,
    service: CaseStudyServiceDependency,
) -> object:
    """Update a Case Study as an authenticated administrator."""

    try:
        return await service.update(case_study_id, request, actor=admin)
    except CaseStudyNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case Study not found.",
        ) from None
    except CaseStudySlugConflictError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A Case Study with this slug already exists.",
        ) from None
    except CaseStudyValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from None


@router.put("/{case_study_id}/cover-image", response_model=CaseStudyAdminResponse)
async def upload_case_study_cover(
    case_study_id: UUID,
    file: Annotated[UploadFile, File()],
    admin: AuthenticatedAdminDependency,
    service: CaseStudyServiceDependency,
) -> object:
    """Upload or replace a Case Study's backend-managed cover."""

    try:
        return await service.upload_cover(case_study_id, file, actor=admin)
    except CaseStudyNotFoundError:
        raise HTTPException(status_code=404, detail="Case Study not found.") from None
    except UploadValidationError as error:
        raise HTTPException(status_code=422, detail=str(error)) from None
    except StorageError:
        raise HTTPException(
            status_code=503,
            detail="Image storage is temporarily unavailable.",
        ) from None


@router.delete(
    "/{case_study_id}/cover-image",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_case_study_cover(
    case_study_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: CaseStudyServiceDependency,
) -> Response:
    """Remove a draft or unpublished Case Study cover."""

    try:
        await service.delete_cover(case_study_id, actor=admin)
    except CaseStudyNotFoundError:
        raise HTTPException(status_code=404, detail="Case Study not found.") from None
    except CaseStudyValidationError as error:
        raise HTTPException(status_code=422, detail=str(error)) from None
    except StorageError:
        raise HTTPException(
            status_code=503,
            detail="Image storage is temporarily unavailable.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{case_study_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_case_study(
    case_study_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: CaseStudyServiceDependency,
) -> Response:
    """Hard-delete a Case Study as an authenticated administrator."""

    try:
        await service.delete(case_study_id, actor=admin)
    except CaseStudyNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case Study not found.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
