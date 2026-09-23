"""Team-member persistence model."""

from datetime import datetime
from uuid import UUID as UUIDValue

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    FetchedValue,
    ForeignKey,
    Index,
    Integer,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.models.admin_user import AdminUser


class TeamMember(Base):
    """A leadership or team profile managed by Vyntics administrators."""

    __tablename__ = "team_members"
    __table_args__ = (
        CheckConstraint(
            "member_type IN ('leadership', 'team')",
            name="ck_team_members_member_type",
        ),
        Index("ix_team_members_visible_order", "is_visible", "display_order"),
    )

    id: Mapped[UUIDValue] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(Text, nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(Text)
    linkedin_url: Mapped[str | None] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)
    member_type: Mapped[str] = mapped_column(Text, nullable=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False)
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

