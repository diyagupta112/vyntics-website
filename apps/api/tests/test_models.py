"""Static validation for the PostgreSQL ORM schema."""

from sqlalchemy import CheckConstraint
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.schema import CreateTable

from app.db.base import Base
from app.db.models import (
    AdminUser,
    AuditLog,
    Blog,
    Career,
    CaseStudy,
    ContactSubmission,
    JobApplication,
    TeamMember,
)

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


def _check_constraint_sql(model: type[Base]) -> set[str]:
    return {
        str(constraint.sqltext)
        for constraint in model.__table__.constraints
        if isinstance(constraint, CheckConstraint)
    }


def test_all_expected_models_are_registered() -> None:
    assert set(Base.metadata.tables) == EXPECTED_TABLES


def test_table_names_are_exact() -> None:
    assert AdminUser.__tablename__ == "admin_users"
    assert Blog.__tablename__ == "blogs"
    assert CaseStudy.__tablename__ == "case_studies"
    assert Career.__tablename__ == "careers"
    assert JobApplication.__tablename__ == "job_applications"
    assert TeamMember.__tablename__ == "team_members"
    assert ContactSubmission.__tablename__ == "contact_submissions"
    assert AuditLog.__tablename__ == "audit_logs"


def test_primary_keys_use_postgresql_uuid() -> None:
    for table in Base.metadata.tables.values():
        assert isinstance(table.c.id.type, UUID)


def test_admin_identity_constraints() -> None:
    assert AdminUser.__table__.c.auth_user_id.unique is True
    assert "role IN ('superadmin', 'admin')" in _check_constraint_sql(AdminUser)
    assert str(AdminUser.__table__.c.is_active.server_default.arg) == "true"


def test_publication_status_constraints_and_defaults() -> None:
    expected = "status IN ('draft', 'published', 'unpublished')"

    assert expected in _check_constraint_sql(Blog)
    assert expected in _check_constraint_sql(CaseStudy)
    assert str(Blog.__table__.c.status.server_default.arg) == "'draft'"
    assert str(CaseStudy.__table__.c.status.server_default.arg) == "'draft'"


def test_careers_have_no_status_or_visibility_fields() -> None:
    columns = set(Career.__table__.c.keys())

    assert "status" not in columns
    assert "is_active" not in columns
    assert "is_visible" not in columns
    assert "archived" not in columns


def test_job_application_relationship_preserves_history_after_career_deletion() -> None:
    career_id = JobApplication.__table__.c.career_id
    foreign_key = next(iter(career_id.foreign_keys))

    assert foreign_key.target_fullname == "careers.id"
    assert foreign_key.ondelete == "SET NULL"
    assert career_id.nullable is True
    assert JobApplication.career.property.back_populates == "applications"
    assert Career.applications.property.back_populates == "career"
    assert Career.applications.property.passive_deletes == "all"
    assert JobApplication.__table__.c.career_title_snapshot.nullable is False
    assert JobApplication.__table__.c.career_slug_snapshot.nullable is False
    assert str(JobApplication.__table__.c.status.server_default.arg) == "'new'"
    assert JobApplication.__table__.c.resume_url.nullable is True


def test_admin_managed_foreign_keys_reference_admin_users() -> None:
    managed_columns = {
        Blog: ("created_by", "updated_by"),
        CaseStudy: ("created_by", "updated_by"),
        Career: ("created_by", "updated_by"),
        TeamMember: ("created_by", "updated_by"),
        ContactSubmission: ("resolved_by",),
        AuditLog: ("actor_id",),
    }

    for model, column_names in managed_columns.items():
        for column_name in column_names:
            column = model.__table__.c[column_name]
            foreign_key = next(iter(column.foreign_keys))
            assert foreign_key.target_fullname == "admin_users.id"


def test_postgresql_content_types() -> None:
    assert isinstance(Blog.__table__.c.content.type, JSONB)
    assert isinstance(CaseStudy.__table__.c.content.type, JSONB)
    assert isinstance(Career.__table__.c.description.type, JSONB)
    assert isinstance(Career.__table__.c.responsibilities.type, JSONB)
    assert isinstance(Career.__table__.c.requirements.type, JSONB)
    assert isinstance(Career.__table__.c.nice_to_have.type, JSONB)
    assert isinstance(Career.__table__.c.benefits.type, JSONB)
    assert isinstance(AuditLog.__table__.c.context.type, JSONB)
    assert isinstance(CaseStudy.__table__.c.tech_stack.type, ARRAY)
    assert isinstance(CaseStudy.__table__.c.tags.type, ARRAY)


def test_team_member_type_and_contact_defaults() -> None:
    assert "member_type IN ('leadership', 'team')" in _check_constraint_sql(
        TeamMember
    )
    assert str(ContactSubmission.__table__.c.status.server_default.arg) == "'new'"


def test_team_member_visibility_is_removed_and_urls_remain_nullable() -> None:
    columns = TeamMember.__table__.c

    assert "is_visible" not in columns
    assert columns.photo_url.nullable is True
    assert columns.linkedin_url.nullable is True


def test_important_indexes_are_registered() -> None:
    expected_indexes = {
        "ix_blogs_status_published_at",
        "ix_case_studies_status_published_at",
        "ix_careers_published_at",
        "ix_job_applications_career_id",
        "ix_job_applications_status_submitted_at",
        "ix_contact_submissions_status_submitted_at",
        "ix_audit_logs_actor_created_at",
        "ix_audit_logs_resource_created_at",
    }
    actual_indexes = {
        index.name
        for table in Base.metadata.tables.values()
        for index in table.indexes
    }

    assert expected_indexes <= actual_indexes


def test_all_models_compile_for_postgresql() -> None:
    dialect = postgresql.dialect()

    for table in Base.metadata.sorted_tables:
        ddl = str(CreateTable(table).compile(dialect=dialect))
        assert f"CREATE TABLE {table.name}" in ddl
