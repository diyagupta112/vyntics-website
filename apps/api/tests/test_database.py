"""Tests for SQLAlchemy configuration and lifecycle."""

import asyncio

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.core.config import Environment, Settings
from app.db.engine import DatabaseConfigurationError, get_database_url
from app.db.session import create_database
from app.main import create_app


def test_database_url_uses_async_psycopg_and_masks_password() -> None:
    settings = Settings(
        _env_file=None,
        environment=Environment.TEST,
        database_url="postgresql://example:secret@localhost:5432/vyntics",
    )

    url = get_database_url(settings)

    assert url.drivername == "postgresql+psycopg"
    assert url.database == "vyntics"
    assert "secret" not in str(url)


def test_database_url_is_required_when_database_is_created() -> None:
    settings = Settings(_env_file=None, environment=Environment.TEST)

    with pytest.raises(DatabaseConfigurationError, match="DATABASE_URL"):
        create_database(settings)


def test_non_postgresql_database_url_is_rejected() -> None:
    settings = Settings(
        _env_file=None,
        environment=Environment.TEST,
        database_url="sqlite:///test.db",
    )

    with pytest.raises(DatabaseConfigurationError, match="PostgreSQL"):
        get_database_url(settings)


def test_database_factory_creates_engine_and_session_without_connecting() -> None:
    settings = Settings(
        _env_file=None,
        environment=Environment.TEST,
        database_url="postgresql://example:secret@localhost:5432/vyntics",
    )

    database = create_database(settings)
    session = database.session_factory()

    assert isinstance(database.engine, AsyncEngine)
    assert isinstance(session, AsyncSession)
    assert session.bind is database.engine

    asyncio.run(session.close())
    asyncio.run(database.engine.dispose())


def test_app_starts_without_database_credentials() -> None:
    settings = Settings(_env_file=None, environment=Environment.TEST)
    application = create_app(settings)

    with TestClient(application) as client:
        response = client.get("/health")

        assert response.status_code == 200
        assert application.state.database is None


def test_app_initializes_database_resources_without_connecting() -> None:
    settings = Settings(
        _env_file=None,
        environment=Environment.TEST,
        database_url="postgresql://example:secret@localhost:5432/vyntics",
    )
    application = create_app(settings)

    with TestClient(application):
        assert application.state.database is not None
        assert isinstance(application.state.database.engine, AsyncEngine)
