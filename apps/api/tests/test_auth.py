"""Phase 12 authentication, authorization, and route-boundary tests."""

import asyncio
from datetime import datetime, timezone
from typing import Annotated
from unittest.mock import AsyncMock
from uuid import UUID

import httpx
import pytest
from fastapi import Depends
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    AuthenticatedAdminDependency,
    get_auth_verifier,
    require_admin_roles,
)
from app.api.dependencies.blogs import get_blog_service
from app.api.dependencies.careers import get_career_service
from app.api.dependencies.case_studies import get_case_study_service
from app.api.dependencies.contact_submissions import (
    get_contact_submission_service,
)
from app.api.dependencies.database import get_db_session
from app.api.dependencies.job_applications import get_job_application_service
from app.api.dependencies.team_members import get_team_member_service
from app.auth.models import AuthenticatedAdmin, SupabaseIdentity
from app.auth.supabase import (
    AccessTokenVerifier,
    AuthConfigurationError,
    InvalidAccessTokenError,
    SupabaseTokenVerifier,
)
from app.core.config import Environment, Settings
from app.db.models.admin_user import AdminUser
from app.db.models.contact_submission import ContactSubmission
from app.db.models.job_application import JobApplication
from app.main import create_app
from app.services.blogs import BlogService
from app.services.careers import CareerService
from app.services.case_studies import CaseStudyService
from app.services.contact_submissions import ContactSubmissionService
from app.services.job_applications import JobApplicationService
from app.services.team_members import TeamMemberService


AUTH_USER_ID = UUID("bf8ee692-f2f9-4b07-bfe7-34c6989bcfde")
ADMIN_ID = UUID("aada5cc5-f028-4bb5-8b81-e4e698c09c49")
RESOURCE_ID = UUID("5326b73c-022f-4cc7-8291-8904d3ef01fc")
NOW = datetime(2026, 9, 28, 12, 0, tzinfo=timezone.utc)


def _admin(*, role: str = "admin", is_active: bool = True) -> AdminUser:
    return AdminUser(
        id=ADMIN_ID,
        auth_user_id=AUTH_USER_ID,
        email="database-admin@vyntics.com",
        role=role,
        is_active=is_active,
        created_at=NOW,
        updated_at=NOW,
    )


@pytest.fixture
def authenticated_api():
    verifier = AsyncMock(spec=AccessTokenVerifier)
    verifier.verify.return_value = SupabaseIdentity(
        user_id=AUTH_USER_ID,
        email="token-admin@VYNTICS.COM",
    )
    session = AsyncMock(spec=AsyncSession)
    session.scalar.return_value = _admin()
    blogs = AsyncMock(spec=BlogService)
    blogs.list_all.return_value = []

    application = create_app(
        Settings(
            _env_file=None,
            environment=Environment.TEST,
            debug=False,
            auth_allowed_email_domain="vyntics.com",
        )
    )
    application.dependency_overrides[get_auth_verifier] = lambda: verifier
    application.dependency_overrides[get_db_session] = lambda: session
    application.dependency_overrides[get_blog_service] = lambda: blogs

    @application.get("/_test/auth-context", include_in_schema=False)
    async def auth_context(admin: AuthenticatedAdminDependency) -> dict[str, object]:
        return {
            "supabase_user_id": admin.supabase_user_id,
            "supabase_email": admin.supabase_email,
            "admin_id": admin.admin_id,
            "admin_auth_user_id": admin.admin_auth_user_id,
            "admin_email": admin.admin_email,
            "role": admin.role,
            "is_active": admin.is_active,
        }

    superadmin_dependency = require_admin_roles("superadmin")

    @application.get("/_test/superadmin", include_in_schema=False)
    async def superadmin_only(
        _admin: Annotated[AuthenticatedAdmin, Depends(superadmin_dependency)],
    ) -> dict[str, bool]:
        return {"ok": True}

    with TestClient(application) as client:
        yield client, verifier, session, blogs


