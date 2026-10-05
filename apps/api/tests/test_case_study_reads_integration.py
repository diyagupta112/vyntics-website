"""Read-only HTTP regression coverage against the deployed PostgreSQL schema.

Mocked service tests cannot detect an unapplied featured-column migration. These
checks exercise the actual repository, response serialization, and all four read
routes without creating or modifying application records.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.core.config import Settings
from app.db.session import create_database, dispose_database
from app.main import create_app
from tests.auth_helpers import authenticate_test_admin
from tests.test_case_studies_integration import RUN_DATABASE_INTEGRATION_TESTS, _run


@pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use configured PostgreSQL",
)
def test_case_study_http_reads_match_existing_database_records() -> None:
    settings = Settings(debug=False)

    async def read_existing_records():
        database = create_database(settings)
        try:
            async with database.engine.connect() as connection:
                result = await connection.execute(text(
                    "SELECT id, slug, status, featured, content "
                    "FROM public.case_studies ORDER BY id"
                ))
                return {str(row.id): dict(row._mapping) for row in result}
        finally:
            await dispose_database(database)

    records = _run_with_result(read_existing_records())
    application = create_app(settings)
    # Reuse the existing auth helper; real repositories and schemas remain active.
    authenticate_test_admin(application)
    with TestClient(application) as client:
        public = client.get("/case-studies")
        assert public.status_code == 200
        items = public.json()["data"]
        published = {key for key, row in records.items() if row["status"] == "published"}
        assert {item["id"] for item in items} == published
        admin = client.get("/admin/case-studies")
        assert admin.status_code == 200
        assert {item["id"] for item in admin.json()} == set(records)
        for item in admin.json():
            expected = records[item["id"]]
            assert item["featured"] is expected["featured"]
            assert item["content"] == expected["content"]
            detail = client.get(f'/admin/case-studies/{item["id"]}')
            assert detail.status_code == 200
            assert detail.json() == item
        for item in items:
            expected = records[item["id"]]
            assert item["featured"] is expected["featured"]
            detail = client.get(f'/case-studies/{item["slug"]}')
            assert detail.status_code == 200
            assert detail.json()["content"] == expected["content"]
            assert detail.json()["featured"] is expected["featured"]
    application.dependency_overrides.clear()
    with TestClient(application) as client:
        assert client.get("/admin/case-studies").status_code == 401


def _run_with_result(coroutine):
    results = []

    async def collect():
        results.append(await coroutine)

    _run(collect())
    return results[0]
