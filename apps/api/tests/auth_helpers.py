"""Shared authenticated-administrator test context."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import FastAPI

from app.api.dependencies.auth import require_authenticated_admin
from app.auth.models import AuthenticatedAdmin


TEST_ADMIN = AuthenticatedAdmin(
    supabase_user_id=UUID("bf8ee692-f2f9-4b07-bfe7-34c6989bcfde"),
    supabase_email="admin@vyntics.com",
    admin_id=UUID("aada5cc5-f028-4bb5-8b81-e4e698c09c49"),
    admin_auth_user_id=UUID("bf8ee692-f2f9-4b07-bfe7-34c6989bcfde"),
    admin_email="admin@vyntics.com",
    role="admin",
    is_active=True,
    created_at=datetime(2026, 9, 28, 12, 0, tzinfo=timezone.utc),
    updated_at=datetime(2026, 9, 28, 12, 0, tzinfo=timezone.utc),
)


def authenticate_test_admin(application: FastAPI) -> None:
    """Override real authentication for existing API contract tests."""

    application.dependency_overrides[require_authenticated_admin] = (
        lambda: TEST_ADMIN
    )
