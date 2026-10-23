"""A saturated or unreachable database is a visible 503 that still carries CORS headers."""

from unittest.mock import AsyncMock
from uuid import uuid4

import psycopg
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from sqlalchemy.exc import TimeoutError as PoolTimeoutError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_auth_verifier
from app.api.dependencies.database import get_db_session
from app.auth.models import SupabaseIdentity
from app.auth.supabase import AccessTokenVerifier
from app.core.config import Environment, Settings
from app.db.engine import create_database_engine
from app.main import create_app

ORIGIN = "http://localhost:3001"
ENDPOINTS = ["/admin/me", "/admin/blogs", "/admin/case-studies", "/admin/job-applications", "/admin/contact-submissions"]
SATURATED = OperationalError("select 1", {}, psycopg.OperationalError("FATAL: (EMAXCONNSESSION) max clients reached in session mode"))


def client(error):
    verifier = AsyncMock(spec=AccessTokenVerifier)
    verifier.verify.return_value = SupabaseIdentity(user_id=uuid4(), email="admin@vyntics.com")
    session = AsyncMock(spec=AsyncSession)
    session.scalar.side_effect = error
    session.scalars.side_effect = error
    session.execute.side_effect = error
    app = create_app(Settings(_env_file=None, environment=Environment.TEST, debug=False, cors_origins=[ORIGIN]))
    app.dependency_overrides[get_auth_verifier] = lambda: verifier
    app.dependency_overrides[get_db_session] = lambda: session
    return TestClient(app, raise_server_exceptions=False)


@pytest.mark.parametrize("error", [SATURATED, PoolTimeoutError("QueuePool limit of size 3 overflow 2 reached")])
@pytest.mark.parametrize("path", ENDPOINTS)
def test_database_exhaustion_is_503_with_cors_and_no_internals(error, path):
    with client(error) as api:
        response = api.get(path, headers={"Authorization": "Bearer token", "Origin": ORIGIN})
    assert response.status_code == 503
    assert response.json() == {"detail": "The database is temporarily unavailable."}
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert "EMAXCONN" not in response.text


def test_authentication_is_still_enforced_when_the_database_is_down():
    with client(SATURATED) as api:
        response = api.get("/admin/blogs", headers={"Origin": ORIGIN})
    assert response.status_code == 401
    assert response.headers["access-control-allow-origin"] == ORIGIN


def test_pool_is_bounded_below_the_shared_pooler_limit():
    settings = Settings(_env_file=None, environment=Environment.TEST, database_url="postgresql://u:p@localhost:5432/db")
    pool = create_database_engine(settings).pool
    assert (pool.size(), pool._max_overflow, pool._timeout) == (3, 2, 10)
    assert pool.size() + pool._max_overflow < 15
    tuned = Settings(_env_file=None, environment=Environment.TEST, database_url="postgresql://u:p@localhost:5432/db",
                     database_pool_size=1, database_max_overflow=0, database_pool_timeout_seconds=2)
    pool = create_database_engine(tuned).pool
    assert (pool.size(), pool._max_overflow, pool._timeout) == (1, 0, 2)
