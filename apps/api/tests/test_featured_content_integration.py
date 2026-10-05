"""Real PostgreSQL capacity/concurrency tests isolated from public content."""

import asyncio
import json
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import uuid4

import pytest
from pydantic import SecretStr
from sqlalchemy import select, text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.blog import Blog
from app.db.models.case_study import CaseStudy
from app.db.session import create_database, dispose_database
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run
from tests.test_featured_content import RESOURCES

pytestmark = pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL",
)


@asynccontextmanager
async def isolated_database():
    """Clone the actual migrated tables into a disposable integration schema."""
    settings = Settings()
    assert settings.database_url is not None
    # Bound connection attempts so an unreachable pooler DNS address can be
    # retried without leaving the integration runner waiting indefinitely.
    url = make_url(settings.database_url.get_secret_value()).update_query_dict(
        {"connect_timeout": "10"}
    )
    settings = settings.model_copy(update={
        "database_url": SecretStr(url.render_as_string(hide_password=False)),
    })
    db = create_database(settings)
    schema = "featured_test_" + uuid4().hex
    try:
        async with db.engine.begin() as connection:
            assert await connection.get_isolation_level() == "READ COMMITTED"
            await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
            for table in ["blogs", "case_studies", "audit_logs"]:
                await connection.execute(text(
                    f'CREATE TABLE "{schema}".{table} (LIKE public.{table} INCLUDING ALL)'
                ))
        async with db.engine.begin() as connection:
            legacy = await connection.scalar(text("SELECT count(*) FROM information_schema.columns WHERE table_schema=:schema AND table_name='case_studies' AND column_name='is_featured'"), {"schema": schema})
            if legacy:
                await connection.execute(text(f'ALTER TABLE "{schema}".case_studies RENAME COLUMN is_featured TO featured'))
        engine = db.engine.execution_options(schema_translate_map={None: schema})
        yield db, schema, async_sessionmaker(engine, expire_on_commit=False)
    finally:
        async with db.engine.begin() as connection:
            await connection.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
        await dispose_database(db)


def feature_field(config):
    return "is_featured" if config[7] == "blogs" else "featured"

def request_for(config, *, status="published", featured=True):
    payload = config[6](status=status).model_dump()
    payload.update({"slug": "featured-integration-" + uuid4().hex, feature_field(config): featured})
    # Drafts are allowed to have covers and must have one before publishing.
    payload["cover_image_url"] = "https://example.com/featured.jpg"
    return config[2](**payload)


@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
def test_featured_lifecycle_against_postgresql(config):
    async def exercise():
        async with isolated_database() as (_, _, sessions):
            async with sessions() as session:
                service = config[1](session)
                default = await service.create(config[6]())
                assert getattr(default, feature_field(config)) is False
                hidden = await service.create(request_for(config, status="draft"))
                assert getattr(hidden, feature_field(config)) is True
                for _ in range(5 if config[7] == "blogs" else 4):
                    await service.create(request_for(config))
                with pytest.raises(config[4], match="Maximum of 5 featured"):
                    await service.create(request_for(config))
                # Rollback expires ORM objects; cache identifiers before failures.
                # The default/hidden objects were expired too, so resolve IDs by slug.
                model_type = Blog if config[7] == "blogs" else CaseStudy
                records = list((await session.scalars(select(model_type))).all())
                public_ids = [row.id for row in records if row.status == "published"]
                normal_id = next(row.id for row in records if row.slug == config[6]().slug)
                hidden_id = next(row.id for row in records if getattr(row, feature_field(config)) and row.status == "draft")
                # An unpublished featured item cannot claim a sixth slot.
                if config[7] == "blogs":
                    with pytest.raises(config[4]):
                        await service.update(hidden_id, config[3](status="published"))
                # A published normal item is also rejected at capacity.
                await service.update(normal_id, config[3](status="published", cover_image_url="https://example.com/normal.jpg"))
                with pytest.raises(config[4]):
                    await service.update(normal_id, config[3](**{feature_field(config): True}))
                # Existing slots can be retained and edited at capacity.
                await service.update(public_ids[0], config[3](title="Still featured"))
                await service.update(public_ids[0], config[3](**{feature_field(config): False}))
                promoted = await service.update(normal_id, config[3](**{feature_field(config): True}))
                assert getattr(promoted, feature_field(config)) is True
                await service.update(public_ids[1], config[3](**{"status": "draft", **({"featured": False} if config[7] != "blogs" else {})}))
                published_hidden = await service.update(hidden_id, config[3](status="published"))
                assert published_hidden.status == "published"
                await service.update(public_ids[2], config[3](**{"status": "unpublished", **({"featured": False} if config[7] != "blogs" else {})}))
                replacement = await service.create(request_for(config))
                assert getattr(replacement, feature_field(config)) is True
                # Delete still releases a slot without changing another row.
                await service.delete(public_ids[3])
                await service.create(request_for(config))
                if config[7] != "blogs":
                    await service.create(request_for(config))
                repo = config[0](session)
                assert await repo.count_featured_for_update() == 5
                audits = list((await session.scalars(select(AuditLog))).all())
                assert any(row.context.get(feature_field(config)) is True for row in audits if row.action == "create")
                assert any(feature_field(config) in row.context.get("changed_fields", []) for row in audits if row.action == "update")
    _run(asyncio.wait_for(exercise(), timeout=120))


