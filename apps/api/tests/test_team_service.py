"""Unit tests for Team Member business logic and transactions."""

import asyncio
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.team_member import TeamMember
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.team_members import TeamMemberRepository
from app.schemas.team import TeamMemberCreateRequest, TeamMemberUpdateRequest
from app.services.team_members import TeamMemberNotFoundError, TeamMemberService
from app.storage.uploads import PublicImageStorage, StoredPublicObject

MEMBER_ID = UUID("ce8e3179-52a8-4109-b5b4-1c8f896d10b1")


def _member() -> TeamMember:
    return TeamMember(
        id=MEMBER_ID, name="Jane Doe", role="CEO", bio="Private biography",
        photo_url="https://example.com/jane.jpg",
        linkedin_url="https://linkedin.com/in/jane", display_order=1,
        member_type="leadership",
    )


def _service(repository: TeamMemberRepository, audits: AuditLogRepository):
    session = AsyncMock(spec=AsyncSession)
    return TeamMemberService(
        session, team_member_repository=repository, audit_repository=audits
    ), session


def test_reads_delegate_without_transactions() -> None:
    member = _member()
    repository = AsyncMock(spec=TeamMemberRepository)
    repository.list_all.return_value = [member]
    repository.get_by_id.return_value = member
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)

    assert asyncio.run(service.list_all()) == [member]
    assert asyncio.run(service.get_by_id(MEMBER_ID)) is member
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()


def test_missing_read_update_delete_raise_not_found() -> None:
    repository = AsyncMock(spec=TeamMemberRepository)
    repository.get_by_id.return_value = None
    service, session = _service(repository, AsyncMock(spec=AuditLogRepository))

    with pytest.raises(TeamMemberNotFoundError):
        asyncio.run(service.get_by_id(MEMBER_ID))
    with pytest.raises(TeamMemberNotFoundError):
        asyncio.run(service.update(MEMBER_ID, TeamMemberUpdateRequest(role="CTO")))
    with pytest.raises(TeamMemberNotFoundError):
        asyncio.run(service.delete(MEMBER_ID))
    session.commit.assert_not_awaited()


def test_create_commits_with_safe_audit() -> None:
    repository = AsyncMock(spec=TeamMemberRepository)
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)
    request = TeamMemberCreateRequest(
        name="Jane Doe", role="CEO", bio="Private biography", display_order=1,
        member_type="leadership",
    )

    created = asyncio.run(service.create(request))
    audit = audits.add.await_args.args[0]

    assert created.photo_url is None and created.linkedin_url is None
    assert audit.action == "create" and audit.resource_type == "team_member"
    assert audit.actor_id is None
    assert audit.context == {"member_type": "leadership", "display_order": 1}
    assert "bio" not in audit.context and "url" not in str(audit.context)
    session.commit.assert_awaited_once_with()


def test_update_applies_fields_and_explicitly_clears_url() -> None:
    member = _member()
    repository = AsyncMock(spec=TeamMemberRepository)
    repository.get_by_id.return_value = member
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)

    updated = asyncio.run(service.update(
        MEMBER_ID,
        TeamMemberUpdateRequest(role="President", photo_url=None),
    ))
    audit = audits.add.await_args.args[0]

    assert updated.role == "President" and updated.photo_url is None
    assert audit.context == {
        "member_type": "leadership", "display_order": 1,
        "changed_fields": ["photo_url", "role"],
    }
    assert "Private biography" not in str(audit.context)
    session.commit.assert_awaited_once_with()


def test_delete_and_audit_are_atomic_and_safe() -> None:
    member = _member()
    repository = AsyncMock(spec=TeamMemberRepository)
    repository.get_by_id.return_value = member
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(repository, audits)

    asyncio.run(service.delete(MEMBER_ID))
    repository.delete.assert_awaited_once_with(member)
    audit = audits.add.await_args.args[0]
    assert audit.action == "delete" and audit.resource_id == MEMBER_ID
    assert "bio" not in audit.context and "url" not in str(audit.context)
    session.commit.assert_awaited_once_with()


@pytest.mark.parametrize("operation", ["create", "update", "delete"])
def test_audit_failure_rolls_back_each_mutation(operation: str) -> None:
    repository = AsyncMock(spec=TeamMemberRepository)
    repository.get_by_id.return_value = _member()
    audits = AsyncMock(spec=AuditLogRepository)
    audits.add.side_effect = RuntimeError("audit failure")
    service, session = _service(repository, audits)

    with pytest.raises(RuntimeError, match="audit failure"):
        if operation == "create":
            asyncio.run(service.create(TeamMemberCreateRequest(
                name="Jane", role="CEO", bio="Bio", display_order=1,
                member_type="leadership",
            )))
        elif operation == "update":
            asyncio.run(service.update(MEMBER_ID, TeamMemberUpdateRequest(role="CTO")))
        else:
            asyncio.run(service.delete(MEMBER_ID))

    session.rollback.assert_awaited_once_with()
    session.commit.assert_not_awaited()


def test_photo_upload_uses_actor_and_cleans_previous_url_after_commit() -> None:
    member = _member()
    repository = AsyncMock(spec=TeamMemberRepository)
    repository.get_by_id.return_value = member
    audits = AsyncMock(spec=AuditLogRepository)
    storage = AsyncMock(spec=PublicImageStorage)
    storage.upload.return_value = StoredPublicObject(
        "https://project/storage/v1/object/public/team-photos/id/new.jpg",
        f"{MEMBER_ID}/new.jpg",
    )
    session = AsyncMock(spec=AsyncSession)
    service = TeamMemberService(
        session,
        team_member_repository=repository,
        audit_repository=audits,
        image_storage=storage,
    )

    updated = asyncio.run(service.upload_photo(MEMBER_ID, AsyncMock()))

    assert updated.photo_url.endswith("/new.jpg")
    session.commit.assert_awaited_once_with()
    storage.delete_managed_url.assert_awaited_once_with(
        "https://example.com/jane.jpg", MEMBER_ID
    )
    audit = audits.add.await_args.args[0]
    assert audit.context["changed_fields"] == ["photo_url"]
    assert "new.jpg" not in str(audit.context)
