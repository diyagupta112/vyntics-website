"""Life at Vyntics gallery persistence using the existing PostgreSQL conventions."""

from datetime import datetime
from uuid import UUID as UUIDValue

from sqlalchemy import Boolean, CheckConstraint, DateTime, FetchedValue, Index, Integer, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LifeAtVyntics(Base):
    __tablename__ = "life_at_vyntics"
    __table_args__ = (
        CheckConstraint("title ~ '[^[:space:]]'", name="ck_life_at_vyntics_title_not_blank"),
        Index("ix_life_at_vyntics_active_display_order", "is_active", "display_order", "created_at", "id"),
    )

    id: Mapped[UUIDValue] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"), server_onupdate=FetchedValue())
