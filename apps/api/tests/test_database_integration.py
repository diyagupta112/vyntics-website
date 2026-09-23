"""Opt-in connectivity test for the configured Supabase PostgreSQL database."""

import asyncio
import os

import pytest

from app.core.config import Settings
from app.db.connectivity import verify_configured_database


RUN_DATABASE_INTEGRATION_TESTS = (
    os.getenv("RUN_DATABASE_INTEGRATION_TESTS", "").lower() in {"1", "true", "yes"}
)


@pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use the configured database",
)
def test_configured_database_is_reachable() -> None:
    settings = Settings()
    assert settings.database_url is not None, "DATABASE_URL is not configured"

    asyncio.run(verify_configured_database(settings))
