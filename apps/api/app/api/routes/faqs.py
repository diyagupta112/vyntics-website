"""Public lists and authenticated administrator CRUD for faqs."""

from uuid import UUID
from fastapi import APIRouter, HTTPException, Response
from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.faqs import FAQServiceDependency
from app.schemas.faqs import FAQAdminResponse, FAQCreateRequest, FAQListResponse, FAQUpdateRequest
from app.schemas.faqs import PageKey, SubPageKey
from app.services.faqs import FAQNotFoundError, FAQPersistenceError

router = APIRouter(prefix="/faqs", tags=["faqs"])
admin_router = APIRouter(prefix="/admin/faqs", tags=["admin faqs"])


def _not_found() -> HTTPException:
    return HTTPException(status_code=404, detail="FAQ not found.")


def _service_error() -> HTTPException:
    return HTTPException(status_code=500, detail="Unable to process FAQ request.")


@router.get("", response_model=FAQListResponse)
async def list_public_faqs(
    service: FAQServiceDependency,
    page: PageKey | None = None,
    sub_page: SubPageKey | None = None,
) -> FAQListResponse:
    if sub_page is not None and page is None:
        raise HTTPException(status_code=422, detail="sub_page requires page.")
    try:
        filters = {} if sub_page is None else {"sub_page": sub_page}
        return FAQListResponse(data=await service.list_public(page=page, **filters))
    except FAQPersistenceError:
        raise _service_error() from None


@admin_router.get("", response_model=list[FAQAdminResponse])
async def list_admin_faqs(
    _admin: AuthenticatedAdminDependency,
    service: FAQServiceDependency,
    page: PageKey | None = None,
) -> list[object]:
    try:
        return await service.list_all(page=page)
    except FAQPersistenceError:
        raise _service_error() from None


@admin_router.get("/{resource_id}", response_model=FAQAdminResponse)
async def get_admin_faq(resource_id: UUID, _admin: AuthenticatedAdminDependency, service: FAQServiceDependency) -> object:
    try:
        return await service.get_by_id(resource_id)
    except FAQNotFoundError:
        raise _not_found() from None
    except FAQPersistenceError:
        raise _service_error() from None


@router.post("", response_model=FAQAdminResponse, status_code=201)
async def create_faq(request: FAQCreateRequest, admin: AuthenticatedAdminDependency, service: FAQServiceDependency) -> object:
    try:
        return await service.create(request, actor=admin)
    except FAQPersistenceError:
        raise _service_error() from None


@router.patch("/{resource_id}", response_model=FAQAdminResponse)
async def update_faq(resource_id: UUID, request: FAQUpdateRequest, admin: AuthenticatedAdminDependency, service: FAQServiceDependency) -> object:
    try:
        return await service.update(resource_id, request, actor=admin)
    except FAQNotFoundError:
        raise _not_found() from None
    except FAQPersistenceError:
        raise _service_error() from None


@router.delete("/{resource_id}", status_code=204, response_class=Response)
async def delete_faq(resource_id: UUID, admin: AuthenticatedAdminDependency, service: FAQServiceDependency) -> Response:
    try:
        await service.delete(resource_id, actor=admin)
    except FAQNotFoundError:
        raise _not_found() from None
    except FAQPersistenceError:
        raise _service_error() from None
    return Response(status_code=204)
