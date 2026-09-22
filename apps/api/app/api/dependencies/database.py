"""FastAPI dependency for request-scoped database sessions."""

from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.engine import DatabaseConfigurationError
from app.db.session import Database


async def get_db_session(request: Request) -> AsyncIterator[AsyncSession]:
    """Yield one SQLAlchemy session for the current request task."""
    database: Database | None = getattr(request.app.state, "database", None)
    if database is None:
        raise DatabaseConfigurationError("Database resources are unavailable.")

    async with database.session_factory() as session:
        try:
            yield session
        except BaseException:
            await session.rollback()
            raise


DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]

