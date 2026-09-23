"""Public contact-submission request schemas."""

from pydantic import EmailStr

from app.schemas.common import RequestSchema


class ContactCreateRequest(RequestSchema):
    """Visitor-controlled fields accepted by the contact form."""

    name: str
    email: EmailStr
    company: str | None = None
    subject: str
    message: str
    source_page: str
