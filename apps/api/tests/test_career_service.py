"""Unit tests for Career business rules and transactions."""

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.career import Career
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.careers import CareerRepository
from app.schemas.careers import CareerCreateRequest, CareerUpdateRequest
from app.services.careers import (
    CareerNotFoundError,
    CareerService,
    CareerSlugConflictError,
)


CAREER_ID = UUID("f36f3376-d338-46c1-91e3-f2b0fe723ec0")
PUBLISHED_AT = datetime(2026, 9, 25, 12, 0, tzinfo=timezone.utc)


def _career(**overrides: object) -> Career:
    values: dict[str, object] = {
        "id": CAREER_ID,
        "slug": "Senior-Engineer",
        "title": "Senior Engineer",
        "location": "Remote",
        "employment_type": "Full-time",
        "department": "Engineering",
        "experience": "5+ years",
        "short_description": "Build reliable systems.",
        "description": {"type": "doc"},
        "responsibilities": {"items": []},
        "requirements": {"items": []},
        "nice_to_have": {},
        "benefits": {},
        "published_at": PUBLISHED_AT,
        "created_at": PUBLISHED_AT,
        "updated_at": PUBLISHED_AT,
    }
    values.update(overrides)
    return Career(**values)


def _create_request(**overrides: object) -> CareerCreateRequest:
    values: dict[str, object] = {
        "slug": "Senior-Engineer",
        "title": "Senior Engineer",
        "location": "Remote",
        "employment_type": "Full-time",
        "department": "Engineering",
        "experience": "5+ years",
        "short_description": "Build reliable systems.",
        "description": {"type": "doc"},
        "responsibilities": {"items": []},
        "requirements": {"items": []},
    }
    values.update(overrides)
    return CareerCreateRequest.model_validate(values)


def _service(repository: CareerRepository, audits: AuditLogRepository):
    session = AsyncMock(spec=AsyncSession)
    return CareerService(
        session,
        career_repository=repository,
        audit_repository=audits,
        clock=lambda: PUBLISHED_AT,
    ), session


def test_reads_delegate_without_transactions_and_map_missing() -> None:
    career = _career()
    repository = AsyncMock(spec=CareerRepository)
    repository.list_all.return_value = [career]
    repository.get_by_slug.return_value = career
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)

    assert asyncio.run(service.list_all()) == [career]
    assert asyncio.run(service.get_by_slug(career.slug)) is career
    repository.get_by_slug.return_value = None
    with pytest.raises(CareerNotFoundError):
        asyncio.run(service.get_by_slug("missing"))
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()


def test_create_sets_timestamp_defaults_and_safe_atomic_audit() -> None:
    repository = AsyncMock(spec=CareerRepository)
    repository.slug_exists.return_value = False
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)

    created = asyncio.run(service.create(_create_request()))
    audit = audits.add.await_args.args[0]

    assert created.published_at == PUBLISHED_AT
    assert created.nice_to_have == {} and created.benefits == {}
    assert audit.action == "create" and audit.resource_type == "career"
    assert audit.actor_id is None and audit.actor_email is None
    assert audit.context == {
        "slug": "Senior-Engineer",
        "department": "Engineering",
        "employment_type": "Full-time",
    }
    assert "description" not in audit.context
    repository.add.assert_awaited_once_with(created)
    session.commit.assert_awaited_once_with()


def test_create_duplicate_slug_maps_precheck_and_integrity_race() -> None:
    repository = AsyncMock(spec=CareerRepository)
    repository.slug_exists.return_value = True
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)

    with pytest.raises(CareerSlugConflictError):
        asyncio.run(service.create(_create_request()))
    repository.add.assert_not_awaited()

    repository.slug_exists.return_value = False
    repository.add.side_effect = IntegrityError("insert", {}, Exception("unique"))
    with pytest.raises(CareerSlugConflictError):
        asyncio.run(service.create(_create_request()))
    session.rollback.assert_awaited_once_with()


def test_update_changes_fields_preserves_omissions_and_published_at() -> None:
    career = _career()
    repository = AsyncMock(spec=CareerRepository)
    repository.get_by_id.return_value = career
    repository.slug_exists.return_value = False
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)

    updated = asyncio.run(
        service.update(
            CAREER_ID,
            CareerUpdateRequest(title="Principal Engineer", benefits={"a": 1}),
        )
    )
    audit = audits.add.await_args.args[0]

    assert updated.title == "Principal Engineer"
    assert updated.location == "Remote"
    assert updated.published_at == PUBLISHED_AT
    assert audit.action == "update"
    assert audit.context["changed_fields"] == ["benefits", "title"]
    assert "description" not in audit.context
    session.commit.assert_awaited_once_with()


def test_update_maps_missing_and_duplicate_slug() -> None:
    repository = AsyncMock(spec=CareerRepository)
    repository.get_by_id.return_value = None
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)

    with pytest.raises(CareerNotFoundError):
        asyncio.run(service.update(CAREER_ID, CareerUpdateRequest(title="Missing")))

    repository.get_by_id.return_value = _career()
    repository.slug_exists.return_value = True
    with pytest.raises(CareerSlugConflictError):
        asyncio.run(service.update(CAREER_ID, CareerUpdateRequest(slug="duplicate")))
    session.commit.assert_not_awaited()


def test_delete_hard_deletes_and_audits_atomically() -> None:
    career = _career()
    repository = AsyncMock(spec=CareerRepository)
    repository.get_by_id.return_value = career
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)

    asyncio.run(service.delete(CAREER_ID))
    repository.delete.assert_awaited_once_with(career)
    audit = audits.add.await_args.args[0]
    assert audit.action == "delete" and audit.resource_id == CAREER_ID
    assert audit.context["slug"] == career.slug
    assert "description" not in audit.context
    session.commit.assert_awaited_once_with()


def test_delete_failure_rolls_back() -> None:
    repository = AsyncMock(spec=CareerRepository)
    repository.get_by_id.return_value = _career()
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)
    session.commit.side_effect = IntegrityError(
        "DELETE FROM careers",
        {},
        Exception("fk_job_applications_career_id"),
    )

    with pytest.raises(IntegrityError):
        asyncio.run(service.delete(CAREER_ID))

    session.rollback.assert_awaited_once_with()


@pytest.mark.parametrize("operation", ["create", "update", "delete"])
def test_audit_failure_rolls_back_each_mutation(operation: str) -> None:
    repository = AsyncMock(spec=CareerRepository)
    repository.slug_exists.return_value = False
    repository.get_by_id.return_value = _career()
    audits = AsyncMock(spec=AuditLogRepository)
    audits.add.side_effect = RuntimeError("audit failure")
    service, session = _service(repository, audits)

    with pytest.raises(RuntimeError, match="audit failure"):
        if operation == "create":
            asyncio.run(service.create(_create_request()))
        elif operation == "update":
            asyncio.run(service.update(CAREER_ID, CareerUpdateRequest(title="Updated")))
        else:
            asyncio.run(service.delete(CAREER_ID))

    session.rollback.assert_awaited_once_with()
    session.commit.assert_not_awaited()
