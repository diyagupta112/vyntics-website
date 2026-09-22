"""SQLAlchemy engine construction."""

from sqlalchemy.engine import URL, make_url
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.core.config import Settings

SUPPORTED_POSTGRES_DRIVERS = {
    "postgres",
    "postgresql",
    "postgresql+psycopg",
    "postgresql+psycopg_async",
}


class DatabaseConfigurationError(RuntimeError):
    """Raised when database configuration is missing or invalid."""


def get_database_url(settings: Settings) -> URL:
    """Return a Psycopg-qualified SQLAlchemy URL without opening a connection."""
    if settings.database_url is None:
        raise DatabaseConfigurationError("DATABASE_URL is not configured.")

    url = make_url(settings.database_url.get_secret_value())
    if url.drivername not in SUPPORTED_POSTGRES_DRIVERS:
        raise DatabaseConfigurationError(
            "DATABASE_URL must use a PostgreSQL connection URL."
        )

    return url.set(drivername="postgresql+psycopg")


def create_database_engine(settings: Settings) -> AsyncEngine:
    """Create the application's asynchronous SQLAlchemy engine."""
    return create_async_engine(
        get_database_url(settings),
        pool_pre_ping=True,
    )