@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
@pytest.mark.parametrize("operation", ["create", "feature", "publish"])
def test_concurrent_requests_cannot_both_claim_fifth_slot(config, operation):
    async def exercise():
        async with isolated_database() as (db, _, sessions):
            async with sessions() as session:
                service = config[1](session)
                for _ in range(4):
                    await service.create(request_for(config))
                targets = []
                if operation != "create":
                    for _ in range(2):
                        target = await service.create(request_for(
                            config, status="draft" if operation == "publish" else "published",
                            featured=operation == "publish" and config[7] == "blogs",
                        ))
                        targets.append(target.id)
            # Hold the first transaction after persistence, before its commit.
            # Start the second only after the first owns the actual PostgreSQL lock.
            first_staged = asyncio.Event()
            release_first = asyncio.Event()
            second_attempted = asyncio.Event()
            second_staged = asyncio.Event()
            observer = None

            async def claim(index):
                nonlocal observer
                async with sessions() as session:
                    if index == 0:
                        observer = await session.connection()
                    repo = config[0](session)
                    original_add = repo.add
                    original_refresh = repo.refresh
                    original_count = repo.count_featured_for_update
                    async def pause_add(item):
                        await original_add(item)
                        (first_staged if index == 0 else second_staged).set()
                        if index == 0:
                            await release_first.wait()
                    async def pause_refresh(item):
                        await original_refresh(item)
                        (first_staged if index == 0 else second_staged).set()
                        if index == 0:
                            await release_first.wait()
                    async def count(**kwargs):
                        if index == 1:
                            second_attempted.set()
                        return await original_count(**kwargs)
                    repo.count_featured_for_update = count
                    repo.add = pause_add
                    repo.refresh = pause_refresh if operation != "create" else original_refresh
                    service = config[1](session, **{
                        "blog_repository" if config[7] == "blogs" else "case_study_repository": repo,
                    })
                    try:
                        if operation == "create":
                            await service.create(request_for(config))
                        else:
                            await service.update(targets[index], config[3](**(
                                {feature_field(config): True} if operation == "feature" else {"status": "published", **({"featured": True} if config[7] != "blogs" else {})}
                            )))
                        return "allowed"
                    except config[4]:
                        return "rejected"
            first = asyncio.create_task(claim(0))
            second = None
            try:
                await asyncio.wait_for(first_staged.wait(), timeout=30)
                second = asyncio.create_task(claim(1))
                await asyncio.wait_for(second_attempted.wait(), timeout=30)
                # Verify actual database lock contention rather than relying on a sleep.
                async def blocked():
                    # The first service is paused between SQL operations, so its
                    # connection can safely observe the second lock waiter.
                    for _ in range(100):
                        count = (await observer.execute(text(
                            "SELECT count(*) FROM pg_locks WHERE locktype='advisory' "
                            "AND classid=1448693332 AND objid=:key AND NOT granted"
                        ), {"key": config[9]})).scalar_one()
                        if count:
                            return
                        await asyncio.sleep(0.05)
                    raise AssertionError("Second request did not wait for the featured lock")
                await asyncio.wait_for(blocked(), timeout=30)
                assert not second_staged.is_set()
                release_first.set()
                assert await asyncio.wait_for(asyncio.gather(first, second), timeout=30) == ["allowed", "rejected"]
                async with sessions() as session:
                    assert await config[0](session).count_featured_for_update() == 5
            finally:
                release_first.set()
                tasks = [task for task in [first, second] if task is not None]
                for task in tasks:
                    if not task.done(): task.cancel()
                await asyncio.gather(*tasks, return_exceptions=True)
    _run(asyncio.wait_for(exercise(), timeout=120))


def test_migration_backfills_existing_rows_and_keeps_resource_slots_independent():
    async def exercise():
        async with isolated_database() as (db, schema, sessions):
            # Replay the migration on cloned tables containing legacy rows.
            async with db.engine.begin() as connection:
                for table, config in zip(["blogs", "case_studies"], RESOURCES):
                    await connection.execute(text(f'ALTER TABLE "{schema}".{table} DROP COLUMN {feature_field(config)}'))
                    payload = config[6]().model_dump(mode="json", exclude={"is_featured", "featured"})
                    names = list(payload)
                    values = ["CAST(:content AS jsonb)" if name == "content" else ":"+name for name in names]
                    payload["content"] = json.dumps(payload["content"])
                    await connection.execute(text(
                        f'INSERT INTO "{schema}".{table} ({", ".join(names)}) VALUES ({", ".join(values)})'
                    ), payload)
                sql = (Path(__file__).resolve().parents[3] / "supabase/migrations/20261005120000_add_content_featured_state.sql").read_text().replace("public.", f'"{schema}".')
                for statement in sql.split(";"):
                    if statement.strip(): await connection.execute(text(statement))
                for table in ["blogs", "case_studies"]:
                    assert (await connection.execute(text(f'SELECT is_featured FROM "{schema}".{table}'))).scalar_one() is False
                    properties = (await connection.execute(text(
                        "SELECT is_nullable,column_default FROM information_schema.columns "
                        "WHERE table_schema=:schema AND table_name=:table AND column_name='is_featured'"
                    ), {"schema":schema, "table":table})).one()
                    assert properties == ("NO", "false")
                await connection.execute(text(f'ALTER TABLE "{schema}".case_studies RENAME COLUMN is_featured TO featured'))
            async with sessions() as session:
                for config in RESOURCES:
                    service = config[1](session)
                    for _ in range(5):
                        await service.create(request_for(config))
                for config in RESOURCES:
                    assert await config[0](session).count_featured_for_update() == 5
    _run(asyncio.wait_for(exercise(), timeout=120))
