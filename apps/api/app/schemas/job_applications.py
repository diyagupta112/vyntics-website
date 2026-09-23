"""Public job-application request schemas."""

from pathlib import Path

from fastapi import UploadFile
from pydantic import EmailStr, field_validator

from app.schemas.common import RequestSchema


ALLOWED_RESUME_EXTENSIONS = frozenset({".doc", ".docx", ".pdf"})


class JobApplicationCreateRequest(RequestSchema):
    """Applicant-controlled multipart fields for a career application."""

    name: str
    email: EmailStr
    phone: str
    resume: UploadFile
    cover_letter: str | None = None

    @field_validator("resume")
    @classmethod
    def validate_resume_extension(cls, resume: UploadFile) -> UploadFile:
        """Accept only the resume filename extensions approved by the contract."""

        suffix = Path(resume.filename or "").suffix.lower()
        if suffix not in ALLOWED_RESUME_EXTENSIONS:
            allowed = ", ".join(sorted(ALLOWED_RESUME_EXTENSIONS))
            raise ValueError(f"resume must use one of these extensions: {allowed}")
        return resume
