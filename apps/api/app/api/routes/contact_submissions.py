"""Public and administrative Contact Submission API routes."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status

from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.contact_submissions import (
    ContactSubmissionServiceDependency,
)
from app.schemas.contact import (
    ContactCreateRequest,
    ContactSubmissionAdminResponse,
    ContactSubmissionReceipt,
)
from app.services.contact_submissions import ContactSubmissionNotFoundError

public_router = APIRouter(prefix="/contact-us", tags=["contact us"])
admin_router = APIRouter(
    prefix="/admin/contact-submissions",
    tags=["admin contact submissions"],
)


@public_router.post(
    "",
    response_model=ContactSubmissionReceipt,
    status_code=status.HTTP_201_CREATED,
)
async def create_contact_submission(
    request: ContactCreateRequest,
    service: ContactSubmissionServiceDependency,
) -> object:
    """Accept a public Contact Us submission without authentication."""

    return await service.create(request)


@admin_router.get("", response_model=list[ContactSubmissionAdminResponse])
async def list_contact_submissions(
    _admin: AuthenticatedAdminDependency,
    service: ContactSubmissionServiceDependency,
) -> list[object]:
    """List every submission newest-first for an administrator."""

    return await service.list_all()


@admin_router.get(
    "/{submission_id}",
    response_model=ContactSubmissionAdminResponse,
)
async def get_contact_submission(
    submission_id: UUID,
    _admin: AuthenticatedAdminDependency,
    service: ContactSubmissionServiceDependency,
) -> object:
    """Return one submission by UUID for an administrator."""

    try:
        return await service.get_by_id(submission_id)
    except ContactSubmissionNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact Submission not found.",
        ) from None


@admin_router.delete(
    "/{submission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_contact_submission(
    submission_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: ContactSubmissionServiceDependency,
) -> Response:
    """Hard-delete a submission as an authenticated administrator."""

    try:
        await service.delete(submission_id, actor=admin)
    except ContactSubmissionNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact Submission not found.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
