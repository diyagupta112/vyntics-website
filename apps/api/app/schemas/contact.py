"""Contact Submission request and response schemas."""

from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import EmailStr, StringConstraints

from app.schemas.common import RequestSchema, ResponseSchema


NonEmptyString = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]
ShortText = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=200),
]
LongText = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=10_000),
]
PageReference = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=500),
]


class ContactCreateRequest(RequestSchema):
    """Visitor-controlled fields accepted by the contact form."""

    name: ShortText
    email: EmailStr
    company: Annotated[str, StringConstraints(max_length=200)] | None = None
    subject: ShortText
    message: LongText
    source_page: PageReference


class ContactSubmissionReceipt(ResponseSchema):
    """Minimal public receipt for a persisted Contact Submission."""

    id: UUID
    status: Literal["new"]
    submitted_at: datetime


class ContactSubmissionAdminResponse(ResponseSchema):
    """Complete Contact Submission response for administrative reads."""

    id: UUID
    name: str
    email: EmailStr
    company: str | None
    subject: str
    message: str
    source_page: str
    status: str
    notes: str | None
    submitted_at: datetime
    resolved_at: datetime | None
    resolved_by: UUID | None
