"""Public and administrative Blog API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, HTTPException, Request, Response, UploadFile, status
from app.core.config import Environment

from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.blogs import BlogServiceDependency
from app.schemas.blogs import (
    BlogAdminResponse,
    BlogCreateRequest,
    BlogDetailResponse,
    BlogListResponse,
    BlogUpdateRequest,
)
from app.services.blogs import (
    BlogNotFoundError,
    BlogSlugConflictError,
    BlogValidationError,
)
from app.storage.supabase import StorageError
from app.storage.uploads import UploadValidationError

router = APIRouter(prefix="/blogs", tags=["blogs"])
admin_router = APIRouter(prefix="/admin/blogs", tags=["admin blogs"])


@router.get("/preview/all")
async def preview_blogs(request: Request, service: BlogServiceDependency) -> dict:
    """Loopback-only development preview without changing publication status."""
    if (
        request.app.state.settings.environment != Environment.DEVELOPMENT
        or request.client is None
        or request.client.host not in {"127.0.0.1", "::1"}
    ):
        raise HTTPException(status_code=404, detail="Not found")
    blogs = await service.list_all()
    return {"data": [
        {**BlogAdminResponse.model_validate(blog).model_dump(mode="json"),
         "cover_image_url": str(blog.cover_image_url or ""),
         "published_at": (blog.published_at or blog.created_at).isoformat()}
        for blog in blogs
    ]}


@router.get("", response_model=BlogListResponse)
async def list_blogs(service: BlogServiceDependency) -> BlogListResponse:
    """List published Blogs ordered by publication time descending."""

    blogs = await service.list_published()
    return BlogListResponse(data=blogs)


@router.get("/{slug}", response_model=BlogDetailResponse)
async def get_blog(slug: str, service: BlogServiceDependency) -> object:
    """Return one published Blog by slug."""

    try:
        return await service.get_published_by_slug(slug)
    except BlogNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found.",
        ) from None


@admin_router.get("", response_model=list[BlogAdminResponse])
async def list_admin_blogs(
    _admin: AuthenticatedAdminDependency,
    service: BlogServiceDependency,
) -> list[object]:
    """List Blogs in every status for authenticated administration."""

    return await service.list_all()


@admin_router.get("/{blog_id}", response_model=BlogAdminResponse)
async def get_admin_blog(
    blog_id: UUID,
    _admin: AuthenticatedAdminDependency,
    service: BlogServiceDependency,
) -> object:
    """Return one Blog by UUID regardless of publication status."""

    try:
        return await service.get_by_id(blog_id)
    except BlogNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found.",
        ) from None


@router.post(
    "",
    response_model=BlogAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_blog(
    request: BlogCreateRequest,
    admin: AuthenticatedAdminDependency,
    service: BlogServiceDependency,
) -> object:
    """Create a Blog as an authenticated administrator."""

    try:
        return await service.create(request, actor=admin)
    except BlogSlugConflictError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A Blog with this slug already exists.",
        ) from None
    except BlogValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from None


@router.patch("/{blog_id}", response_model=BlogAdminResponse)
async def update_blog(
    blog_id: UUID,
    request: BlogUpdateRequest,
    admin: AuthenticatedAdminDependency,
    service: BlogServiceDependency,
) -> object:
    """Update a Blog as an authenticated administrator."""

    try:
        return await service.update(blog_id, request, actor=admin)
    except BlogNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found.",
        ) from None
    except BlogSlugConflictError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A Blog with this slug already exists.",
        ) from None
    except BlogValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from None


@router.put("/{blog_id}/cover-image", response_model=BlogAdminResponse)
async def upload_blog_cover(
    blog_id: UUID,
    file: Annotated[UploadFile, File()],
    admin: AuthenticatedAdminDependency,
    service: BlogServiceDependency,
) -> object:
    """Upload or replace a Blog's backend-managed cover image."""

    try:
        return await service.upload_cover(blog_id, file, actor=admin)
    except BlogNotFoundError:
        raise HTTPException(status_code=404, detail="Blog not found.") from None
    except UploadValidationError as error:
        raise HTTPException(status_code=422, detail=str(error)) from None
    except StorageError:
        raise HTTPException(
            status_code=503,
            detail="Image storage is temporarily unavailable.",
        ) from None


@router.delete(
    "/{blog_id}/cover-image",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_blog_cover(
    blog_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: BlogServiceDependency,
) -> Response:
    """Remove a draft or unpublished Blog's managed cover image."""

    try:
        await service.delete_cover(blog_id, actor=admin)
    except BlogNotFoundError:
        raise HTTPException(status_code=404, detail="Blog not found.") from None
    except BlogValidationError as error:
        raise HTTPException(status_code=422, detail=str(error)) from None
    except StorageError:
        raise HTTPException(
            status_code=503,
            detail="Image storage is temporarily unavailable.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{blog_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_blog(
    blog_id: UUID,
    admin: AuthenticatedAdminDependency,
    service: BlogServiceDependency,
) -> Response:
    """Hard-delete a Blog as an authenticated administrator."""

    try:
        await service.delete(blog_id, actor=admin)
    except BlogNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found.",
        ) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
