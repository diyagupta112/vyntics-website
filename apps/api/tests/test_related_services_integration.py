"""Multi-service migration, persistence and filtering on real PostgreSQL."""

import asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import insert, text, update
from sqlalchemy.exc import IntegrityError

from app.api.dependencies.database import get_db_session
from app.core.config import Settings
from app.db.models.blog import Blog
from app.db.models.case_study import CaseStudy
from app.main import create_app
from tests.auth_helpers import authenticate_test_admin
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run
from tests.test_featured_content import RESOURCES
from tests.test_featured_content_integration import isolated_database, request_for
from tests.test_related_services import SERVICES

pytestmark = pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL",
)
MIGRATION = Path(__file__).resolve().parents[3] / "supabase/migrations/20261027120000_multi_service_targeting.sql"
LEGACY_VALUES = [None, *SERVICES, "all"]


async def _force_legacy_shape(connection, schema, table, name):
    """Make the disposable clone look like production before this migration."""
    await connection.execute(text(
        f'ALTER TABLE "{schema}".{table} '
        "ADD COLUMN IF NOT EXISTS related_services text[] NOT NULL DEFAULT '{}', "
        "ADD COLUMN IF NOT EXISTS related_sub_services text[] NOT NULL DEFAULT '{}', "
        "ADD COLUMN IF NOT EXISTS related_service text, "
        f"DROP CONSTRAINT IF EXISTS ck_{table}_related_services, DROP CONSTRAINT IF EXISTS ck_{table}_related_service"
    ))


async def _to_legacy(connection, schema, table):
    values = ", ".join(f"'{value}'" for value in [*SERVICES, "all"])
    await connection.execute(text(
        f'ALTER TABLE "{schema}".{table} DROP COLUMN related_services, DROP COLUMN related_sub_services, '
        f"ADD CONSTRAINT ck_{table}_related_service CHECK (related_service IN ({values}))"
    ))


