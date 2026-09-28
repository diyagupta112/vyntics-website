"""Public submission and administrative Job Application API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.exceptions import RequestValidationError
from pydantic import EmailStr, ValidationError

from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.job_applications import JobApplicationServiceDependency
from app.schemas.job_applications import (
    JobApplicationAdminDetail,
    JobApplicationAdminListItem,
    JobApplicationCreateRequest,
    JobApplicationReceipt,
    JobApplicationUpdateRequest,
)
from app.services.job_applications import (
    JobApplicationCareerNotFoundError,
    JobApplicationNotFoundError,
    JobApplicationPersistenceError,
)
from app.storage.resumes import ResumeStorageError, ResumeValidationError


public_router = APIRouter(prefix="/careers", tags=["job applications"])
admin_career_router = APIRouter(
    prefix="/admin/careers",
    tags=["admin job applications"],
)
admin_router = APIRouter(
    prefix="/admin/job-applications",
    tags=["admin job applications"],
)


async def parse_job_application_form(
    raw_request: Request,
    name: Annotated[str, Form()],
    email: Annotated[EmailStr, Form()],
    phone: Annotated[str, Form()],
    resume: Annotated[UploadFile | None, File()] = None,
    cover_letter: Annotated[str | None, Form()] = None,
) -> JobApplicationCreateRequest:
    """Build the strict request schema while preserving multipart OpenAPI."""

    form = await raw_request.form()
    allowed_fields = {"name", "email", "phone", "resume", "cover_letter"}
    unexpected_fields = sorted(set(form) - allowed_fields)
    if unexpected_fields:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Unexpected form fields: {', '.join(unexpected_fields)}",
        )
    try:
        return JobApplicationCreateRequest(
            name=name,
            email=email,
            phone=phone,
            resume=resume,
            cover_letter=cover_letter,
        )
    except ValidationError as error:
        raise RequestValidationError(error.errors()) from error


@public_router.post(
    "/{slug}/apply",
    response_model=JobApplicationReceipt,
    status_code=status.HTTP_201_CREATED,
)
async def create_job_application(
    slug: str,
    request: Annotated[JobApplicationCreateRequest, Depends(parse_job_application_form)],
    service: JobApplicationServiceDependency,
) -> object:
    """Accept one public multipart application for an existing Career."""

    try:
        return await service.create(slug, request)
    except JobApplicationCareerNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found.",
        ) from None
    except ResumeValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from None
    except ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage is temporarily unavailable.",
        ) from None
    except JobApplicationPersistenceError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process Job Application.",
        ) from None


@admin_career_router.get(
    "/{career_id}/applications",
    response_model=list[JobApplicationAdminListItem],
)
async def list_job_applications(
    career_id: UUID,
    _admin: AuthenticatedAdminDependency,
    service: JobApplicationServiceDependency,
) -> list[JobApplicationAdminListItem]:
    """List one Career's applications newest-first."""

    try:
        return await service.list_for_career(career_id)
    except JobApplicationCareerNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found.",
        ) from None
    except ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage is temporarily unavailable.",
        ) from None


@admin_router.get("", response_model=list[JobApplicationAdminListItem])
async def list_all_job_applications(
    _admin: AuthenticatedAdminDependency,
    service: JobApplicationServiceDependency,
) -> list[JobApplicationAdminListItem]:
    """List all current and historical Job Applications newest-first."""

    try:
        return await service.list_all()
    except ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage is temporarily unavailable.",
        ) from None


@admin_router.get("/{application_id}", response_model=JobApplicationAdminDetail)
async def get_job_application(
    application_id: UUID,
    _admin: AuthenticatedAdminDependency,
    service: JobApplicationServiceDependency,
) -> JobApplicationAdminDetail:
    """Return one complete administrative application response."""

    try:
        return await service.get_by_id(application_id)
    except JobApplicationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Application not found.",
        ) from None
    except ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage is temporarily unavailable.",
        ) from None


@admin_router.patch(
    "/{application_id}",
    response_model=JobApplicationAdminDetail,
)
async def update_job_application(
    application_id: UUID,
    request: JobApplicationUpdateRequest,
    admin: AuthenticatedAdminDependency,
    service: JobApplicationServiceDependency,
) -> JobApplicationAdminDetail:
    """Update only an application's status and notes."""

    try:
        return await service.update(application_id, request, actor=admin)
    except JobApplicationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Application not found.",
        ) from None
    except ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage is temporarily unavailable.",
        ) from None
    except JobApplicationPersistenceError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update Job Application.",
        ) from None


@admin_router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_job_application(
    application_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: JobApplicationServiceDependency,
) -> Response:
    """Hard-delete an application and its private resume."""

    try:
        await service.delete(application_id, actor=admin)
    except JobApplicationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Application not found.",
        ) from None
    except ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage is temporarily unavailable.",
        ) from None
    except JobApplicationPersistenceError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete Job Application.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
