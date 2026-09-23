"""Administrative audit-log persistence model."""

from datetime import datetime
from uuid import UUID as UUIDValue

from sqlalchemy import DateTime, ForeignKey, Index, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.models.admin_user import AdminUser


class AuditLog(Base):
    """An administrator or system-generated audit event."""

    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_actor_created_at", "actor_id", "created_at"),
        Index(
            "ix_audit_logs_resource_created_at",
            "resource_type",
            "resource_id",
            "created_at",
        ),
    )

    id: Mapped[UUIDValue] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    actor_id: Mapped[UUIDValue | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("admin_users.id"),
    )
    actor_email: Mapped[str | None] = mapped_column(Text)
    action: Mapped[str] = mapped_column(Text, nullable=False)
    resource_type: Mapped[str] = mapped_column(Text, nullable=False)
    resource_id: Mapped[UUIDValue | None] = mapped_column(UUID(as_uuid=True))
    context: Mapped[dict[str, object]] = mapped_column(
        JSONB,
        nullable=False,
        server_default=text("'{}'::jsonb"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    actor: Mapped[AdminUser | None] = relationship(foreign_keys=[actor_id])

