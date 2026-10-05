"""Blog application logic and transaction boundaries."""

import logging
from collections.abc import Callable
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile

from app.auth.models import AuthenticatedAdmin
from app.db.models.audit_log import AuditLog
from app.db.models.blog import Blog
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.blogs import BlogRepository
from app.schemas.blogs import BlogCreateRequest, BlogUpdateRequest
from app.storage.supabase import StorageConfigurationError, StorageError
from app.storage.uploads import PublicImageStorage


logger = logging.getLogger(__name__)


class BlogNotFoundError(LookupError):
    """Raised when a requested Blog does not exist in the required scope."""


class BlogSlugConflictError(ValueError):
    """Raised when a Blog slug is already in use."""


class BlogValidationError(ValueError):
    """Raised when state-dependent Blog validation fails."""


class BlogService:
    """Coordinate Blog rules, persistence, auditing, and transactions."""

    def __init__(
        self,
        session: AsyncSession,
        *,
        blog_repository: BlogRepository | None = None,
        audit_repository: AuditLogRepository | None = None,
        clock: Callable[[], datetime] | None = None,
        image_storage: PublicImageStorage | None = None,
    ) -> None:
        self._session = session
        self._blogs = blog_repository or BlogRepository(session)
        self._audit_logs = audit_repository or AuditLogRepository(session)
        self._clock = clock or (lambda: datetime.now(timezone.utc))
        self._image_storage = image_storage

    async def list_published(self) -> list[Blog]:
        """Return Blogs eligible for the public listing."""

        return await self._blogs.list_published()

    async def list_all(self) -> list[Blog]:
        """Return all Blogs for future authenticated administration."""

        return await self._blogs.list_all()

    async def get_by_id(self, blog_id: UUID) -> Blog:
        """Return one Blog by UUID regardless of publication status."""

        blog = await self._blogs.get_by_id(blog_id)
        if blog is None:
            raise BlogNotFoundError
        return blog

    async def get_published_by_slug(self, slug: str) -> Blog:
        """Return a published Blog or raise the public not-found error."""

        blog = await self._blogs.get_published_by_slug(slug)
        if blog is None:
            raise BlogNotFoundError
        return blog

    async def create(
        self,
        request: BlogCreateRequest,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> Blog:
        """Create and audit a Blog in one transaction."""

        if await self._blogs.slug_exists(request.slug):
            raise BlogSlugConflictError

        values = request.model_dump(mode="json")
        published_at = self._clock() if request.status == "published" else None
        blog = Blog(**values, published_at=published_at)

        try:
            if request.status == "published" and request.is_featured:
                await self._validate_featured_capacity()
            await self._blogs.add(blog)
            await self._audit_logs.add(
                self._build_audit_log(
                    action="create",
                    blog=blog,
                    context={
                        "slug": blog.slug,
                        "status": blog.status,
                        "is_featured": blog.is_featured,
                    },
                    actor=actor,
                )
            )
            await self._blogs.refresh(blog)
            await self._session.commit()
        except IntegrityError as error:
            await self._session.rollback()
            raise BlogSlugConflictError from error
        except Exception:
            await self._session.rollback()
            raise

        return blog

    async def update(
        self,
        blog_id: UUID,
        request: BlogUpdateRequest,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> Blog:
        """Update permitted Blog fields and apply publication transitions."""

        blog = await self._blogs.get_by_id(blog_id)
        if blog is None:
            raise BlogNotFoundError
        previous_cover_url = blog.cover_image_url

        updates = request.model_dump(exclude_unset=True, mode="json")
        next_slug = updates.get("slug", blog.slug)
        if next_slug != blog.slug and await self._blogs.slug_exists(
            next_slug,
            exclude_id=blog.id,
        ):
            raise BlogSlugConflictError

        next_status = updates.get("status", blog.status)
        next_cover_image_url = updates.get("cover_image_url", blog.cover_image_url)
        if next_status == "published" and next_cover_image_url is None:
            raise BlogValidationError(
                "cover_image_url is required for published Blogs"
            )

        if (
            next_status == "published"
            and updates.get("is_featured", blog.is_featured)
            and not (blog.status == "published" and blog.is_featured)
        ):
            try:
                await self._validate_featured_capacity(exclude_id=blog.id)
            except Exception:
                await self._session.rollback()
                raise

        changed_fields: list[str] = []
        for field_name, value in updates.items():
            if getattr(blog, field_name) != value:
                setattr(blog, field_name, value)
                changed_fields.append(field_name)

        if blog.status == "published" and blog.published_at is None:
            blog.published_at = self._clock()
            changed_fields.append("published_at")
        elif next_status != "published" and blog.published_at is not None:
            blog.published_at = None
            changed_fields.append("published_at")

        if not changed_fields:
            return blog

        try:
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    blog=blog,
                    context={
                        "slug": blog.slug,
                        "status": blog.status,
                        "changed_fields": sorted(set(changed_fields)),
                    },
                    actor=actor,
                )
            )
            await self._blogs.refresh(blog)
            await self._session.commit()
        except IntegrityError as error:
            await self._session.rollback()
            raise BlogSlugConflictError from error
        except Exception:
            await self._session.rollback()
            raise

        if "cover_image_url" in changed_fields and self._image_storage is not None:
            await self._cleanup_previous_cover(
                self._image_storage,
                previous_cover_url,
                blog.id,
            )
        return blog

    async def delete(
        self,
        blog_id: UUID,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> None:
        """Hard-delete a Blog and preserve an audit event."""

        blog = await self._blogs.get_by_id(blog_id)
        if blog is None:
            raise BlogNotFoundError

        audit_log = self._build_audit_log(
            action="delete",
            blog=blog,
            context={"slug": blog.slug, "status": blog.status},
            actor=actor,
        )
        previous_cover_url = blog.cover_image_url

        try:
            await self._blogs.delete(blog)
            await self._audit_logs.add(audit_log)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

        if self._image_storage is not None:
            await self._cleanup_previous_cover(
                self._image_storage,
                previous_cover_url,
                blog.id,
            )

    async def upload_cover(
        self,
        blog_id: UUID,
        upload: UploadFile,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> Blog:
        """Replace a Blog cover with a validated backend-managed object."""

        blog = await self.get_by_id(blog_id)
        storage = self._require_image_storage()
        previous_url = blog.cover_image_url
        stored = await storage.upload(blog.id, upload)
        blog.cover_image_url = stored.public_url
        try:
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    blog=blog,
                    context={
                        "slug": blog.slug,
                        "status": blog.status,
                        "changed_fields": ["cover_image_url"],
                    },
                    actor=actor,
                )
            )
            await self._blogs.refresh(blog)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            try:
                await storage.delete_path(stored.object_path)
            except StorageError:
                logger.warning(
                    "Could not remove an unreferenced Blog cover after rollback.",
                    extra={"resource_type": "blog", "resource_id": str(blog.id)},
                )
            raise
        await self._cleanup_previous_cover(storage, previous_url, blog.id)
        return blog

    async def delete_cover(
        self,
        blog_id: UUID,
        *,
        actor: AuthenticatedAdmin | None = None,
    ) -> None:
        """Clear and clean up a draft or unpublished Blog cover."""

        blog = await self.get_by_id(blog_id)
        if blog.status == "published":
            raise BlogValidationError(
                "Published Blogs must be changed to draft or unpublished before deleting their cover."
            )
        previous_url = blog.cover_image_url
        if previous_url is None:
            return
        storage = self._require_image_storage()
        blog.cover_image_url = None
        try:
            await self._audit_logs.add(
                self._build_audit_log(
                    action="update",
                    blog=blog,
                    context={
                        "slug": blog.slug,
                        "status": blog.status,
                        "changed_fields": ["cover_image_url"],
                    },
                    actor=actor,
                )
            )
            await self._blogs.refresh(blog)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        await self._cleanup_previous_cover(storage, previous_url, blog.id)

    async def _validate_featured_capacity(self, *, exclude_id: UUID | None = None) -> None:
        if await self._blogs.count_featured_for_update(exclude_id=exclude_id) >= 5:
            raise BlogValidationError("Maximum of 5 featured blogs allowed.")

    def _require_image_storage(self) -> PublicImageStorage:
        if self._image_storage is None:
            raise StorageConfigurationError("Storage is not configured.")
        return self._image_storage

    @staticmethod
    async def _cleanup_previous_cover(
        storage: PublicImageStorage,
        previous_url: str | None,
        blog_id: UUID,
    ) -> None:
        if previous_url is None:
            return
        try:
            await storage.delete_managed_url(str(previous_url), blog_id)
        except StorageError:
            logger.warning(
                "Could not clean up a previous Blog cover.",
                extra={"resource_type": "blog", "resource_id": str(blog_id)},
            )

    @staticmethod
    def _build_audit_log(
        *,
        action: str,
        blog: Blog,
        context: dict[str, object],
        actor: AuthenticatedAdmin | None = None,
    ) -> AuditLog:
        """Build the approved non-sensitive Blog audit record."""

        return AuditLog(
            actor_id=actor.admin_id if actor is not None else None,
            actor_email=actor.admin_email if actor is not None else None,
            action=action,
            resource_type="blog",
            resource_id=blog.id,
            context=context,
        )
