"""Career opportunity persistence model."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID as UUIDValue

from sqlalchemy import DateTime, FetchedValue, ForeignKey, Index, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.models.admin_user import AdminUser

if TYPE_CHECKING:
    from app.db.models.job_application import JobApplication


class Career(Base):
    """A Vyntics career opportunity."""

    __tablename__ = "careers"
    __table_args__ = (Index("ix_careers_published_at", "published_at"),)

    id: Mapped[UUIDValue] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    slug: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(Text, nullable=False)
    employment_type: Mapped[str] = mapped_column(Text, nullable=False)
    department: Mapped[str] = mapped_column(Text, nullable=False)
    experience: Mapped[str] = mapped_column(Text, nullable=False)
    short_description: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[dict[str, object]] = mapped_column(JSONB, nullable=False)
    responsibilities: Mapped[dict[str, object]] = mapped_column(
        JSONB,
        nullable=False,
    )
    requirements: Mapped[dict[str, object]] = mapped_column(JSONB, nullable=False)
    nice_to_have: Mapped[dict[str, object]] = mapped_column(
        JSONB,
        nullable=False,
        server_default=text("'{}'::jsonb"),
    )
    benefits: Mapped[dict[str, object]] = mapped_column(
        JSONB,
        nullable=False,
        server_default=text("'{}'::jsonb"),
    )
    published_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    created_by: Mapped[UUIDValue | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("admin_users.id"),
    )
    updated_by: Mapped[UUIDValue | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("admin_users.id"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
        server_onupdate=FetchedValue(),
    )

    creator: Mapped[AdminUser | None] = relationship(foreign_keys=[created_by])
    updater: Mapped[AdminUser | None] = relationship(foreign_keys=[updated_by])
    applications: Mapped[list[JobApplication]] = relationship(
        back_populates="career",
        passive_deletes="all",
    )
