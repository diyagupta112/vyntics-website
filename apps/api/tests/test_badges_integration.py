"""Opt-in Badge lifecycle verification against configured PostgreSQL.

Runs in a disposable schema so it never touches the real badges, whose display_order
must stay contiguous."""

import asyncio
from dataclasses import replace
from uuid import uuid4

import pytest
from pathlib import Path

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.admin_user import AdminUser
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
        schema = "badge_test_" + uuid4().hex
        created_schema = False
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
            migration = Path(__file__).resolve().parents[3] / "supabase/migrations/20261029120000_standardize_display_order.sql"
            async with database.engine.begin() as connection:
                await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
                created_schema = True
                for table in ("admin_users", "audit_logs", "badges"):
                    await connection.execute(text(f'CREATE TABLE "{schema}"."{table}" (LIKE public."{table}" INCLUDING ALL)'))
                for name in ("ck_badges_display_order_positive", "uq_badges_display_order"):
                    await connection.execute(text(f'ALTER TABLE "{schema}".badges DROP CONSTRAINT IF EXISTS "{name}"'))
                # Only the badges part of the migration is needed; the other tables are not cloned.
                badges_sql = migration.read_text()
                start = badges_sql.index("with stats as")
                end = badges_sql.index("with stats as", start + 1)
                await connection.exec_driver_sql(
                    (badges_sql[start:end] + """
alter table public.badges
    add constraint ck_badges_display_order_positive check (display_order >= 1),
    add constraint uq_badges_display_order unique (display_order) deferrable initially deferred;
""").replace("public.", f'"{schema}".')
                )
            factory = async_sessionmaker(
                database.engine.execution_options(schema_translate_map={None: schema}),
                expire_on_commit=False,
            )
            async with factory() as session:
                columns = set(
                    (
                        await session.scalars(
                            text(
                                "select column_name from information_schema.columns "
                                f"where table_schema='{schema}' and table_name='badges'"
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
                        display_order=2,  # empty table: clamped to 1
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
                        is_active=False,
                    ),
                    actor=actor,
                )
                badge_ids.extend([first.id, second.id, inactive.id])

                session.expire_all()  # bulk shifts do not update objects already in this session
                public = await service.list_public()
                assert [row.id for row in public] == [second.id, first.id]
                assert [row.display_order for row in public] == [1, 2]
                admin = await service.list_all()
                assert [row.id for row in admin] == [second.id, first.id, inactive.id]
                assert [row.display_order for row in admin] == [1, 2, 3]

                selected = await service.get_by_id(first.id)
                original_updated_at = selected.updated_at
                updated = await service.update(
                    selected.id,
                    BadgeUpdateRequest(display_order=3, description="Updated"),
                    actor=actor,
                )
                assert updated.description == "Updated" and updated.display_order == 3
                session.expire_all()
                assert [row.id for row in await service.list_all()] == [second.id, inactive.id, first.id]
                assert updated.updated_at >= original_updated_at

                await service.delete(selected.id, actor=actor)
                session.expire_all()
                assert [row.display_order for row in await service.list_all()] == [1, 2]
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
            if created_schema:
                async with database.engine.begin() as connection:
                    await connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
            await dispose_database(database)

    asyncio.run(exercise())
