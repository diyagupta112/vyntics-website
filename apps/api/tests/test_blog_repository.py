"""Unit tests for Blog data access."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.blog import Blog
from app.repositories.blogs import BlogRepository


BLOG_ID = UUID("5326b73c-022f-4cc7-8291-8904d3ef01fc")


def test_list_published_filters_and_orders_by_published_at_desc() -> None:
    blog = SimpleNamespace(slug="published-blog")
    result = MagicMock()
    result.all.return_value = [blog]
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = result
    repository = BlogRepository(session)

    blogs = asyncio.run(repository.list_published())

    statement = session.scalars.await_args.args[0]
    sql = str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )
    assert blogs == [blog]
    assert "WHERE blogs.status = 'published'" in sql
    assert "ORDER BY blogs.published_at DESC" in sql


def test_get_published_by_slug_filters_status() -> None:
    blog = SimpleNamespace(slug="published-blog")
    session = AsyncMock(spec=AsyncSession)
    session.scalar.return_value = blog
    repository = BlogRepository(session)

    result = asyncio.run(repository.get_published_by_slug("published-blog"))

    statement = session.scalar.await_args.args[0]
    sql = str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )
    assert result is blog
    assert "blogs.slug = 'published-blog'" in sql
    assert "blogs.status = 'published'" in sql


def test_list_all_does_not_apply_public_status_filter() -> None:
    blogs = [
        SimpleNamespace(status="draft"),
        SimpleNamespace(status="published"),
        SimpleNamespace(status="unpublished"),
    ]
    result = MagicMock()
    result.all.return_value = blogs
    session = AsyncMock(spec=AsyncSession)
    session.scalars.return_value = result
    repository = BlogRepository(session)

    returned = asyncio.run(repository.list_all())

    statement = session.scalars.await_args.args[0]
    sql = str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )
    assert returned == blogs
    assert "FROM blogs" in sql
    assert "WHERE" not in sql


def test_slug_exists_can_exclude_current_blog() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.scalar.return_value = BLOG_ID
    repository = BlogRepository(session)

    exists = asyncio.run(
        repository.slug_exists("new-slug", exclude_id=BLOG_ID)
    )

    statement = session.scalar.await_args.args[0]
    sql = str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )
    assert exists is True
    assert "blogs.id !=" in sql


def test_repository_stages_changes_without_committing() -> None:
    session = AsyncMock(spec=AsyncSession)
    repository = BlogRepository(session)
    blog = Blog(
        slug="repository-blog",
        title="Repository Blog",
        seo_title="Repository Blog | Vyntics",
        meta_description="Repository test.",
        author="Vyntics",
        category="Engineering",
        excerpt="Repository test.",
        cover_image_url=None,
        read_time=2,
        content={},
        status="draft",
    )

    asyncio.run(repository.add(blog))
    asyncio.run(repository.refresh(blog))
    asyncio.run(repository.delete(blog))

    session.add.assert_called_once_with(blog)
    assert session.flush.await_count == 2
    session.refresh.assert_awaited_once_with(blog)
    session.delete.assert_awaited_once_with(blog)
    session.commit.assert_not_awaited()
