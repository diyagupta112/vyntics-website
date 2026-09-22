"""Database engine and session-factory lifecycle."""

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
)

from app.core.config import Settings
from app.db.engine import create_database_engine


@dataclass(frozen=True, slots=True)
class Database:
    """Process-level database resources."""

    engine: AsyncEngine
    session_factory: async_sessionmaker[AsyncSession]


def create_database(settings: Settings) -> Database:
    """Create an engine and reusable factory for request-scoped sessions."""
    engine = create_database_engine(settings)
    session_factory = async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
    )
    return Database(engine=engine, session_factory=session_factory)


async def dispose_database(database: Database) -> None:
    """Release all pooled database connections."""
    await database.engine.dispose()

