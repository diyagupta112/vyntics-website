"""Opt-in migration and concurrency checks in a disposable database schema."""
import asyncio
from pathlib import Path
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.engine import make_url
from pydantic import SecretStr

from app.core.config import Settings
from app.db.session import create_database, dispose_database
from tests.test_blogs_integration import RUN_DATABASE_INTEGRATION_TESTS


@pytest.mark.skipif(not RUN_DATABASE_INTEGRATION_TESTS, reason="requires configured PostgreSQL")
def test_featured_migration_and_concurrent_capacity():
    async def exercise():
        settings = Settings()
        url = make_url(settings.database_url.get_secret_value()).update_query_dict({"connect_timeout": "10"})
        settings = settings.model_copy(update={"database_url": SecretStr(url.render_as_string(hide_password=False))})
        db = create_database(settings)
        schema = "case_featured_test_" + uuid4().hex
        try:
            async with db.engine.begin() as connection:
                await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
                await connection.execute(text(f'CREATE TABLE "{schema}".case_studies (id integer primary key, is_featured boolean not null default false)'))
                await connection.execute(text(f'INSERT INTO "{schema}".case_studies(id) VALUES (0)'))
                sql = (Path(__file__).resolve().parents[3] / "supabase/migrations/20261005130000_case_studies_featured_contract.sql").read_text()
                sql = sql.replace("public.", f'"{schema}".').replace("table_schema='public'", f"table_schema='{schema}'").replace("search_path = public", f'search_path = "{schema}"')
                await connection.exec_driver_sql(sql)
                assert (await connection.execute(text(f'SELECT featured FROM "{schema}".case_studies WHERE id=0'))).scalar_one() is False
                for i in range(1, 5):
                    await connection.execute(text(f'INSERT INTO "{schema}".case_studies VALUES (:id,true)'), {"id": i})
            async def claim(i):
                try:
                    async with db.engine.begin() as c:
                        await c.execute(text(f'INSERT INTO "{schema}".case_studies VALUES (:id,true)'), {"id": i})
                    return True
                except Exception as error:
                    assert getattr(getattr(error.orig, "diag", None), "constraint_name", None) == "case_studies_featured_limit"
                    return False
            assert sorted(await asyncio.gather(claim(5), claim(6))) == [False, True]
            async with db.engine.begin() as c:
                assert (await c.execute(text(f'SELECT count(*) FROM "{schema}".case_studies WHERE featured'))).scalar_one() == 5
                await c.execute(text(f'UPDATE "{schema}".case_studies SET featured=true WHERE id=1'))
                await c.execute(text(f'UPDATE "{schema}".case_studies SET featured=false WHERE id=1'))
                await c.execute(text(f'UPDATE "{schema}".case_studies SET featured=true WHERE id=0'))
        finally:
            async with db.engine.begin() as c:
                await c.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
            await dispose_database(db)
    asyncio.run(asyncio.wait_for(exercise(), timeout=45))
