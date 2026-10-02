"""Job-application persistence model."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID as UUIDValue

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.career import Career


class JobApplication(Base):
    """A preserved application submitted for a career opportunity."""

    __tablename__ = "job_applications"
    __table_args__ = (
        Index("ix_job_applications_career_id", "career_id"),
        Index("ix_job_applications_status_submitted_at", "status", "submitted_at"),
        CheckConstraint(
            "experience_years IS NULL OR experience_years >= 0",
            name="ck_job_applications_experience_years",
        ),
        CheckConstraint(
            "experience_months IS NULL OR experience_months BETWEEN 0 AND 11",
            name="ck_job_applications_experience_months",
        ),
        CheckConstraint(
            "current_company IS NULL OR "
            "(char_length(btrim(current_company)) BETWEEN 1 AND 200)",
            name="ck_job_applications_current_company",
        ),
        CheckConstraint(
            "notice_period IS NULL OR notice_period IN "
            "('immediate', '15_days', '30_days', '60_days', '90_days', 'other')",
            name="ck_job_applications_notice_period",
        ),
    )

    id: Mapped[UUIDValue] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    career_id: Mapped[UUIDValue | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("careers.id", ondelete="SET NULL"),
    )
    career_title_snapshot: Mapped[str] = mapped_column(Text, nullable=False)
    career_slug_snapshot: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(Text, nullable=False)
    experience_years: Mapped[int | None] = mapped_column(Integer)
    experience_months: Mapped[int | None] = mapped_column(SmallInteger)
    currently_working: Mapped[bool | None] = mapped_column(Boolean)
    current_company: Mapped[str | None] = mapped_column(Text)
    notice_period: Mapped[str | None] = mapped_column(Text)
    resume_url: Mapped[str | None] = mapped_column(Text)
    cover_letter: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        server_default=text("'new'"),
    )
    notes: Mapped[str | None] = mapped_column(Text)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    career: Mapped[Career | None] = relationship(back_populates="applications")
