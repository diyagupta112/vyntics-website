"""Badge service transaction, storage, and audit tests."""

import asyncio
from datetime import datetime, timezone
from io import BytesIO
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.badge import Badge
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.badges import BadgeRepository
from app.schemas.badges import BadgeCreateRequest, BadgeUpdateRequest
from app.services.badges import BadgeNotFoundError, BadgePersistenceError, BadgeService
from app.storage.supabase import StorageError
from app.storage.uploads import PublicImageStorage, StoredPublicObject
from tests.auth_helpers import TEST_ADMIN


BADGE_ID = UUID("a9ef2526-f734-47aa-b6f8-b3a6cfb18366")
NOW = datetime(2026, 10, 2, 9, 0, tzinfo=timezone.utc)
OLD_URL = "https://project/storage/v1/object/public/badge-logos/id/old.png"
NEW_URL = "https://project/storage/v1/object/public/badge-logos/id/new.png"


def _badge(**overrides: object) -> Badge:
    values: dict[str, object] = {
        "id": BADGE_ID,
        "name": "Databricks Partner",
        "description": None,
        "logo_url": OLD_URL,
        "website_url": "https://www.databricks.com/",
        "display_order": 1,
        "is_active": True,
        "created_at": NOW,
        "updated_at": NOW,
    }
    values.update(overrides)
    return Badge(**values)


def _service():
    session = AsyncMock(spec=AsyncSession)
    badges = AsyncMock(spec=BadgeRepository)
    badges.next_display_order.return_value = 1
    audits = AsyncMock(spec=AuditLogRepository)
    storage = AsyncMock(spec=PublicImageStorage)
    return (
        BadgeService(
            session,
            badge_repository=badges,
            audit_repository=audits,
            image_storage=storage,
        ),
        session,
        badges,
        audits,
        storage,
    )


def test_create_persists_without_logo_and_audits_safe_context() -> None:
    service, session, badges, audits, _ = _service()
    created = asyncio.run(
        service.create(
            BadgeCreateRequest(
                name=" Databricks Partner ",
                description=None,
                website_url="https://www.databricks.com/partners",
                display_order=2,
                is_active=True,
            ),
            actor=TEST_ADMIN,
        )
    )

    assert created.name == "Databricks Partner"
    assert created.logo_url is None
    badges.add.assert_awaited_once_with(created)
    session.commit.assert_awaited_once_with()
    audit = audits.add.await_args.args[0]
    assert audit.action == "create" and audit.resource_type == "badge"
    assert audit.actor_id == TEST_ADMIN.admin_id
    assert audit.context == {"display_order": 2, "is_active": True}
    assert "website" not in str(audit.context)


def test_update_only_audits_real_metadata_changes() -> None:
    service, session, badges, audits, _ = _service()
    badge = _badge()
    badges.get_by_id.return_value = badge

    updated = asyncio.run(
        service.update(
            BADGE_ID,
            BadgeUpdateRequest(description=" Trusted partner ", is_active=False),
            actor=TEST_ADMIN,
        )
    )

    assert updated.description == "Trusted partner"
    assert updated.is_active is False
    assert audits.add.await_args.args[0].context["changed_fields"] == [
        "description",
        "is_active",
    ]
    session.commit.assert_awaited_once_with()


def test_delete_commits_audit_then_cleans_managed_logo() -> None:
    service, session, badges, audits, storage = _service()
    badge = _badge()
    badges.get_by_id.return_value = badge

    asyncio.run(service.delete(BADGE_ID, actor=TEST_ADMIN))

    badges.delete.assert_awaited_once_with(badge)
    assert audits.add.await_args.args[0].action == "delete"
    session.commit.assert_awaited_once_with()
    storage.delete_managed_url.assert_awaited_once_with(OLD_URL, BADGE_ID)


def test_upload_and_replace_logo_commit_before_old_cleanup() -> None:
    service, session, badges, audits, storage = _service()
    badge = _badge()
    badges.get_by_id.return_value = badge
    storage.upload.return_value = StoredPublicObject(NEW_URL, f"{BADGE_ID}/new.png")

    updated = asyncio.run(
        service.upload_logo(
            BADGE_ID,
            UploadFile(filename="logo.png", file=BytesIO(b"image")),
            actor=TEST_ADMIN,
        )
    )

    assert updated.logo_url == NEW_URL
    session.commit.assert_awaited_once_with()
    storage.delete_managed_url.assert_awaited_once_with(OLD_URL, BADGE_ID)
    context = audits.add.await_args.args[0].context
    assert context["logo_operation"] == "replace"
    assert NEW_URL not in str(context)


def test_first_logo_upload_records_upload_operation() -> None:
    service, _, badges, audits, storage = _service()
    badges.get_by_id.return_value = _badge(logo_url=None)
    storage.upload.return_value = StoredPublicObject(NEW_URL, f"{BADGE_ID}/new.png")

    asyncio.run(service.upload_logo(BADGE_ID, AsyncMock(), actor=TEST_ADMIN))

    assert audits.add.await_args.args[0].context["logo_operation"] == "upload"
    storage.delete_managed_url.assert_not_awaited()


def test_upload_database_failure_compensates_new_object() -> None:
    service, session, badges, audits, storage = _service()
    badges.get_by_id.return_value = _badge()
    storage.upload.return_value = StoredPublicObject(NEW_URL, f"{BADGE_ID}/new.png")
    audits.add.side_effect = RuntimeError("database internals")

    with pytest.raises(BadgePersistenceError):
        asyncio.run(service.upload_logo(BADGE_ID, AsyncMock(), actor=TEST_ADMIN))

    session.rollback.assert_awaited_once_with()
    storage.delete_path.assert_awaited_once_with(f"{BADGE_ID}/new.png")
    storage.delete_managed_url.assert_not_awaited()


def test_delete_logo_is_idempotent_and_audits_real_deletion() -> None:
    service, session, badges, audits, storage = _service()
    badge = _badge(logo_url=None)
    badges.get_by_id.return_value = badge

    asyncio.run(service.delete_logo(BADGE_ID, actor=TEST_ADMIN))
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()

    badge.logo_url = OLD_URL
    asyncio.run(service.delete_logo(BADGE_ID, actor=TEST_ADMIN))
    assert badge.logo_url is None
    assert audits.add.await_args.args[0].context["logo_operation"] == "delete"
    storage.delete_managed_url.assert_awaited_once_with(OLD_URL, BADGE_ID)


def test_missing_badge_and_storage_cleanup_failure_behavior() -> None:
    service, session, badges, _, storage = _service()
    badges.get_by_id.return_value = None
    with pytest.raises(BadgeNotFoundError):
        asyncio.run(service.get_by_id(BADGE_ID))

    badges.get_by_id.return_value = _badge()
    storage.delete_managed_url.side_effect = StorageError("provider")
    asyncio.run(service.delete(BADGE_ID, actor=TEST_ADMIN))
    session.commit.assert_awaited_once_with()


@pytest.mark.parametrize("requested, next_order, expected", [(0, 3, 3), (1, 3, 3), (2, 3, 3), (10, 3, 10)])
def test_new_recognition_appends_after_existing_records(requested, next_order, expected) -> None:
    service, session, badges, audits, _ = _service()
    badges.next_display_order.return_value = next_order
    created = asyncio.run(service.create(BadgeCreateRequest(
        name="New recognition", display_order=requested, is_active=True,
    ), actor=TEST_ADMIN))
    assert created.display_order == expected
    badges.next_display_order.assert_awaited_once()
    session.commit.assert_awaited_once()
    assert audits.add.await_args.args[0].context["display_order"] == expected
