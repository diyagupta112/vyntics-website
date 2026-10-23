"""Life at Vyntics image gallery persistence."""

from datetime import datetime
from uuid import UUID as UUIDValue

from sqlalchemy import CheckConstraint, DateTime, FetchedValue, Integer, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LifeAtVyntics(Base):
    __tablename__ = "life_at_vyntics"
    __table_args__ = (
        CheckConstraint("display_order >= 1", name="ck_life_at_vyntics_display_order_positive"),
        UniqueConstraint("display_order", name="uq_life_at_vyntics_display_order", deferrable=True, initially="DEFERRED"),
    )

    id: Mapped[UUIDValue] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"), server_onupdate=FetchedValue())
