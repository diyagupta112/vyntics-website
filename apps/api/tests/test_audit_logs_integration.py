"""Opt-in PostgreSQL audit reads; synthetic fixtures are always rolled back."""

import asyncio
from dataclasses import replace
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import func, select, text

from app.api.dependencies.auth import get_auth_verifier, require_authenticated_admin
from app.api.dependencies.database import get_db_session
from app.auth.models import SupabaseIdentity
from app.auth.supabase import AccessTokenVerifier
from app.core.config import Settings
from app.db.models.admin_user import AdminUser
from app.db.models.audit_log import AuditLog
from app.main import create_app
from tests.auth_helpers import TEST_ADMIN
from tests.test_database_integration import RUN_DATABASE_INTEGRATION_TESTS


pytestmark = pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use the configured database",
)
PATH = "/admin/audit-logs"


def test_postgresql_http_filters_pagination_and_real_admin_resolution():
    async def verify():
        application = create_app(Settings(debug=False))
        async with application.router.lifespan_context(application):
            database = application.state.database
            assert database is not None
            async with database.session_factory() as session:
                # No commit: fixtures cannot become persistent production audit data.
                try:
                    admin = AdminUser(
                        id=uuid4(), auth_user_id=uuid4(),
                        email=f"audit-test-{uuid4()}@vyntics.com",
                        role="superadmin", is_active=True,
                    )
                    session.add(admin)
                    await session.flush()
                    resource_id = uuid4()
                    marker = f"audit-test-{uuid4()}"
                    start = datetime(2020, 1, 1, tzinfo=timezone.utc)
                    records = [AuditLog(
                        id=uuid4(), actor_id=admin.id if index != 3 else None,
                        actor_email=admin.email if index != 3 else None,
                        action="update" if index % 2 else "create",
                        resource_type=marker if index != 2 else marker + "-other",
                        resource_id=resource_id,
                        context={"changed_fields": ["status"], "nested": {"ok": True, "old": None}},
                        created_at=start + timedelta(hours=min(index, 2)),
                    ) for index in range(4)]
                    session.add_all(records)
                    await session.flush()
                    verifier = AsyncMock(spec=AccessTokenVerifier)
                    verifier.verify.return_value = SupabaseIdentity(
                        user_id=admin.auth_user_id, email=admin.email,
                    )
                    application.dependency_overrides[get_auth_verifier] = lambda: verifier
                    application.dependency_overrides[get_db_session] = lambda: session
                    async with httpx.AsyncClient(
                        transport=httpx.ASGITransport(app=application),
                        base_url="http://test", headers={"Authorization": "Bearer test-token"},
                    ) as client:
                        async def check(filters, expected, *, page=1, page_size=25):
                            response = await client.get(PATH, params={
                                "resource_id": str(resource_id), "page": page,
                                "page_size": page_size, **filters,
                            })
                            assert response.status_code == 200, response.text
                            body = response.json()
                            ordered = sorted(expected, key=lambda row: (row.created_at, row.id), reverse=True)
                            assert body["total"] == len(expected)
                            assert body["page"] == page and body["page_size"] == page_size
                            assert [row["id"] for row in body["items"]] == [
                                str(row.id) for row in ordered[(page - 1) * page_size:page * page_size]
                            ]
                            assert all("context" not in row for row in body["items"])
                        await check({}, records)
                        await check({}, records, page=1, page_size=2)
                        await check({}, records, page=2, page_size=2)
                        await check({}, records, page=3, page_size=2)
                        await check({"actor_id": str(admin.id)}, records[:3])
                        await check({"action": "update"}, [records[1], records[3]])
                        await check({"resource_type": marker}, [records[0], records[1], records[3]])
                        await check({"from": records[1].created_at.isoformat()}, records[1:])
                        await check({"to": records[1].created_at.isoformat()}, records[:2])
                        await check({"from": records[1].created_at.isoformat(), "to": records[1].created_at.isoformat()}, [records[1]])
                        await check({
                            "actor_id": str(admin.id), "action": "update", "resource_type": marker,
                            "from": start.isoformat(), "to": records[2].created_at.isoformat(),
                        }, [records[1]])
                        await check({"action": "not-present"}, [])
                        await check({"resource_id": str(uuid4())}, [])
                        # Different timezone offsets represent the same inclusive bound.
                        await check({"to": "2020-01-01T06:30:00+05:30"}, records[:2])
                        detail = await client.get(f"{PATH}/{records[3].id}")
                        assert detail.status_code == 200
                        assert detail.json()["context"] == records[3].context
                        assert detail.json()["actor_id"] is None
                        assert detail.json()["actor_email"] is None
                        assert (await client.get(f"{PATH}/{uuid4()}")).status_code == 404
                        admin.role = "admin"
                        await session.flush()
                        for path in (PATH, f"{PATH}/{records[0].id}"):
                            assert (await client.get(path, params={"role": "superadmin"})).status_code == 403
                        admin.is_active = False
                        await session.flush()
                        assert (await client.get(PATH)).status_code == 401
                        admin.is_active = True
                        verifier.verify.return_value = SupabaseIdentity(user_id=uuid4(), email=admin.email)
                        assert (await client.get(PATH)).status_code == 401
                        verifier.verify.assert_awaited()
                finally:
                    await session.rollback()
            async with database.session_factory() as session:
                assert await session.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.resource_id == resource_id)) == 0
    asyncio.run(verify())


def test_existing_audit_data_read_only_http_and_indexes():
    async def verify():
        application = create_app(Settings(debug=False))
        # Existing shared auth override; no live user's access token is available.
        application.dependency_overrides[require_authenticated_admin] = (
            lambda: replace(TEST_ADMIN, role="superadmin")
        )
        async with application.router.lifespan_context(application):
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=application), base_url="http://test",
            ) as client:
                response = await client.get(PATH, params={"page_size": 1})
                assert response.status_code == 200
                body = response.json()
                assert body["total"] >= len(body["items"])
                if body["items"]:
                    item = body["items"][0]
                    detail = await client.get(f"{PATH}/{item['id']}")
                    assert detail.status_code == 200
                    assert {key: detail.json()[key] for key in item} == item
                    assert isinstance(detail.json()["context"], dict)
                async with application.state.database.session_factory() as session:
                    indexes = (await session.scalars(text(
                        "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'audit_logs'"
                    ))).all()
                    assert {"ix_audit_logs_actor_created_at", "ix_audit_logs_resource_created_at"} <= set(indexes)
    asyncio.run(verify())
