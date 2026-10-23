"""Actual migrations, ordering and Storage lifecycle in a disposable PostgreSQL schema."""

import asyncio
from pathlib import Path
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.api.dependencies.database import get_db_session
from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.session import create_database, dispose_database
from app.main import create_app
from app.storage.supabase import SupabaseStorageGateway
from tests.auth_helpers import TEST_ADMIN, authenticate_test_admin
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run

pytestmark = pytest.mark.skipif(not RUN_DATABASE_INTEGRATION_TESTS, reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL")
MIGRATIONS = Path(__file__).resolve().parents[3] / "supabase/migrations"
PNG = b"\x89PNG\r\n\x1a\n"


def _scoped(sql, schema):
    return sql.replace("public.", f'"{schema}".').replace(f'"{schema}".set_updated_at()', "public.set_updated_at()")


async def _with_schema(body):
    database = create_database(Settings())
    schema = "life_at_vyntics_test_" + uuid4().hex
    created = False
    try:
        async with database.engine.begin() as connection:
            await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
            created = True
            await connection.execute(text(f'CREATE TABLE "{schema}".audit_logs (LIKE public.audit_logs INCLUDING ALL)'))
        await body(database, schema)
    finally:
        if created:
            async with database.engine.begin() as connection:
                await connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        await dispose_database(database)


def test_forward_migration_preserves_rows_urls_and_normalizes_order():
    async def body(database, schema):
        async with database.engine.begin() as connection:
            await connection.exec_driver_sql(_scoped((MIGRATIONS / "20261022120000_create_life_at_vyntics.sql").read_text(), schema))
            # Previous schema: ties, gaps, zero, inactive row, and mixed image URLs.
            await connection.execute(text(f'''
                insert into "{schema}".life_at_vyntics (id, title, description, image_url, display_order, is_active, created_at) values
                ('00000000-0000-0000-0000-00000000000a','A','d','https://x.test/a.png',9,true,'2026-10-01'),
                ('00000000-0000-0000-0000-00000000000b','B',null,null,0,false,'2026-10-02'),
                ('00000000-0000-0000-0000-00000000000c','C',null,'https://x.test/c.png',9,true,'2026-10-03'),
                ('00000000-0000-0000-0000-00000000000d','D',null,'https://x.test/d.png',3,true,'2026-10-04')'''))
            await connection.exec_driver_sql(_scoped((MIGRATIONS / "20261023120000_simplify_life_at_vyntics.sql").read_text(), schema))
            columns = set((await connection.execute(text("select column_name from information_schema.columns where table_schema=:s and table_name='life_at_vyntics'"), {"s": schema})).scalars())
            assert columns == {"id", "image_url", "display_order", "created_at", "updated_at"}
            rows = (await connection.execute(text(f'select right(id::text,1), image_url, display_order from "{schema}".life_at_vyntics order by display_order'))).all()
            assert rows == [("b", None, 1), ("d", "https://x.test/d.png", 2), ("a", "https://x.test/a.png", 3), ("c", "https://x.test/c.png", 4)]
            assert await connection.scalar(text("select count(*) from pg_indexes where schemaname=:s and indexname='ix_life_at_vyntics_active_display_order'"), {"s": schema}) == 0
            assert await connection.scalar(text("select default_ok from (select column_default is null as default_ok from information_schema.columns where table_schema=:s and table_name='life_at_vyntics' and column_name='display_order') t"), {"s": schema})
            constraints = dict((await connection.execute(text("select conname, condeferrable and condeferred from pg_constraint where conrelid=cast(:t as regclass) and contype in ('u','c')"), {"t": f'"{schema}".life_at_vyntics'})).all())
            assert constraints == {"ck_life_at_vyntics_display_order_positive": False, "uq_life_at_vyntics_display_order": True}
            assert await connection.scalar(text("select count(*) from pg_trigger where tgrelid=cast(:t as regclass) and not tgisinternal"), {"t": f'"{schema}".life_at_vyntics'}) == 1
        for statement in ("insert into {t} (display_order) values (0)", "insert into {t} (display_order) values (-1)", "insert into {t} (display_order) values (1)"):
            with pytest.raises(IntegrityError):
                async with database.engine.begin() as connection:
                    await connection.execute(text(statement.format(t=f'"{schema}".life_at_vyntics')))

    _run(asyncio.wait_for(_with_schema(body), timeout=120))


def test_life_at_vyntics_ordering_storage_and_audit_lifecycle():
    async def body(database, schema):
        storage_client = httpx.AsyncClient()
        gateway = SupabaseStorageGateway(
            Settings(_env_file=None, supabase_url="https://test.supabase.co", supabase_service_role_key="test-only-storage-key"),
            storage_client,
        )
        gateway.upload = AsyncMock()
        gateway.delete = AsyncMock()
        async with database.engine.begin() as connection:
            for name in ("20261022120000_create_life_at_vyntics", "20261023120000_simplify_life_at_vyntics"):
                await connection.exec_driver_sql(_scoped((MIGRATIONS / f"{name}.sql").read_text(), schema))
        engine = database.engine.execution_options(schema_translate_map={None: schema})
        factory = async_sessionmaker(engine, expire_on_commit=False)
        application = create_app(Settings(_env_file=None))

        async def scoped_session():
            async with factory() as session:
                yield session

        application.dependency_overrides[get_db_session] = scoped_session
        authenticate_test_admin(application)
        application.state.storage_gateway = gateway
        try:
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=application), base_url="http://testserver") as client:
                async def order():
                    rows = (await client.get("/admin/life-at-vyntics")).json()
                    assert [r["display_order"] for r in rows] == list(range(1, len(rows) + 1))
                    return [r["id"] for r in rows]

                async def create(position=None):
                    response = await client.post("/life-at-vyntics", json={} if position is None else {"display_order": position})
                    assert response.status_code == 201
                    assert set(response.json()) == {"id", "image_url", "display_order", "created_at", "updated_at"}
                    return response.json()["id"]

                assert (await client.get("/life-at-vyntics")).json() == {"data": []}
                a, b, c = [await create() for _ in range(3)]
                assert await order() == [a, b, c]
                d = await create(1)
                assert await order() == [d, a, b, c]
                e = await create(100)
                assert await order() == [d, a, b, c, e]
                f = await create(3)
                assert await order() == [d, a, f, b, c, e]
                # Reorder: last to second, first to fourth, no-op, clamped.
                assert (await client.patch(f"/life-at-vyntics/{e}", json={"display_order": 2})).json()["display_order"] == 2
                assert await order() == [d, e, a, f, b, c]
                assert (await client.patch(f"/life-at-vyntics/{d}", json={"display_order": 4})).status_code == 200
                assert await order() == [e, a, f, d, b, c]
                assert (await client.patch(f"/life-at-vyntics/{d}", json={"display_order": 4})).status_code == 200
                assert (await client.patch(f"/life-at-vyntics/{e}", json={"display_order": 99})).json()["display_order"] == 6
                assert await order() == [a, f, d, b, c, e]
                for bad in (0, -1, 1.5, None):
                    assert (await client.patch(f"/life-at-vyntics/{a}", json={"display_order": bad})).status_code == 422
                # Concurrent mutations stay dense and duplicate-free.
                created = await asyncio.gather(*[create() for _ in range(3)], *[create(1) for _ in range(3)])
                assert len(set(await order())) == 12
                await asyncio.gather(*[client.patch(f"/life-at-vyntics/{x}", json={"display_order": 1 + i}) for i, x in enumerate(created)])
                assert len(set(await order())) == 12
                await asyncio.gather(*[client.delete(f"/life-at-vyntics/{x}") for x in created])
                assert await order() == [a, f, d, b, c, e]
                # Delete closes gaps: first, middle, last.
                assert (await client.delete(f"/life-at-vyntics/{a}")).status_code == 204
                assert await order() == [f, d, b, c, e]
                assert (await client.delete(f"/life-at-vyntics/{b}")).status_code == 204
                assert await order() == [f, d, c, e]
                assert (await client.delete(f"/life-at-vyntics/{e}")).status_code == 204
                assert await order() == [f, d, c]
                assert (await client.delete(f"/life-at-vyntics/{e}")).status_code == 404
                # Images do not affect order; removing one keeps the record and position.
                path = f"/life-at-vyntics/{d}/image"
                first = await client.put(path, files={"file": ("a.png", PNG + b"1", "image/png")})
                assert first.status_code == 200 and first.json()["display_order"] == 2
                assert first.json()["image_url"].startswith(f"https://test.supabase.co/storage/v1/object/public/life-at-vyntics/{d}/")
                assert (await client.put(path, files={"file": ("a.png", PNG + b"2", "image/png")})).json()["image_url"] != first.json()["image_url"]
                assert gateway.delete.await_count == 1
                assert (await client.get("/life-at-vyntics")).json()["data"][1]["image_url"] is not None
                assert (await client.delete(path)).status_code == 204
                assert gateway.delete.await_count == 2
                kept = (await client.get(f"/admin/life-at-vyntics/{d}")).json()
                assert kept["image_url"] is None and kept["display_order"] == 2
                await client.put(path, files={"file": ("a.png", PNG + b"3", "image/png")})
                assert (await client.delete(f"/life-at-vyntics/{d}")).status_code == 204
                assert gateway.delete.await_count == 3
                assert await order() == [f, c]
            async with factory() as session:
                audits = list((await session.scalars(select(AuditLog).where(AuditLog.resource_type == "life_at_vyntics"))).all())
                assert all(a.actor_id == TEST_ADMIN.admin_id for a in audits)
                assert {x.action for x in audits} == {"create", "update", "delete"}
                assert {x.context["image_operation"] for x in audits if "image_operation" in x.context} == {"upload", "replace", "delete"}
                assert any(x.context.get("previous_display_order") for x in audits)
        finally:
            application.dependency_overrides.clear()
            await application.state.auth_verifier.aclose()
            await storage_client.aclose()

    _run(asyncio.wait_for(_with_schema(body), timeout=180))
