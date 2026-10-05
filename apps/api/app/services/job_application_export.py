"""Excel export of complete application datasets with safe audit metadata."""

from dataclasses import dataclass
from datetime import timezone
from io import BytesIO
import re
from uuid import UUID

from openpyxl import Workbook
from openpyxl.styles import Font
from starlette.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.job_application import JobApplication
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.careers import CareerRepository
from app.repositories.job_applications import JobApplicationRepository
from app.services.job_applications import JobApplicationCareerNotFoundError


EXCEL_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
HEADERS = (
    "Name", "Email", "Mobile", "Job", "Experience", "Currently Working",
    "Current Company", "Notice Period", "Status", "Resume", "Notes", "Applied At",
)
NOTICE_LABELS = {
    "immediate": "Immediate", "15_days": "15 Days", "30_days": "30 Days",
    "60_days": "60 Days", "90_days": "90 Days", "other": "Other",
}


class ExcelGenerationError(RuntimeError):
    """Workbook generation failed without returning internal details."""


@dataclass(frozen=True)
class ApplicationExport:
    content: bytes
    filename: str


def _workbook(applications: list[JobApplication]) -> bytes:
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Job Applications"
    sheet.append(HEADERS)
    for cell in sheet[1]:
        cell.font = Font(bold=True)
    for application in applications:
        experience = ""
        if application.experience_years is not None:
            experience = f"{application.experience_years} years"
        if application.experience_months is not None:
            experience = f"{experience} {application.experience_months} months".strip()
        values = (
            application.name, application.email, application.phone,
            application.career_title_snapshot, experience,
            "" if application.currently_working is None else (
                "Yes" if application.currently_working else "No"
            ),
            application.current_company or "",
            NOTICE_LABELS.get(application.notice_period, ""),
            application.status.title(),
            "Available in Admin Panel" if application.resume_url else "Not provided",
            application.notes or "",
            application.submitted_at.astimezone(timezone.utc).strftime(
                "%Y-%m-%d %H:%M:%S UTC"
            ),
        )
        sheet.append(values)
        # All external text is literal, including strings beginning with '='.
        for cell in sheet[sheet.max_row]:
            cell.data_type = "s"
    sheet.freeze_panes = "A2"
    sheet.auto_filter.ref = sheet.dimensions
    for column, width in zip("ABCDEFGHIJKL", (25, 32, 20, 32, 22, 20, 30, 18, 18, 30, 45, 26)):
        sheet.column_dimensions[column].width = width
    output = BytesIO()
    workbook.save(output)
    workbook.close()
    return output.getvalue()


class JobApplicationExportService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._applications = JobApplicationRepository(session)
        self._careers = CareerRepository(session)
        self._audits = AuditLogRepository(session)

    async def export(
        self, career_id: UUID | None, *, actor: AuthenticatedAdmin,
    ) -> ApplicationExport:
        suffix = "All"
        if career_id is None:
            applications = await self._applications.list_all()
        else:
            career = await self._careers.get_by_id(career_id)
            if career is None:
                raise JobApplicationCareerNotFoundError
            suffix = re.sub(r"[^A-Za-z0-9_-]+", "_", career.title).strip("_")[:100] or "Career"
            applications = await self._applications.list_for_career(career_id)
        try:
            content = await run_in_threadpool(_workbook, applications)
        except Exception as error:
            raise ExcelGenerationError from error
        try:
            await self._audits.add(AuditLog(
                actor_id=actor.admin_id, actor_email=actor.admin_email,
                action="export", resource_type="job_application", resource_id=None,
                context={
                    "scope": "all" if career_id is None else "career",
                    "career_id": str(career_id) if career_id is not None else None,
                    "application_count": len(applications),
                },
            ))
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        return ApplicationExport(content, f"Vyntics_Job_Applications_{suffix}.xlsx")
