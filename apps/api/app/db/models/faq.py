"""FAQ persistence using the existing PostgreSQL model conventions."""

from datetime import datetime
from uuid import UUID as UUIDValue

from sqlalchemy import Boolean, CheckConstraint, DateTime, FetchedValue, Index, Integer, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FAQ(Base):
    __tablename__ = "faqs"
    __table_args__ = (
        CheckConstraint(
            "char_length(page) BETWEEN 1 AND 255 AND "
            "page ~ '^[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)*$'",
            name="ck_faqs_page_key",
        ),
        CheckConstraint("question ~ '[^[:space:]]'", name="ck_faqs_question_not_blank"),
        CheckConstraint("answer ~ '[^[:space:]]'", name="ck_faqs_answer_not_blank"),
        Index("ix_faqs_page_active_display_order", 'page', 'is_active', 'display_order', 'created_at', 'id'),
    )

    id: Mapped[UUIDValue] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    page: Mapped[str] = mapped_column(Text, nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"), server_onupdate=FetchedValue())
