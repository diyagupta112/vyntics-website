"""Authenticated audit-actor propagation tests."""

import asyncio
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.blog import Blog
from app.db.models.career import Career
from app.db.models.case_study import CaseStudy
from app.db.models.contact_submission import ContactSubmission
from app.db.models.job_application import JobApplication
from app.db.models.team_member import TeamMember
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.contact_submissions import ContactSubmissionRepository
from app.services.blogs import BlogService
from app.services.careers import CareerService
from app.services.case_studies import CaseStudyService
from app.services.contact_submissions import ContactSubmissionService
from app.services.job_applications import JobApplicationService
from app.services.team_members import TeamMemberService
from tests.auth_helpers import TEST_ADMIN


RESOURCE_ID = UUID("5326b73c-022f-4cc7-8291-8904d3ef01fc")


@pytest.mark.parametrize(
    "audit_log",
    [
        BlogService._build_audit_log(
            action="update",
            blog=Blog(id=RESOURCE_ID),
            context={},
            actor=TEST_ADMIN,
        ),
        CaseStudyService._build_audit_log(
            action="update",
            case_study=CaseStudy(id=RESOURCE_ID),
            context={},
            actor=TEST_ADMIN,
        ),
        CareerService._build_audit_log(
            action="update",
            career=Career(id=RESOURCE_ID),
            context={},
            actor=TEST_ADMIN,
        ),
        TeamMemberService._build_audit_log(
            action="update",
            team_member=TeamMember(id=RESOURCE_ID),
            context={},
            actor=TEST_ADMIN,
        ),
        JobApplicationService._build_audit_log(
            action="update",
            application=JobApplication(id=RESOURCE_ID),
            context={},
            actor=TEST_ADMIN,
        ),
    ],
)
def test_protected_resource_audits_use_authenticated_admin(audit_log) -> None:
    assert audit_log.actor_id == TEST_ADMIN.admin_id
    assert audit_log.actor_email == TEST_ADMIN.admin_email


def test_contact_admin_delete_audit_uses_authenticated_admin() -> None:
    submission = ContactSubmission(id=RESOURCE_ID, status="new")
    contacts = AsyncMock(spec=ContactSubmissionRepository)
    contacts.get_by_id.return_value = submission
    audits = AsyncMock(spec=AuditLogRepository)
    session = AsyncMock(spec=AsyncSession)
    service = ContactSubmissionService(
        session,
        contact_repository=contacts,
        audit_repository=audits,
    )

    asyncio.run(service.delete(RESOURCE_ID, actor=TEST_ADMIN))

    audit_log = audits.add.await_args.args[0]
    assert audit_log.actor_id == TEST_ADMIN.admin_id
    assert audit_log.actor_email == TEST_ADMIN.admin_email
    assert audit_log.context == {"status": "new"}
    session.commit.assert_awaited_once_with()


def test_public_job_application_audit_remains_anonymous() -> None:
    audit_log = JobApplicationService._build_audit_log(
        action="create",
        application=JobApplication(id=RESOURCE_ID),
        context={},
    )

    assert audit_log.actor_id is None
    assert audit_log.actor_email is None
