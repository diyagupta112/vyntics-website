"""Unit tests for Blog business rules and transaction ownership."""

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import AuthenticatedAdmin
from app.db.models.blog import Blog
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.blogs import BlogRepository
from app.schemas.blogs import BlogCreateRequest, BlogUpdateRequest
from app.services.blogs import (
    BlogNotFoundError,
    BlogService,
    BlogSlugConflictError,
    BlogValidationError,
)
from app.storage.uploads import PublicImageStorage, StoredPublicObject


BLOG_ID = UUID("5326b73c-022f-4cc7-8291-8904d3ef01fc")
NOW = datetime(2026, 9, 23, 12, 0, tzinfo=timezone.utc)
ADMIN_ID = UUID("11111111-1111-4111-8111-111111111111")
AUTH_USER_ID = UUID("22222222-2222-4222-8222-222222222222")


def _blog(*, status: str = "draft", published_at: datetime | None = None) -> Blog:
    return Blog(
        id=BLOG_ID,
        slug="phase-6-blog",
        title="Phase 6 Blog",
        seo_title="Phase 6 Blog | Vyntics",
        meta_description="Service test.",
        author="Vyntics",
        category="Engineering",
        excerpt="Service test.",
        cover_image_url="https://example.com/cover.jpg",
        read_time=5,
        content={"type": "doc"},
        status=status,
        is_featured=False,
        published_at=published_at,
        created_at=NOW,
        updated_at=NOW,
    )


def _create_request(*, status: str = "draft") -> BlogCreateRequest:
    return BlogCreateRequest(
        slug="phase-6-blog",
        title="Phase 6 Blog",
        seo_title="Phase 6 Blog | Vyntics",
        meta_description="Service test.",
        author="Vyntics",
        category="Engineering",
        excerpt="Service test.",
        cover_image_url=(
            "https://example.com/cover.jpg" if status == "published" else None
        ),
        read_time=5,
        content={"type": "doc"},
        status=status,
        is_featured=False,
    )


def _service(
    blog_repository: BlogRepository,
    audit_repository: AuditLogRepository,
    image_storage: PublicImageStorage | None = None,
):
    session = AsyncMock(spec=AsyncSession)
    service = BlogService(
        session,
        blog_repository=blog_repository,
        audit_repository=audit_repository,
        clock=lambda: NOW,
        image_storage=image_storage,
    )
    return service, session


def test_cover_replacement_commits_then_cleans_previous_managed_object() -> None:
    blog = _blog()
    blogs = AsyncMock(spec=BlogRepository)
    blogs.get_by_id.return_value = blog
    audits = AsyncMock(spec=AuditLogRepository)
    storage = AsyncMock(spec=PublicImageStorage)
    storage.upload.return_value = StoredPublicObject(
        "https://project/storage/v1/object/public/blog-covers/id/new.jpg",
        f"{BLOG_ID}/new.jpg",
    )
    service, session = _service(blogs, audits, storage)

    actor = AuthenticatedAdmin(
        supabase_user_id=AUTH_USER_ID,
        supabase_email="admin@vyntics.com",
        admin_id=ADMIN_ID,
        admin_auth_user_id=AUTH_USER_ID,
        admin_email="admin@vyntics.com",
        role="admin",
        is_active=True,
        created_at=NOW,
        updated_at=NOW,
    )
    updated = asyncio.run(service.upload_cover(BLOG_ID, AsyncMock(), actor=actor))

    assert updated.cover_image_url.endswith("/new.jpg")
    session.commit.assert_awaited_once_with()
    storage.delete_managed_url.assert_awaited_once_with(
        "https://example.com/cover.jpg", BLOG_ID
    )
    audit = audits.add.await_args.args[0]
    assert audit.actor_id == ADMIN_ID
    assert audit.actor_email == "admin@vyntics.com"
    assert audit.context["changed_fields"] == ["cover_image_url"]
    assert "new.jpg" not in str(audit.context)


def test_cover_upload_persistence_failure_deletes_new_object() -> None:
    blog = _blog()
    blogs = AsyncMock(spec=BlogRepository)
    blogs.get_by_id.return_value = blog
    audits = AsyncMock(spec=AuditLogRepository)
    storage = AsyncMock(spec=PublicImageStorage)
    storage.upload.return_value = StoredPublicObject(
        "https://project/storage/v1/object/public/blog-covers/id/new.jpg",
        f"{BLOG_ID}/new.jpg",
    )
    service, session = _service(blogs, audits, storage)
    session.commit.side_effect = RuntimeError("database failure")

    with pytest.raises(RuntimeError, match="database failure"):
        asyncio.run(service.upload_cover(BLOG_ID, AsyncMock()))

    session.rollback.assert_awaited_once_with()
    storage.delete_path.assert_awaited_once_with(f"{BLOG_ID}/new.jpg")
    storage.delete_managed_url.assert_not_awaited()


def test_published_blog_cover_cannot_be_deleted() -> None:
    blog = _blog(status="published", published_at=NOW)
    blogs = AsyncMock(spec=BlogRepository)
    blogs.get_by_id.return_value = blog
    storage = AsyncMock(spec=PublicImageStorage)
    service, session = _service(blogs, AsyncMock(spec=AuditLogRepository), storage)

    with pytest.raises(BlogValidationError, match="draft or unpublished"):
        asyncio.run(service.delete_cover(BLOG_ID))

    session.commit.assert_not_awaited()
    storage.delete_managed_url.assert_not_awaited()


