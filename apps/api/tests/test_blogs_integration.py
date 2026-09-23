"""Opt-in Blog integration tests against configured PostgreSQL/Supabase."""

import asyncio
import os
import sys
from uuid import uuid4

import pytest
from sqlalchemy import delete, select

from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.blog import Blog
from app.db.session import create_database, dispose_database
from app.schemas.blogs import BlogCreateRequest, BlogUpdateRequest
from app.services.blogs import BlogNotFoundError, BlogService


RUN_DATABASE_INTEGRATION_TESTS = (
    os.getenv("RUN_DATABASE_INTEGRATION_TESTS", "").lower() in {"1", "true", "yes"}
)


def _run(coroutine) -> None:
    if sys.platform == "win32":
        with asyncio.Runner(loop_factory=asyncio.SelectorEventLoop) as runner:
            runner.run(coroutine)
    else:
        asyncio.run(coroutine)


@pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use the configured database",
)
def test_blog_lifecycle_against_configured_postgresql() -> None:
    async def exercise() -> None:
        settings = Settings()
        assert settings.database_url is not None, "DATABASE_URL is not configured"
        database = create_database(settings)
        run_id = uuid4()
        blog_ids = []

        try:
            async with database.session_factory() as session:
                service = BlogService(session)
                created_by_status = {}
                for blog_status in ("draft", "published", "unpublished"):
                    created = await service.create(
                        BlogCreateRequest(
                            slug=f"phase-6-integration-{blog_status}-{run_id}",
                            title=f"Phase 6 {blog_status.title()} Integration Blog",
                            seo_title=(
                                f"Phase 6 {blog_status.title()} Integration Blog"
                                " | Vyntics"
                            ),
                            meta_description="Temporary integration verification.",
                            author="Vyntics",
                            category="Engineering",
                            excerpt="Temporary integration verification.",
                            cover_image_url=(
                                "https://example.com/integration.jpg"
                                if blog_status == "published"
                                else None
                            ),
                            read_time=3,
                            content={"type": "doc", "content": []},
                            status=blog_status,
                        )
                    )
                    blog_ids.append(created.id)
                    created_by_status[blog_status] = created

                published = created_by_status["published"]
                assert published.published_at is not None

                admin_list = await service.list_all()
                admin_ids = {item.id for item in admin_list}
                assert set(blog_ids).issubset(admin_ids)
                for blog_status, created in created_by_status.items():
                    detail = await service.get_by_id(created.id)
                    assert detail.status == blog_status

                public_list = await service.list_published()
                public_ids = {item.id for item in public_list}
                assert published.id in public_ids
                assert created_by_status["draft"].id not in public_ids
                assert created_by_status["unpublished"].id not in public_ids
                detail = await service.get_published_by_slug(published.slug)
                assert detail.id == published.id
                for hidden_status in ("draft", "unpublished"):
                    with pytest.raises(BlogNotFoundError):
                        await service.get_published_by_slug(
                            created_by_status[hidden_status].slug
                        )

                updated = await service.update(
                    published.id,
                    BlogUpdateRequest(status="unpublished"),
                )
                assert updated.published_at is None

                for blog_id in blog_ids:
                    await service.delete(blog_id)
                    assert await session.get(Blog, blog_id) is None

                actions = set(
                    (
                        await session.scalars(
                            select(AuditLog.action).where(
                                AuditLog.resource_id == published.id
                            )
                        )
                    ).all()
                )
                assert actions == {"create", "update", "delete"}
        finally:
            if blog_ids:
                async with database.session_factory() as cleanup_session:
                    await cleanup_session.execute(
                        delete(AuditLog).where(AuditLog.resource_id.in_(blog_ids))
                    )
                    await cleanup_session.execute(
                        delete(Blog).where(Blog.id.in_(blog_ids))
                    )
                    await cleanup_session.commit()
            await dispose_database(database)

    _run(exercise())
