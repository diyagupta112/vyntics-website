"""Blog database queries and persistence operations."""

from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.blog import Blog


class BlogRepository:
    """Data-access operations for Blogs without transaction commits."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_published(self) -> list[Blog]:
        """Return published Blogs ordered newest-first."""

        statement = (
            select(Blog)
            .where(Blog.status == "published")
            .order_by(Blog.published_at.desc())
        )
        result = await self._session.scalars(statement)
        return list(result.all())

    async def list_all(self) -> list[Blog]:
        """Return Blogs in every publication status for administration."""

        result = await self._session.scalars(select(Blog))
        return list(result.all())

    async def get_published_by_slug(self, slug: str) -> Blog | None:
        """Return one published Blog by slug."""

        statement = select(Blog).where(
            Blog.slug == slug,
            Blog.status == "published",
        )
        return await self._session.scalar(statement)

    async def get_by_id(self, blog_id: UUID) -> Blog | None:
        """Return one Blog by its database identifier."""

        return await self._session.get(Blog, blog_id)

    async def slug_exists(
        self,
        slug: str,
        *,
        exclude_id: UUID | None = None,
    ) -> bool:
        """Check whether a slug belongs to another Blog."""

        statement = select(Blog.id).where(Blog.slug == slug)
        if exclude_id is not None:
            statement = statement.where(Blog.id != exclude_id)
        return await self._session.scalar(statement) is not None

    async def count_featured_for_update(self, *, exclude_id: UUID | None = None) -> int:
        """Serialize slot claims until transaction end, then count public features.

        PostgreSQL READ COMMITTED takes a fresh snapshot for the count after
        the lock statement. Distinct keys keep Blog and Case Study slots separate.
        Call before staging mutations; the service owns commit/rollback.
        """

        await self._session.execute(
            text("SELECT pg_advisory_xact_lock(1448693332, 1)")
        )
        statement = select(func.count()).select_from(Blog).where(
            Blog.status == "published", Blog.is_featured.is_(True),
        )
        if exclude_id is not None:
            statement = statement.where(Blog.id != exclude_id)
        return await self._session.scalar(statement)

    async def add(self, blog: Blog) -> None:
        """Stage a Blog and flush database-generated fields."""

        self._session.add(blog)
        await self._session.flush()

    async def delete(self, blog: Blog) -> None:
        """Stage a hard delete for a Blog."""

        await self._session.delete(blog)

    async def refresh(self, blog: Blog) -> None:
        """Flush changes and reload database-managed fields."""

        await self._session.flush()
        await self._session.refresh(blog)
