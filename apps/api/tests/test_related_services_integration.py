"""Related-service migration, persistence, and filtering on real PostgreSQL."""

import asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

import pytest
import httpx
from sqlalchemy import insert, select, text, update
from sqlalchemy.exc import IntegrityError

from app.api.dependencies.database import get_db_session
from app.core.config import Settings
from app.main import create_app
from tests.auth_helpers import authenticate_test_admin
from app.db.models.blog import Blog
from app.db.models.case_study import CaseStudy
from tests.test_featured_content import RESOURCES
from tests.test_featured_content_integration import isolated_database, request_for
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run
from tests.test_related_services import SERVICES, TARGETS

pytestmark = pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL",
)


@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
def test_related_service_migration_persistence_and_all_public_filters(config):
    async def exercise():
        async with isolated_database() as (database, schema, factory):
            model = Blog if config[7] == "blogs" else CaseStudy
            table = model.__tablename__
            # Exercise the actual migration from its pre-migration shape even
            # when the configured database has already deployed these columns.
            async with database.engine.begin() as connection:
                for name in ("blogs", "case_studies"):
                    await connection.execute(text(f'ALTER TABLE "{schema}".{name} DROP COLUMN IF EXISTS related_service'))
            legacy = request_for(config, status="published", featured=False).model_dump(mode="json")
            legacy.pop("related_service")
            legacy["published_at"] = datetime(2026, 1, 1, tzinfo=timezone.utc)
            legacy["id"] = uuid4()
            legacy_id = legacy["id"]
            async with factory() as session:
                await session.execute(insert(model).values(**legacy))
                await session.commit()
            sql = (Path(__file__).resolve().parents[3] / "supabase/migrations/20261013090000_content_related_service.sql").read_text()
            async with database.engine.begin() as connection:
                await connection.exec_driver_sql(sql.replace("public.", f'"{schema}".'))
            async with factory() as session:
                old = await session.get(model, legacy_id)
                assert old.related_service is None
                assert old.slug == legacy["slug"]
                assert old.content == legacy["content"]
                counter = 0

                def clock():
                    nonlocal counter
                    counter += 1
                    return datetime(2026, 2, 1, tzinfo=timezone.utc) + timedelta(seconds=counter)

                service = config[1](session, clock=clock)
                records = {}
                for target in TARGETS:
                    payload = request_for(config, status="published", featured=False).model_dump()
                    records[target] = await service.create(config[2](**{**payload, "related_service": target}))
                draft_payload = request_for(config, status="draft", featured=False).model_dump()
                draft = await service.create(config[2](**{**draft_payload, "related_service": "all"}))
                session.expunge_all()
                for target, row in records.items():
                    assert (await session.get(model, row.id)).related_service == target
                for target in SERVICES:
                    rows = await service.list_published(related_service=target)
                    assert [row.id for row in rows] == [records["all"].id, records[target].id]
                    assert len({row.id for row in rows}) == 2
                    assert all(row.related_service in (target, "all") for row in rows)
                    assert draft.id not in {row.id for row in rows}
                unfiltered = await service.list_published()
                assert len(unfiltered) == len(TARGETS) + 1
                assert legacy_id in {row.id for row in unfiltered}
                changed = records[None]
                for target in (SERVICES[0], SERVICES[1], "all", None):
                    row = await service.update(changed.id, config[3](related_service=target))
                    assert row.related_service == target
                    await session.refresh(row)
                    assert row.related_service == target
                application = create_app(Settings(_env_file=None))

                async def session_dependency():
                    async with factory() as http_session:
                        yield http_session

                application.dependency_overrides[get_db_session] = session_dependency
                authenticate_test_admin(application)
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=application), base_url="http://testserver") as client:
                    for target in SERVICES:
                        response = await client.get(f"/{config[7]}", params={"related_service": target})
                        assert response.status_code == 200
                        items = response.json()["data"]
                        assert [item["id"] for item in items] == [str(records["all"].id), str(records[target].id)]
                        assert {item["related_service"] for item in items} == {target, "all"}
                    response = await client.get(f"/admin/{config[7]}")
                    assert response.status_code == 200
                    assert len(response.json()) == len(TARGETS) + 2
                    response = await client.get(f"/{config[7]}/{records['all'].slug}")
                    assert response.status_code == 200
                    assert response.json()["related_service"] == "all"
                application.dependency_overrides.clear()
                await application.state.auth_verifier.aclose()
                original_slug = row.slug
                row = await service.update(row.id, config[3](title="A new title"))
                assert row.slug == original_slug
                assert row.related_service is None
                with pytest.raises(IntegrityError):
                    async with session.begin_nested():
                        await session.execute(update(model).where(model.id == row.id).values(related_service="invalid"))
    _run(asyncio.wait_for(exercise(), timeout=120))