def test_valid_token_and_active_mapping_returns_typed_admin_context(
    authenticated_api,
) -> None:
    client, verifier, session, _ = authenticated_api

    response = client.get(
        "/_test/auth-context",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "supabase_user_id": str(AUTH_USER_ID),
        "supabase_email": "token-admin@VYNTICS.COM",
        "admin_id": str(ADMIN_ID),
        "admin_auth_user_id": str(AUTH_USER_ID),
        "admin_email": "database-admin@vyntics.com",
        "role": "admin",
        "is_active": True,
    }
    verifier.verify.assert_awaited_once_with("valid-access-token")
    session.scalar.assert_awaited_once()


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Basic not-bearer"},
        {"Authorization": "Bearer"},
    ],
)
def test_missing_or_malformed_authorization_returns_401_without_db(
    authenticated_api,
    headers: dict[str, str],
) -> None:
    client, verifier, session, _ = authenticated_api

    response = client.get("/admin/blogs", headers=headers)

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
    verifier.verify.assert_not_awaited()
    session.scalar.assert_not_awaited()


@pytest.mark.parametrize("token", ["invalid-token", "expired-token"])
def test_invalid_or_expired_token_returns_401_without_db(
    authenticated_api,
    token: str,
) -> None:
    client, verifier, session, _ = authenticated_api
    verifier.verify.side_effect = InvalidAccessTokenError()

    response = client.get(
        "/admin/blogs",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401
    assert "token" not in response.text.casefold()
    session.scalar.assert_not_awaited()


def test_rejected_supabase_api_key_returns_503_not_token_401(
    authenticated_api,
) -> None:
    client, verifier, session, _ = authenticated_api
    verifier.verify.side_effect = AuthConfigurationError()

    response = client.get(
        "/admin/blogs",
        headers={"Authorization": "Bearer valid-user-token"},
    )

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Authentication service is unavailable."
    }
    session.scalar.assert_not_awaited()


