"""Actual migration, CRUD and Storage lifecycle in a disposable PostgreSQL schema."""

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import select, text, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.api.dependencies.database import get_db_session
from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.life_at_vyntics import LifeAtVyntics
from app.db.session import create_database, dispose_database
from app.main import create_app
from app.storage.supabase import SupabaseStorageGateway
from tests.auth_helpers import TEST_ADMIN, authenticate_test_admin
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run

pytestmark = pytest.mark.skipif(not RUN_DATABASE_INTEGRATION_TESTS, reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL")
PNG = b"\x89PNG\r\n\x1a\n"


def test_life_at_vyntics_migration_http_lifecycle_and_audit():
    async def exercise():
        database = create_database(Settings())
        schema = "life_at_vyntics_test_" + uuid4().hex
        application = None
        created_schema = False
        storage_client = httpx.AsyncClient()
        gateway = SupabaseStorageGateway(
            Settings(_env_file=None, supabase_url="https://test.supabase.co", supabase_service_role_key="test-only-storage-key"),
            storage_client,
        )
        gateway.upload = AsyncMock()
        gateway.delete = AsyncMock()
        try:
            sql = (Path(__file__).resolve().parents[3] / "supabase/migrations/20261022120000_create_life_at_vyntics.sql").read_text()
            async with database.engine.begin() as connection:
                await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
                created_schema = True
                await connection.execute(text(f'CREATE TABLE "{schema}".audit_logs (LIKE public.audit_logs INCLUDING ALL)'))
                scoped = sql.replace("public.", f'"{schema}".').replace(f'"{schema}".set_updated_at()', "public.set_updated_at()")
                await connection.exec_driver_sql(scoped)
                columns = (await connection.execute(text("SELECT column_name,data_type,is_nullable FROM information_schema.columns WHERE table_schema=:s AND table_name='life_at_vyntics'"), {"s": schema})).all()
                assert {c[0] for c in columns} == {"id", "title", "description", "image_url", "display_order", "is_active", "created_at", "updated_at"}
                assert ("title", "text", "NO") in columns and ("description", "text", "YES") in columns and ("image_url", "text", "YES") in columns
                assert await connection.scalar(text("SELECT count(*) FROM pg_indexes WHERE schemaname=:s AND indexname='ix_life_at_vyntics_active_display_order'"), {"s": schema}) == 1
            engine = database.engine.execution_options(schema_translate_map={None: schema})
            factory = async_sessionmaker(engine, expire_on_commit=False)
            application = create_app(Settings(_env_file=None))

            async def scoped_session():
                async with factory() as session:
                    yield session

            application.dependency_overrides[get_db_session] = scoped_session
            authenticate_test_admin(application)
            application.state.storage_gateway = gateway
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=application), base_url="http://testserver") as client:
                ids = []
                for order, active in [(2, True), (1, True), (1, True), (0, False)]:
                    response = await client.post("/life-at-vyntics", json={"title": f"Moment {order}", "display_order": order, "is_active": active})
                    assert response.status_code == 201
                    ids.append(response.json()["id"])
                created = (await client.post("/life-at-vyntics", json={"title": "Defaults"})).json()
                assert created["display_order"] == 0 and created["is_active"] is True and created["description"] is None and created["image_url"] is None
                ids.append(created["id"])
                async with factory() as session:  # force a created_at tie; id decides
                    await session.execute(update(LifeAtVyntics).where(LifeAtVyntics.id.in_(ids[1:3])).values(created_at=datetime(2026, 10, 1, tzinfo=timezone.utc)))
                    await session.commit()
                public = (await client.get("/life-at-vyntics")).json()["data"]
                assert [r["id"] for r in public][:1] == [ids[4]]
                assert [r["id"] for r in public][1:3] == sorted(ids[1:3])
                assert public[-1]["id"] == ids[0] and ids[3] not in [r["id"] for r in public]
                admin_rows = (await client.get("/admin/life-at-vyntics")).json()
                assert len(admin_rows) == 5 and ids[3] in [r["id"] for r in admin_rows]
                assert (await client.get("/life-at-vyntics/" + ids[3])).status_code == 404
                assert (await client.get("/admin/life-at-vyntics/" + ids[3])).json()["is_active"] is False

                target = ids[0]
                before = (await client.get("/admin/life-at-vyntics/" + target)).json()
                patched = await client.patch("/life-at-vyntics/" + target, json={"description": "Annual offsite"})
                assert patched.status_code == 200 and patched.json()["title"] == before["title"]
                assert patched.json()["updated_at"] > before["updated_at"]
                assert (await client.patch("/life-at-vyntics/" + target, json={"description": None})).json()["description"] is None
                assert (await client.patch("/life-at-vyntics/" + target, json={"title": None})).status_code == 422
                assert (await client.patch("/life-at-vyntics/" + target, json={"is_active": False})).status_code == 200
                assert (await client.get("/life-at-vyntics/" + target)).status_code == 404
                assert (await client.patch("/life-at-vyntics/" + target, json={"is_active": True})).status_code == 200

                path = f"/life-at-vyntics/{target}/image"
                first = await client.put(path, files={"file": ("a.png", PNG + b"first", "image/png")})
                assert first.status_code == 200
                first_url = first.json()["image_url"]
                assert first_url.startswith(f"https://test.supabase.co/storage/v1/object/public/life-at-vyntics/{target}/")
                assert (await client.get("/life-at-vyntics/" + target)).json()["image_url"] == first_url
                second = await client.put(path, files={"file": ("a.png", PNG + b"second", "image/png")})
                assert second.json()["image_url"] != first_url
                assert gateway.delete.await_count == 1
                assert gateway.delete.await_args.args[0] == "life-at-vyntics"
                assert (await client.delete(path)).status_code == 204
                assert (await client.get("/admin/life-at-vyntics/" + target)).json()["image_url"] is None
                assert gateway.delete.await_count == 2
                await client.put(path, files={"file": ("a.png", PNG + b"third", "image/png")})
                assert (await client.delete("/life-at-vyntics/" + target)).status_code == 204
                assert gateway.delete.await_count == 3
                assert (await client.get("/admin/life-at-vyntics/" + target)).status_code == 404
                assert (await client.delete("/life-at-vyntics/" + target)).status_code == 404
            async with factory() as session:
                audits = list((await session.scalars(select(AuditLog).where(AuditLog.resource_type == "life_at_vyntics"))).all())
                assert all(a.actor_id == TEST_ADMIN.admin_id and a.actor_email == TEST_ADMIN.admin_email for a in audits)
                mine = [a for a in audits if str(a.resource_id) == target]
                assert {a.action for a in mine} == {"create", "update", "delete"}
                ops = [a.context["image_operation"] for a in mine if "image_operation" in a.context]
                assert sorted(ops) == ["delete", "replace", "upload", "upload"]
                assert not any("description" in a.context or "title" in a.context for a in audits)
                with pytest.raises(IntegrityError):
                    async with session.begin_nested():
                        await session.execute(update(LifeAtVyntics).values(title="  "))
        finally:
            if application:
                application.dependency_overrides.clear()
                await application.state.auth_verifier.aclose()
            if created_schema:
                async with database.engine.begin() as connection:
                    await connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
            await storage_client.aclose()
            await dispose_database(database)

    _run(asyncio.wait_for(exercise(), timeout=180))
