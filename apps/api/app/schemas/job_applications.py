"""Job Application request and response schemas."""

from datetime import datetime
from pathlib import Path
from typing import Annotated, Literal, TypeAlias
from uuid import UUID

from fastapi import UploadFile
from pydantic import AnyHttpUrl, EmailStr, Field, StringConstraints, field_validator

from app.schemas.common import RequestSchema, ResponseSchema


ALLOWED_RESUME_EXTENSIONS = frozenset({".doc", ".docx", ".pdf"})
JobApplicationStatus: TypeAlias = Literal[
    "new",
    "reviewing",
    "shortlisted",
    "rejected",
    "hired",
]
NoticePeriod: TypeAlias = Literal[
    "immediate",
    "15_days",
    "30_days",
    "60_days",
    "90_days",
    "other",
]
CurrentCompany: TypeAlias = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=200),
]


class JobApplicationCreateRequest(RequestSchema):
    """Applicant-controlled multipart fields for a career application."""

    name: str
    email: EmailStr
    phone: str
    experience_years: Annotated[int, Field(ge=0)]
    experience_months: Annotated[int, Field(ge=0, le=11)]
    currently_working: bool
    current_company: CurrentCompany | None = None
    notice_period: NoticePeriod
    resume: UploadFile | None = None
    cover_letter: str | None = None

    @field_validator("resume")
    @classmethod
    def validate_resume_extension(cls, resume: UploadFile | None) -> UploadFile | None:
        """Accept only the resume filename extensions approved by the contract."""

        if resume is None:
            return None
        suffix = Path(resume.filename or "").suffix.lower()
        if suffix not in ALLOWED_RESUME_EXTENSIONS:
            allowed = ", ".join(sorted(ALLOWED_RESUME_EXTENSIONS))
            raise ValueError(f"resume must use one of these extensions: {allowed}")
        return resume


class JobApplicationUpdateRequest(RequestSchema):
    """Administrative fields that may be changed on an application."""

    status: JobApplicationStatus | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def reject_null_status(cls, status: object) -> object:
        """Allow omission during PATCH while rejecting explicit null."""

        if status is None:
            raise ValueError("status cannot be null")
        return status


class JobApplicationReceipt(ResponseSchema):
    """Minimal receipt returned to a public applicant."""

    id: UUID
    status: Literal["new"]
    submitted_at: datetime


class JobApplicationAdminListItem(ResponseSchema):
    """Application fields required by the Admin Panel table."""

    id: UUID
    career_id: UUID | None
    career_title_snapshot: str
    career_slug_snapshot: str
    name: str
    email: EmailStr
    phone: str
    experience_years: int | None
    experience_months: int | None
    currently_working: bool | None
    current_company: str | None
    notice_period: NoticePeriod | None
    status: JobApplicationStatus
    submitted_at: datetime
    resume_url: AnyHttpUrl | None


class JobApplicationAdminDetail(JobApplicationAdminListItem):
    """Complete approved administrative application response."""

    cover_letter: str | None
    notes: str | None
