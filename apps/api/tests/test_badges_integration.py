"""Opt-in Badge lifecycle verification against configured PostgreSQL."""

import asyncio
from dataclasses import replace
from uuid import uuid4

import pytest
from sqlalchemy import delete, select, text

from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.admin_user import AdminUser
from app.db.models.badge import Badge
from app.db.session import create_database, dispose_database
from app.schemas.badges import BadgeCreateRequest, BadgeUpdateRequest
from app.services.badges import BadgeNotFoundError, BadgeService
from tests.auth_helpers import TEST_ADMIN
from tests.test_database_integration import RUN_DATABASE_INTEGRATION_TESTS


pytestmark = pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use the configured database",
)


def test_badge_crud_visibility_order_and_audits_against_postgresql() -> None:
    async def exercise() -> None:
        database = create_database(Settings())
        badge_ids = []
        admin_id = uuid4()
        auth_user_id = uuid4()
        actor = replace(
            TEST_ADMIN,
            admin_id=admin_id,
            admin_auth_user_id=auth_user_id,
            supabase_user_id=auth_user_id,
            admin_email=f"badge-test-{uuid4()}@vyntics.com",
        )
        try:
            async with database.session_factory() as session:
                columns = set(
                    (
                        await session.scalars(
                            text(
                                "select column_name from information_schema.columns "
                                "where table_schema='public' and table_name='badges'"
                            )
                        )
                    ).all()
                )
                assert {
                    "id",
                    "name",
                    "description",
                    "logo_url",
                    "website_url",
                    "display_order",
                    "is_active",
                    "created_at",
                    "updated_at",
                } <= columns

                session.add(
                    AdminUser(
                        id=admin_id,
                        auth_user_id=auth_user_id,
                        email=actor.admin_email,
                        role="admin",
                        is_active=True,
                    )
                )
                await session.commit()

                service = BadgeService(session)
                first = await service.create(
                    BadgeCreateRequest(
                        name=f"Active A {uuid4()}",
                        description=None,
                        website_url=None,
                        display_order=2,
                        is_active=True,
                    ),
                    actor=actor,
                )
                second = await service.create(
                    BadgeCreateRequest(
                        name=f"Active B {uuid4()}",
                        description="Partner",
                        website_url="https://example.com/badge",
                        display_order=1,
                        is_active=True,
                    ),
                    actor=actor,
                )
                inactive = await service.create(
                    BadgeCreateRequest(
                        name=f"Inactive {uuid4()}",
                        description=None,
                        website_url=None,
                        display_order=0,
                        is_active=False,
                    ),
                    actor=actor,
                )
                badge_ids.extend([first.id, second.id, inactive.id])

                public = [row for row in await service.list_public() if row.id in badge_ids]
                assert [row.id for row in public] == [second.id, first.id]
                admin = [row for row in await service.list_all() if row.id in badge_ids]
                assert {row.id for row in admin} == set(badge_ids)

                selected = await service.get_by_id(first.id)
                original_updated_at = selected.updated_at
                updated = await service.update(
                    selected.id,
                    BadgeUpdateRequest(display_order=3, description="Updated"),
                    actor=actor,
                )
                assert updated.description == "Updated"
                assert updated.updated_at >= original_updated_at

                await service.delete(selected.id, actor=actor)
                with pytest.raises(BadgeNotFoundError):
                    await service.get_by_id(selected.id)

                actions = set(
                    (
                        await session.scalars(
                            select(AuditLog.action).where(
                                AuditLog.resource_id == selected.id,
                                AuditLog.resource_type == "badge",
                            )
                        )
                    ).all()
                )
                assert actions == {"create", "update", "delete"}
        finally:
            async with database.session_factory() as cleanup:
                if badge_ids:
                    await cleanup.execute(
                        delete(AuditLog).where(AuditLog.resource_id.in_(badge_ids))
                    )
                    await cleanup.execute(delete(Badge).where(Badge.id.in_(badge_ids)))
                await cleanup.execute(
                    delete(AdminUser).where(AdminUser.id == admin_id)
                )
                await cleanup.commit()
            await dispose_database(database)

    asyncio.run(exercise())