@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
def test_migration_preserves_assignments_and_new_targeting_works_on_postgresql(config):
    async def exercise():
        async with isolated_database() as (database, schema, factory):
            model = Blog if config[7] == "blogs" else CaseStudy
            table = model.__tablename__
            async with database.engine.begin() as connection:
                await _force_legacy_shape(connection, schema, "blogs", "blogs")
                await _force_legacy_shape(connection, schema, "case_studies", "case_studies")

            legacy_rows = {}
            async with factory() as session:
                for value in LEGACY_VALUES:
                    payload = request_for(config, status="published", featured=False).model_dump(mode="json")
                    payload["id"] = uuid4()
                    payload["published_at"] = datetime(2026, 1, 1, tzinfo=timezone.utc)
                    payload.pop("related_services", None)
                    payload.pop("related_sub_services", None)
                    await session.execute(insert(model).values(**payload))
                    legacy_rows[value] = payload
                await session.commit()
            async with database.engine.begin() as connection:
                for value, payload in legacy_rows.items():
                    await connection.execute(
                        text(f'UPDATE "{schema}".{table} SET related_service = :value WHERE id = :id'),
                        {"value": value, "id": payload["id"]},
                    )
                await _to_legacy(connection, schema, "blogs")
                await _to_legacy(connection, schema, "case_studies")

            sql = MIGRATION.read_text()
            async with database.engine.begin() as connection:
                await connection.exec_driver_sql(sql.replace("public.", f'"{schema}".'))
                columns = set((await connection.execute(text("SELECT column_name FROM information_schema.columns WHERE table_schema=:s AND table_name=:t"), {"s": schema, "t": table})).scalars())
                assert {"related_services", "related_sub_services"} <= columns and "related_service" not in columns
                assert await connection.scalar(text("SELECT count(*) FROM pg_indexes WHERE schemaname=:s AND indexname IN (:a, :b)"), {"s": schema, "a": f"ix_{table}_related_services", "b": f"ix_{table}_related_sub_services"}) == 2
                assert await connection.scalar(text("SELECT count(*) FROM pg_constraint WHERE conname = :n AND connamespace = cast(:s AS regnamespace)"), {"n": f"ck_{table}_related_services", "s": f'"{schema}"'}) == 1
                rows = (await connection.execute(text(f'SELECT id, related_services, related_sub_services FROM "{schema}".{table}'))).all()
            migrated = {row.id: row for row in rows}
            assert len(migrated) == len(LEGACY_VALUES)
            for value, payload in legacy_rows.items():
                row = migrated[payload["id"]]
                expected = [] if value is None else SERVICES if value == "all" else [value]
                assert list(row.related_services) == expected, value
                assert list(row.related_sub_services) == []

            counter = 0

            def clock():
                nonlocal counter
                counter += 1
                return datetime(2026, 2, 1, tzinfo=timezone.utc) + timedelta(seconds=counter)

            async with factory() as session:
                old = await session.get(model, legacy_rows["cloud_foundations"]["id"])
                assert old.slug == legacy_rows["cloud_foundations"]["slug"] and old.content == legacy_rows["cloud_foundations"]["content"]
                service = config[1](session, clock=clock)
                targeted = {}
                combos = {
                    "none": ([], []),
                    "cloud": (["cloud_foundations"], ["cloud_migration"]),
                    "multi": (["cloud_foundations", "data_engineering"], ["cloud_migration", "data_migration"]),
                    "data": (["data_engineering"], ["data_migration"]),
                }
                for key, (services, subs) in combos.items():
                    payload = request_for(config, status="published", featured=False).model_dump()
                    targeted[key] = await service.create(config[2](**{**payload, "related_services": services, "related_sub_services": subs}))
                draft = await service.create(config[2](**{**request_for(config, status="draft", featured=False).model_dump(), "related_services": ["cloud_foundations"], "related_sub_services": ["cloud_migration"]}))
                session.expunge_all()

                def ids(rows):
                    return {row.id for row in rows}

                legacy_ids = {value: payload["id"] for value, payload in legacy_rows.items()}
                cloud = ids(await service.list_published(related_service="cloud_foundations"))
                assert cloud == {targeted["cloud"].id, targeted["multi"].id, legacy_ids["cloud_foundations"], legacy_ids["all"]}
                data = ids(await service.list_published(related_service="data_engineering"))
                assert data == {targeted["multi"].id, targeted["data"].id, legacy_ids["data_engineering"], legacy_ids["all"]}
                assert ids(await service.list_published(related_sub_service="cloud_migration")) == {targeted["cloud"].id, targeted["multi"].id}
                assert ids(await service.list_published(related_sub_service="data_migration")) == {targeted["multi"].id, targeted["data"].id}
                assert ids(await service.list_published(related_service="data_engineering", related_sub_service="cloud_migration")) == {targeted["multi"].id}
                assert ids(await service.list_published(related_service="analytics_bi")) == {legacy_ids["analytics_bi"], legacy_ids["all"]}
                assert await service.list_published(related_sub_service="unused_key") == []
                assert draft.id not in cloud
                unfiltered = await service.list_published()
                assert len(unfiltered) == len(LEGACY_VALUES) + len(combos)

                row = await service.update(targeted["none"].id, config[3](related_services=["ai_solutions", "crm_revenue_ops"], related_sub_services=["x_one"]))
                await session.refresh(row)
                assert row.related_services == ["ai_solutions", "crm_revenue_ops"] and row.related_sub_services == ["x_one"]
                row = await service.update(row.id, config[3](related_services=None, related_sub_services=[]))
                await session.refresh(row)
                assert row.related_services == [] and row.related_sub_services == []
                original_slug = row.slug
                row = await service.update(row.id, config[3](title="A new title"))
                assert row.slug == original_slug and row.related_services == []

                application = create_app(Settings(_env_file=None))

                async def session_dependency():
                    async with factory() as http_session:
                        yield http_session

                application.dependency_overrides[get_db_session] = session_dependency
                authenticate_test_admin(application)
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=application), base_url="http://testserver") as client:
                    for service_key, expected in (("cloud_foundations", cloud), ("data_engineering", data)):
                        response = await client.get(f"/{config[7]}", params={"related_service": service_key})
                        assert response.status_code == 200
                        assert {item["id"] for item in response.json()["data"]} == {str(i) for i in expected}
                        assert all(service_key in item["related_services"] for item in response.json()["data"])
                    response = await client.get(f"/{config[7]}", params={"related_sub_service": "data_migration"})
                    assert {item["id"] for item in response.json()["data"]} == {str(targeted["multi"].id), str(targeted["data"].id)}
                    assert (await client.get(f"/{config[7]}", params={"related_service": "all"})).status_code == 422
                    assert len((await client.get(f"/{config[7]}")).json()["data"]) == len(LEGACY_VALUES) + len(combos)
                    detail = await client.get(f"/{config[7]}/{targeted['multi'].slug}")
                    assert detail.json()["related_services"] == ["cloud_foundations", "data_engineering"]
                    assert detail.json()["related_sub_services"] == ["cloud_migration", "data_migration"]
                    admin = await client.get(f"/admin/{config[7]}")
                    assert admin.status_code == 200 and len(admin.json()) == len(LEGACY_VALUES) + len(combos) + 1
                    created = await client.post(f"/{config[7]}", json={**request_for(config, status="draft", featured=False).model_dump(mode="json"), "related_services": ["analytics_bi", "analytics_bi"], "related_sub_services": [" b_one", "a_one"]})
                    assert created.status_code == 201
                    assert created.json()["related_services"] == ["analytics_bi"] and created.json()["related_sub_services"] == ["b_one", "a_one"]
                application.dependency_overrides.clear()
                await application.state.auth_verifier.aclose()

                with pytest.raises(IntegrityError):
                    async with session.begin_nested():
                        await session.execute(update(model).where(model.id == row.id).values(related_services=["invalid"]))
                with pytest.raises(IntegrityError):
                    async with session.begin_nested():
                        await session.execute(update(model).where(model.id == row.id).values(related_services=["all"]))

    _run(asyncio.wait_for(exercise(), timeout=240))