def test_create_published_blog_sets_timestamp_and_audits() -> None:
    blogs = AsyncMock(spec=BlogRepository)
    blogs.slug_exists.return_value = False
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(blogs, audits)

    created = asyncio.run(service.create(_create_request(status="published")))

    assert created.published_at == NOW
    blogs.add.assert_awaited_once_with(created)
    audit = audits.add.await_args.args[0]
    assert audit.action == "create"
    assert audit.resource_type == "blog"
    assert audit.actor_id is None
    assert audit.context == {"slug": created.slug, "status": "published", "is_featured": False}
    assert "content" not in audit.context
    session.commit.assert_awaited_once_with()


def test_admin_reads_include_all_statuses_without_transactions() -> None:
    expected = [
        _blog(status="draft"),
        _blog(status="published", published_at=NOW),
        _blog(status="unpublished"),
    ]
    blogs = AsyncMock(spec=BlogRepository)
    blogs.list_all.return_value = expected
    blogs.get_by_id.side_effect = expected
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(blogs, audits)

    returned = asyncio.run(service.list_all())
    by_id = [asyncio.run(service.get_by_id(BLOG_ID)) for _ in expected]

    assert returned == expected
    assert [blog.status for blog in by_id] == [
        "draft",
        "published",
        "unpublished",
    ]
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()


def test_admin_get_by_id_returns_not_found() -> None:
    blogs = AsyncMock(spec=BlogRepository)
    blogs.get_by_id.return_value = None
    audits = AsyncMock(spec=AuditLogRepository)
    service, _ = _service(blogs, audits)

    with pytest.raises(BlogNotFoundError):
        asyncio.run(service.get_by_id(BLOG_ID))


def test_create_rejects_duplicate_slug_without_transaction() -> None:
    blogs = AsyncMock(spec=BlogRepository)
    blogs.slug_exists.return_value = True
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(blogs, audits)

    with pytest.raises(BlogSlugConflictError):
        asyncio.run(service.create(_create_request()))

    blogs.add.assert_not_awaited()
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()


def test_update_enters_published_state_and_preserves_timestamp() -> None:
    blog = _blog()
    blogs = AsyncMock(spec=BlogRepository)
    blogs.get_by_id.return_value = blog
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(blogs, audits)

    updated = asyncio.run(
        service.update(BLOG_ID, BlogUpdateRequest(status="published"))
    )

    assert updated.status == "published"
    assert updated.published_at == NOW
    audit = audits.add.await_args.args[0]
    assert audit.action == "update"
    assert audit.context["changed_fields"] == ["published_at", "status"]
    assert "content" not in audit.context
    session.commit.assert_awaited_once_with()

    later = datetime(2026, 9, 24, tzinfo=timezone.utc)
    second_service = BlogService(
        session,
        blog_repository=blogs,
        audit_repository=audits,
        clock=lambda: later,
    )
    asyncio.run(
        second_service.update(BLOG_ID, BlogUpdateRequest(title="Updated title"))
    )
    assert updated.published_at == NOW


@pytest.mark.parametrize("status", ["draft", "unpublished"])
def test_update_leaving_published_state_clears_timestamp(status: str) -> None:
    blog = _blog(status="published", published_at=NOW)
    blogs = AsyncMock(spec=BlogRepository)
    blogs.get_by_id.return_value = blog
    audits = AsyncMock(spec=AuditLogRepository)
    service, _ = _service(blogs, audits)

    updated = asyncio.run(
        service.update(BLOG_ID, BlogUpdateRequest(status=status))
    )

    assert updated.status == status
    assert updated.published_at is None


def test_update_enforces_cover_and_slug_rules() -> None:
    blog = _blog(status="published", published_at=NOW)
    blogs = AsyncMock(spec=BlogRepository)
    blogs.get_by_id.return_value = blog
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(blogs, audits)

    with pytest.raises(BlogValidationError, match="cover_image_url"):
        asyncio.run(
            service.update(BLOG_ID, BlogUpdateRequest(cover_image_url=None))
        )

    blogs.slug_exists.return_value = True
    with pytest.raises(BlogSlugConflictError):
        asyncio.run(
            service.update(BLOG_ID, BlogUpdateRequest(slug="duplicate"))
        )

    session.commit.assert_not_awaited()


def test_update_and_delete_return_not_found() -> None:
    blogs = AsyncMock(spec=BlogRepository)
    blogs.get_by_id.return_value = None
    audits = AsyncMock(spec=AuditLogRepository)
    service, _ = _service(blogs, audits)

    with pytest.raises(BlogNotFoundError):
        asyncio.run(service.update(BLOG_ID, BlogUpdateRequest(title="Missing")))
    with pytest.raises(BlogNotFoundError):
        asyncio.run(service.delete(BLOG_ID))


def test_delete_hard_deletes_and_audits_in_one_transaction() -> None:
    blog = _blog(status="published", published_at=NOW)
    blogs = AsyncMock(spec=BlogRepository)
    blogs.get_by_id.return_value = blog
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(blogs, audits)

    asyncio.run(service.delete(BLOG_ID))

    blogs.delete.assert_awaited_once_with(blog)
    audit = audits.add.await_args.args[0]
    assert audit.action == "delete"
    assert audit.resource_id == BLOG_ID
    assert audit.context == {"slug": blog.slug, "status": "published"}
    session.commit.assert_awaited_once_with()
