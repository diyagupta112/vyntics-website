"""Explicit database connectivity verification for development and testing."""

import asyncio
import sys

from sqlalchemy import text

from app.core.config import Settings, get_settings
from app.db.session import Database, create_database, dispose_database


async def verify_database_connection(database: Database) -> None:
    """Open one pooled connection and verify PostgreSQL responds to ``SELECT 1``."""

    async with database.engine.connect() as connection:
        result = await connection.execute(text("SELECT 1"))
        if result.scalar_one() != 1:
            raise RuntimeError("Database connectivity verification returned no result.")


async def verify_configured_database(settings: Settings | None = None) -> None:
    """Verify configured database access and always dispose the temporary engine."""

    database = create_database(settings or get_settings())
    try:
        await verify_database_connection(database)
    finally:
        await dispose_database(database)


def main() -> int:
    """Run the safe command-line connectivity check without printing credentials."""

    try:
        if sys.platform == "win32":
            with asyncio.Runner(loop_factory=asyncio.SelectorEventLoop) as runner:
                runner.run(verify_configured_database())
        else:
            asyncio.run(verify_configured_database())
    except Exception:
        print("Database connectivity check failed.", file=sys.stderr)
        return 1

    print("Database connectivity check succeeded.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
