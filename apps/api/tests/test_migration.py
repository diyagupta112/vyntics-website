"""Static checks for the initial Supabase SQL migration."""

from pathlib import Path

EXPECTED_TABLES = {
    "admin_users",
    "audit_logs",
    "blogs",
    "careers",
    "case_studies",
    "contact_submissions",
    "job_applications",
    "team_members",
}


def _initial_migration() -> Path:
    repository_root = Path(__file__).resolve().parents[3]
    migrations = sorted((repository_root / "supabase" / "migrations").glob("*.sql"))
    assert len(migrations) == 1
    return migrations[0]


def test_initial_migration_creates_only_approved_tables() -> None:
    sql = _initial_migration().read_text(encoding="utf-8").lower()
    created_tables = {
        line.removeprefix("create table public.").split(" ", 1)[0]
        for line in sql.splitlines()
        if line.startswith("create table public.")
    }

    assert created_tables == EXPECTED_TABLES
    assert "create table public.users" not in sql
    assert "blog_posts" not in sql


def test_migration_preserves_application_history() -> None:
    sql = _initial_migration().read_text(encoding="utf-8").lower()

    assert "references public.careers (id)\n        on delete restrict" in sql
    assert "on delete cascade" not in sql


def test_migration_careers_have_no_status_column() -> None:
    sql = _initial_migration().read_text(encoding="utf-8").lower()
    careers_definition = sql.split("create table public.careers (", 1)[1].split(
        "create index ix_careers_published_at",
        1,
    )[0]

    assert "\n    status " not in careers_definition
    assert "\n    is_active " not in careers_definition
    assert "\n    is_visible " not in careers_definition
    assert "\n    archived " not in careers_definition


def test_migration_uses_supabase_sql_without_alembic() -> None:
    sql = _initial_migration().read_text(encoding="utf-8").lower()

    assert "gen_random_uuid()" in sql
    assert "jsonb" in sql
    assert "text[]" in sql
    assert "alembic" not in sql
