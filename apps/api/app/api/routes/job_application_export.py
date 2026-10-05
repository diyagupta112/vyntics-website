"""Authenticated Excel application download."""

from uuid import UUID
from fastapi import APIRouter, HTTPException, Response
from sqlalchemy.exc import SQLAlchemyError
from app.api.dependencies.auth import AuthenticatedAdminDependency
from app.api.dependencies.job_application_export import JobApplicationExportDependency
from app.services.job_application_export import EXCEL_MEDIA_TYPE, ExcelGenerationError
from app.services.job_applications import JobApplicationCareerNotFoundError


router = APIRouter(prefix="/admin/job-applications", tags=["admin job applications"])


@router.get(
    "/export", response_class=Response,
    responses={200: {"content": {EXCEL_MEDIA_TYPE: {"schema": {"type": "string", "format": "binary"}}}}},
)
async def export_job_applications(
    admin: AuthenticatedAdminDependency,
    service: JobApplicationExportDependency,
    career_id: UUID | None = None,
) -> Response:
    """Download all applications or applications for one existing Career."""
    try:
        exported = await service.export(career_id, actor=admin)
    except JobApplicationCareerNotFoundError:
        raise HTTPException(status_code=404, detail="Career not found.") from None
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Job applications are temporarily unavailable.") from None
    except ExcelGenerationError:
        raise HTTPException(status_code=500, detail="Unable to generate Excel export.") from None
    return Response(
        content=exported.content, media_type=EXCEL_MEDIA_TYPE,
        headers={
            "Content-Disposition": f'attachment; filename="{exported.filename}"',
            "Cache-Control": "no-store",
        },
    )
