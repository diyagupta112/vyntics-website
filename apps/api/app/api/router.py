"""Top-level API router registration."""

from fastapi import APIRouter

from app.api.routes.blogs import admin_router as admin_blogs_router
from app.api.routes.blogs import router as blogs_router
from app.api.routes.case_studies import admin_router as admin_case_studies_router
from app.api.routes.case_studies import router as case_studies_router
from app.api.routes.careers import router as careers_router
from app.api.routes.contact_submissions import admin_router as admin_contacts_router
from app.api.routes.contact_submissions import public_router as contacts_router
from app.api.routes.health import router as health_router
from app.api.routes.job_applications import (
    admin_career_router as admin_career_applications_router,
)
from app.api.routes.job_applications import admin_router as admin_applications_router
from app.api.routes.job_applications import public_router as applications_router
from app.api.routes.team_members import router as team_members_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(blogs_router)
api_router.include_router(admin_blogs_router)
api_router.include_router(case_studies_router)
api_router.include_router(admin_case_studies_router)
api_router.include_router(careers_router)
api_router.include_router(applications_router)
api_router.include_router(admin_career_applications_router)
api_router.include_router(admin_applications_router)
api_router.include_router(contacts_router)
api_router.include_router(admin_contacts_router)
api_router.include_router(team_members_router)
