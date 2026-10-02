"""Response contract for the current authenticated administrator."""

from datetime import datetime
from uuid import UUID

from pydantic import EmailStr

from app.auth.models import AdminRole
from app.schemas.common import ResponseSchema


class CurrentAdminResponse(ResponseSchema):
    """Public fields for the active administrator resolved from the token."""

    id: UUID
    auth_user_id: UUID
    email: EmailStr
    role: AdminRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
