"""YouTube JSONB round trips using existing PostgreSQL integration helpers."""

import asyncio
from copy import deepcopy
from uuid import uuid4

import pytest
from sqlalchemy import select

from app.db.models.audit_log import AuditLog
from app.db.models.blog import Blog
from app.db.models.case_study import CaseStudy
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS, _run
from tests.test_featured_content import RESOURCES
from tests.test_featured_content_integration import isolated_database
from tests.test_youtube_content import CANONICAL_VIDEO, EXISTING, ID, OTHER_ID, document, video


@pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL",
)
@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
def test_youtube_content_round_trip_against_postgresql(config):
    async def exercise():
        async with isolated_database() as (_, _, sessions):
            async with sessions() as session:
                service = config[1](session)
                payload = config[6](status="published").model_dump()
                mixed = deepcopy(EXISTING)
                mixed["content"].insert(2, video(url=f"https://youtu.be/{ID}?t=30"))
                expected = deepcopy(EXISTING)
                expected["content"].insert(2, CANONICAL_VIDEO)
                payload.update(content=mixed, slug="youtube-test-"+uuid4().hex)
                created = await service.create(config[2](**payload))
                record_id, slug = created.id, created.slug
                assert created.content == expected
                # Force a database load instead of an identity-map assertion.
                session.expunge_all()
                loaded = await service.get_by_id(record_id)
                assert loaded.content == expected
                assert (await service.get_published_by_slug(slug)).content == expected
                assert next(item for item in await service.list_all() if item.id == record_id).content == expected
                assert next(item for item in await service.list_published() if item.id == record_id).content == expected
                for supplied, normalized in [
                    (document(video(url=f"https://youtube.com/embed/{OTHER_ID}")), document(video(video_id=OTHER_ID))),
                    (EXISTING, EXISTING),
                    (document(video(video_id=ID)), document(CANONICAL_VIDEO)),
                ]:
                    await service.update(record_id, config[3](content=supplied))
                    session.expunge_all()
                    assert (await service.get_by_id(record_id)).content == normalized
                audits = list((await session.scalars(select(AuditLog).where(AuditLog.resource_id == record_id))).all())
                assert [item.action for item in audits].count("create") == 1
                updates = [item for item in audits if item.action == "update"]
                assert len(updates) == 3
                assert all(item.context["changed_fields"] == ["content"] for item in updates)
                assert all("content" not in item.context and ID not in str(item.context) for item in audits)
                model_type = Blog if config[7] == "blogs" else CaseStudy
                column = model_type.__table__.c.content
                assert column.type.__class__.__name__ == "JSONB"
    _run(asyncio.wait_for(exercise(), timeout=120))
