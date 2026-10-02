"""Read-only contracts for existing audit records."""

from datetime import datetime
from uuid import UUID

from app.schemas.common import JsonObject, ResponseSchema


class AuditLogListItem(ResponseSchema):
    """Stored event and captured actor identity for the admin table."""

    id: UUID
    actor_id: UUID | None
    actor_email: str | None
    action: str
    resource_type: str
    resource_id: UUID | None
    created_at: datetime


class AuditLogDetail(AuditLogListItem):
    """Complete stored event, including structured context."""

    context: JsonObject


class AuditLogListResponse(ResponseSchema):
    """One bounded page and the total number of matching events."""

    items: list[AuditLogListItem]
    page: int
    page_size: int
    total: int
