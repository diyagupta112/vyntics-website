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
    migration = (
        repository_root
        / "supabase"
        / "migrations"
        / "20260923073155_initial_application_schema.sql"
    )
    assert migration.is_file()
    return migration


def _team_visibility_migration() -> Path:
    repository_root = Path(__file__).resolve().parents[3]
    migration = (
        repository_root
        / "supabase"
        / "migrations"
        / "20260923175653_remove_team_member_visibility.sql"
    )
    assert migration.is_file()
    return migration


def _optional_job_resume_migration() -> Path:
    repository_root = Path(__file__).resolve().parents[3]
    migration = (
        repository_root
        / "supabase"
        / "migrations"
        / "20260925180000_allow_job_application_without_resume.sql"
    )
    assert migration.is_file()
    return migration


def _historical_job_application_migration() -> Path:
    repository_root = Path(__file__).resolve().parents[3]
    migration = (
        repository_root
        / "supabase"
        / "migrations"
        / "20260925190000_preserve_job_applications_after_career_deletion.sql"
    )
    assert migration.is_file()
    return migration


def _candidate_information_migration() -> Path:
    repository_root = Path(__file__).resolve().parents[3]
    migration = (
        repository_root
        / "supabase"
        / "migrations"
        / "20261001120000_add_job_application_candidate_fields.sql"
    )
    assert migration.is_file()
    return migration


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


def test_initial_migration_originally_restricted_career_deletion() -> None:
    sql = _initial_migration().read_text(encoding="utf-8").lower()

    assert "references public.careers (id)\n        on delete restrict" in sql
    assert "on delete cascade" not in sql


def test_forward_migration_preserves_applications_and_career_identity() -> None:
    sql = _historical_job_application_migration().read_text(encoding="utf-8").lower()

    assert "add column career_title_snapshot text" in sql
    assert "add column career_slug_snapshot text" in sql
    assert "update public.job_applications as application" in sql
    assert "alter column career_id drop not null" in sql
    assert "drop constraint if exists fk_job_applications_career_id" in sql
    assert "on delete set null" in sql
    assert "on delete cascade" not in sql
    assert "create table" not in sql


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


def test_team_visibility_forward_migration_is_narrow() -> None:
    sql = _team_visibility_migration().read_text(encoding="utf-8").lower()

    assert "drop index if exists public.ix_team_members_visible_order" in sql
    assert "alter table public.team_members" in sql
    assert "drop column is_visible" in sql
    assert "add column" not in sql
    assert "create table" not in sql
    assert "display_order" not in sql


def test_optional_job_resume_forward_migration_is_narrow() -> None:
    sql = _optional_job_resume_migration().read_text(encoding="utf-8").lower()

    assert "alter table public.job_applications" in sql
    assert "alter column resume_url drop not null" in sql
    assert "create table" not in sql
    assert "drop column" not in sql
    assert "career_id" not in sql


def test_candidate_information_migration_is_additive_and_historical_safe() -> None:
    sql = _candidate_information_migration().read_text(encoding="utf-8").lower()

    assert "alter table public.job_applications" in sql
    for column in (
        "experience_years integer",
        "experience_months smallint",
        "currently_working boolean",
        "current_company text",
        "notice_period text",
    ):
        assert f"add column {column}" in sql
    assert "between 0 and 11" in sql
    assert "'immediate'" in sql and "'other'" in sql
    assert "not null" not in sql
    assert "default" not in sql
    assert "update public.job_applications" not in sql
    assert "drop column" not in sql
    assert "create table" not in sql
