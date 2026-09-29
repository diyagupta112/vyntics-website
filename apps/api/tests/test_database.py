"""Tests for SQLAlchemy configuration and lifecycle."""

import asyncio
from contextlib import asynccontextmanager
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import AsyncAdaptedQueuePool
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.api.dependencies.database import get_db_session
from app.core.config import Environment, Settings
from app.db.connectivity import verify_database_connection
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
    assert isinstance(database.engine.sync_engine.pool, AsyncAdaptedQueuePool)
    assert database.engine.sync_engine.pool._pre_ping is True

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

    assert application.state.database is None


def test_app_lifespan_disposes_database_resources(monkeypatch) -> None:
    database = SimpleNamespace()
    dispose = AsyncMock()
    monkeypatch.setattr("app.main.create_database", lambda settings: database)
    monkeypatch.setattr("app.main.dispose_database", dispose)
    settings = Settings(
        _env_file=None,
        environment=Environment.TEST,
        database_url="postgresql+psycopg://example:secret@localhost/vyntics",
    )
    application = create_app(settings)

    with TestClient(application):
        assert application.state.database is database

    dispose.assert_awaited_once_with(database)
    assert application.state.database is None


def test_database_dependency_yields_one_session_without_committing() -> None:
    session = AsyncMock(spec=AsyncSession)

    @asynccontextmanager
    async def session_scope():
        yield session

    request = SimpleNamespace(
        app=SimpleNamespace(
            state=SimpleNamespace(
                database=SimpleNamespace(session_factory=session_scope)
            )
        )
    )

    async def use_dependency() -> None:
        dependency = get_db_session(request)
        assert await anext(dependency) is session
        await dependency.aclose()

    asyncio.run(use_dependency())
    session.commit.assert_not_awaited()
    session.rollback.assert_not_awaited()


def test_database_dependency_rolls_back_when_consumer_fails() -> None:
    session = AsyncMock(spec=AsyncSession)

    @asynccontextmanager
    async def session_scope():
        yield session

    request = SimpleNamespace(
        app=SimpleNamespace(
            state=SimpleNamespace(
                database=SimpleNamespace(session_factory=session_scope)
            )
        )
    )

    async def fail_inside_dependency() -> None:
        dependency = get_db_session(request)
        await anext(dependency)
        with pytest.raises(RuntimeError, match="repository failure"):
            await dependency.athrow(RuntimeError("repository failure"))

    asyncio.run(fail_inside_dependency())
    session.rollback.assert_awaited_once_with()
    session.commit.assert_not_awaited()


def test_connectivity_check_executes_select_one() -> None:
    result = SimpleNamespace(scalar_one=lambda: 1)
    connection = SimpleNamespace(execute=AsyncMock(return_value=result))

    @asynccontextmanager
    async def connect():
        yield connection

    database = SimpleNamespace(engine=SimpleNamespace(connect=connect))

    asyncio.run(verify_database_connection(database))

    statement = connection.execute.await_args.args[0]
    assert str(statement) == "SELECT 1"