def test_valid_token_without_admin_mapping_returns_401(authenticated_api) -> None:
    client, _, session, _ = authenticated_api
    session.scalar.return_value = None

    response = client.get(
        "/admin/blogs",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 401


def test_inactive_admin_returns_401(authenticated_api) -> None:
    client, _, session, _ = authenticated_api
    session.scalar.return_value = _admin(is_active=False)

    response = client.get(
        "/admin/blogs",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 401


@pytest.mark.parametrize(
    "email",
    [
        "attacker@gmail.com",
        "attacker@vyntics.com.example.com",
        "attacker@notvyntics.com",
    ],
)
def test_verified_identity_outside_exact_allowed_domain_is_rejected(
    authenticated_api,
    email: str,
) -> None:
    client, verifier, session, _ = authenticated_api
    verifier.verify.return_value = SupabaseIdentity(
        user_id=AUTH_USER_ID,
        email=email,
    )

    response = client.get(
        "/admin/blogs",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 401
    session.scalar.assert_not_awaited()


def test_active_admin_can_access_protected_admin_read(authenticated_api) -> None:
    client, _, _, blogs = authenticated_api

    response = client.get(
        "/admin/blogs",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 200
    assert response.json() == []
    blogs.list_all.assert_awaited_once_with()


def test_authenticated_admin_with_insufficient_role_returns_403(
    authenticated_api,
) -> None:
    client, _, _, _ = authenticated_api

    response = client.get(
        "/_test/superadmin",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 403
    assert response.json() == {"detail": "Insufficient permissions."}


def test_superadmin_role_dependency_allows_superadmin(authenticated_api) -> None:
    client, _, session, _ = authenticated_api
    session.scalar.return_value = _admin(role="superadmin")

    response = client.get(
        "/_test/superadmin",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 200


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("get", "/admin/blogs"),
        ("get", f"/admin/blogs/{RESOURCE_ID}"),
        ("post", "/blogs"),
        ("patch", f"/blogs/{RESOURCE_ID}"),
        ("delete", f"/blogs/{RESOURCE_ID}"),
        ("put", f"/blogs/{RESOURCE_ID}/cover-image"),
        ("delete", f"/blogs/{RESOURCE_ID}/cover-image"),
        ("get", "/admin/case-studies"),
        ("get", f"/admin/case-studies/{RESOURCE_ID}"),
        ("post", "/case-studies"),
        ("patch", f"/case-studies/{RESOURCE_ID}"),
        ("delete", f"/case-studies/{RESOURCE_ID}"),
        ("put", f"/case-studies/{RESOURCE_ID}/cover-image"),
        ("delete", f"/case-studies/{RESOURCE_ID}/cover-image"),
        ("post", "/careers"),
        ("patch", f"/careers/{RESOURCE_ID}"),
        ("delete", f"/careers/{RESOURCE_ID}"),
        ("get", f"/admin/careers/{RESOURCE_ID}/applications"),
        ("get", "/admin/job-applications"),
        ("get", f"/admin/job-applications/{RESOURCE_ID}"),
        ("patch", f"/admin/job-applications/{RESOURCE_ID}"),
        ("delete", f"/admin/job-applications/{RESOURCE_ID}"),
        ("post", "/our-team"),
        ("patch", f"/our-team/{RESOURCE_ID}"),
        ("delete", f"/our-team/{RESOURCE_ID}"),
        ("put", f"/our-team/{RESOURCE_ID}/photo"),
        ("delete", f"/our-team/{RESOURCE_ID}/photo"),
        ("get", "/admin/contact-submissions"),
        ("get", f"/admin/contact-submissions/{RESOURCE_ID}"),
        ("delete", f"/admin/contact-submissions/{RESOURCE_ID}"),
    ],
)
def test_every_admin_read_and_mutation_rejects_missing_credentials(
    method: str,
    path: str,
) -> None:
    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST, debug=False)
    )
    with TestClient(application, raise_server_exceptions=False) as client:
        response = client.request(method, path, json={})

    assert response.status_code == 401, (method, path, response.text)


def test_public_route_boundary_remains_accessible_without_credentials() -> None:
    blogs = AsyncMock(spec=BlogService)
    blogs.list_published.return_value = []
    case_studies = AsyncMock(spec=CaseStudyService)
    case_studies.list_published.return_value = []
    careers = AsyncMock(spec=CareerService)
    careers.list_all.return_value = []
    team = AsyncMock(spec=TeamMemberService)
    team.list_all.return_value = []
    contacts = AsyncMock(spec=ContactSubmissionService)
    contacts.create.return_value = ContactSubmission(
        id=RESOURCE_ID,
        name="Public Visitor",
        email="visitor@example.com",
        company=None,
        subject="Question",
        message="Please contact me.",
        source_page="/contact",
        status="new",
        submitted_at=NOW,
        notes=None,
        resolved_at=None,
        resolved_by=None,
    )
    applications = AsyncMock(spec=JobApplicationService)
    applications.create.return_value = JobApplication(
        id=RESOURCE_ID,
        career_id=RESOURCE_ID,
        career_title_snapshot="Engineer",
        career_slug_snapshot="engineer",
        name="Applicant",
        email="applicant@example.com",
        phone="+91 9999999999",
        resume_url=None,
        cover_letter=None,
        status="new",
        notes=None,
        submitted_at=NOW,
    )

    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST, debug=False)
    )
    application.dependency_overrides[get_blog_service] = lambda: blogs
    application.dependency_overrides[get_case_study_service] = lambda: case_studies
    application.dependency_overrides[get_career_service] = lambda: careers
    application.dependency_overrides[get_team_member_service] = lambda: team
    application.dependency_overrides[get_contact_submission_service] = (
        lambda: contacts
    )
    application.dependency_overrides[get_job_application_service] = (
        lambda: applications
    )

    with TestClient(application) as client:
        responses = [
            client.get("/blogs"),
            client.get("/case-studies"),
            client.get("/careers"),
            client.get("/our-team"),
            client.post(
                "/contact-us",
                json={
                    "name": "Public Visitor",
                    "email": "visitor@example.com",
                    "subject": "Question",
                    "message": "Please contact me.",
                    "source_page": "/contact",
                },
            ),
            client.post(
                "/careers/engineer/apply",
                data={
                    "name": "Applicant",
                    "email": "applicant@example.com",
                    "phone": "+91 9999999999",
                },
            ),
        ]

    assert [response.status_code for response in responses] == [
        200,
        200,
        200,
        200,
        201,
        201,
    ]


