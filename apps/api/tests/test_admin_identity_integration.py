"""Opt-in PostgreSQL verification for the current-admin identity endpoint."""

import asyncio
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import func, select

from app.api.dependencies.auth import get_auth_verifier
from app.api.dependencies.database import get_db_session
from app.auth.models import SupabaseIdentity
from app.auth.supabase import AccessTokenVerifier
from app.core.config import Settings
from app.db.models.admin_user import AdminUser
from app.main import create_app
from tests.test_database_integration import RUN_DATABASE_INTEGRATION_TESTS


pytestmark = pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use the configured database",
)


def test_current_admin_uses_real_postgresql_admin_mapping() -> None:
    async def verify() -> None:
        application = create_app(Settings(debug=False))
        async with application.router.lifespan_context(application):
            database = application.state.database
            assert database is not None
            async with database.session_factory() as session:
                admin = AdminUser(
                    id=uuid4(),
                    auth_user_id=uuid4(),
                    email=f"phase-15-{uuid4()}@vyntics.com",
                    role="admin",
                    is_active=True,
                )
                try:
                    session.add(admin)
                    await session.flush()
                    verifier = AsyncMock(spec=AccessTokenVerifier)
                    verifier.verify.return_value = SupabaseIdentity(
                        user_id=admin.auth_user_id,
                        email=admin.email,
                    )
                    application.dependency_overrides[get_auth_verifier] = (
                        lambda: verifier
                    )
                    application.dependency_overrides[get_db_session] = (
                        lambda: session
                    )
                    async with httpx.AsyncClient(
                        transport=httpx.ASGITransport(app=application),
                        base_url="http://test",
                        headers={"Authorization": "Bearer test-token"},
                    ) as client:
                        response = await client.get("/admin/me")
                        assert response.status_code == 200, response.text
                        assert response.json() == {
                            "id": str(admin.id),
                            "auth_user_id": str(admin.auth_user_id),
                            "email": admin.email,
                            "role": "admin",
                            "is_active": True,
                            "created_at": admin.created_at.isoformat().replace(
                                "+00:00", "Z"
                            ),
                            "updated_at": admin.updated_at.isoformat().replace(
                                "+00:00", "Z"
                            ),
                        }
                        admin.role = "superadmin"
                        await session.flush()
                        elevated = await client.get("/admin/me")
                        assert elevated.status_code == 200
                        assert elevated.json()["role"] == "superadmin"
                finally:
                    await session.rollback()

            async with database.session_factory() as verification_session:
                remaining = await verification_session.scalar(
                    select(func.count())
                    .select_from(AdminUser)
                    .where(AdminUser.id == admin.id)
                )
                assert remaining == 0

    asyncio.run(verify())
