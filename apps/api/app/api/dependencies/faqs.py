"""Existing session dependency wiring for faqs."""

from typing import Annotated
from fastapi import Depends
from app.api.dependencies.database import DatabaseSession
from app.services.faqs import FAQService


def get_faq_service(session: DatabaseSession) -> FAQService:
    return FAQService(session)


FAQServiceDependency = Annotated[FAQService, Depends(get_faq_service)]