def test_openapi_marks_only_protected_operations_with_bearer_security() -> None:
    application = create_app(
        Settings(_env_file=None, environment=Environment.TEST, debug=False)
    )

    schema = application.openapi()

    assert schema["components"]["securitySchemes"]["HTTPBearer"] == {
        "type": "http",
        "scheme": "bearer",
    }
    assert "security" not in schema["paths"]["/blogs"]["get"]
    assert schema["paths"]["/blogs"]["post"]["security"] == [
        {"HTTPBearer": []}
    ]
    assert schema["paths"]["/admin/blogs"]["get"]["security"] == [
        {"HTTPBearer": []}
    ]
    assert "security" not in schema["paths"]["/contact-us"]["post"]
    assert "security" not in schema["paths"]["/careers/{slug}/apply"]["post"]


def test_supabase_verifier_uses_auth_user_endpoint_and_verified_payload() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/auth/v1/user"
        assert request.headers["authorization"] == "Bearer verified-token"
        assert request.headers["apikey"] == "public-auth-test-key"
        assert request.headers["apikey"] != "privileged-server-test-key"
        return httpx.Response(
            200,
            json={"id": str(AUTH_USER_ID), "email": "admin@vyntics.com"},
        )

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    verifier = SupabaseTokenVerifier(
        Settings(
            _env_file=None,
            environment=Environment.TEST,
            debug=False,
            supabase_url="https://example.supabase.co",
            supabase_anon_key="public-auth-test-key",
            supabase_service_role_key="privileged-server-test-key",
        ),
        client=client,
    )

    identity = asyncio.run(verifier.verify("verified-token"))
    asyncio.run(client.aclose())

    assert identity == SupabaseIdentity(
        user_id=AUTH_USER_ID,
        email="admin@vyntics.com",
    )


@pytest.mark.parametrize("status_code", [400, 401, 403])
def test_supabase_verifier_rejects_invalid_or_expired_tokens(
    status_code: int,
) -> None:
    transport = httpx.MockTransport(
        lambda _request: httpx.Response(status_code, json={"message": "rejected"})
    )
    client = httpx.AsyncClient(transport=transport)
    verifier = SupabaseTokenVerifier(
        Settings(
            _env_file=None,
            environment=Environment.TEST,
            debug=False,
            supabase_url="https://example.supabase.co",
            supabase_anon_key="public-auth-test-key",
            supabase_service_role_key="privileged-server-test-key",
        ),
        client=client,
    )

    with pytest.raises(InvalidAccessTokenError):
        asyncio.run(verifier.verify("rejected-token"))
    asyncio.run(client.aclose())


def test_supabase_verifier_maps_api_key_rejection_to_configuration_error() -> None:
    transport = httpx.MockTransport(
        lambda _request: httpx.Response(
            401,
            json={"message": "Invalid API key"},
        )
    )
    client = httpx.AsyncClient(transport=transport)
    verifier = SupabaseTokenVerifier(
        Settings(
            _env_file=None,
            environment=Environment.TEST,
            debug=False,
            supabase_url="https://example.supabase.co",
            supabase_anon_key="rejected-public-test-key",
            supabase_service_role_key="unused-privileged-test-key",
        ),
        client=client,
    )

    with pytest.raises(AuthConfigurationError):
        asyncio.run(verifier.verify("valid-user-token"))
    asyncio.run(client.aclose())


def test_supabase_verifier_requires_anon_key_not_service_role_key() -> None:
    verifier = SupabaseTokenVerifier(
        Settings(
            _env_file=None,
            environment=Environment.TEST,
            debug=False,
            supabase_url="https://example.supabase.co",
            supabase_service_role_key="privileged-server-test-key",
        )
    )

    with pytest.raises(AuthConfigurationError):
        asyncio.run(verifier.verify("valid-user-token"))
