"""Unit tests for Case Study business rules and transactions."""

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.case_study import CaseStudy
from app.repositories.audit_logs import AuditLogRepository
from app.repositories.case_studies import CaseStudyRepository
from app.schemas.case_studies import (
    CaseStudyCreateRequest,
    CaseStudyUpdateRequest,
)
from app.services.case_studies import (
    CaseStudyNotFoundError,
    CaseStudyService,
    CaseStudySlugConflictError,
    CaseStudyValidationError,
)
from app.storage.uploads import PublicImageStorage


CASE_STUDY_ID = UUID("a610eff3-433a-405f-b58c-f4f1d1648e80")
NOW = datetime(2026, 9, 23, 12, 0, tzinfo=timezone.utc)


def _case_study(
    *,
    status: str = "draft",
    published_at: datetime | None = None,
    cover_image_url: str | None = "https://example.com/cover.jpg",
) -> CaseStudy:
    return CaseStudy(
        id=CASE_STUDY_ID,
        slug="phase-7-case-study",
        title="Phase 7 Case Study",
        seo_title="Phase 7 Case Study | Vyntics",
        meta_description="Service test.",
        client_name="Example Client",
        excerpt="Service test.",
        cover_image_url=cover_image_url,
        tech_stack=["Python", "FastAPI"],
        tags=["API"],
        content={"type": "doc"},
        status=status,
        published_at=published_at,
        created_at=NOW,
        updated_at=NOW,
    )


def _create_request(*, status: str = "draft") -> CaseStudyCreateRequest:
    return CaseStudyCreateRequest(
        slug="phase-7-case-study",
        title="Phase 7 Case Study",
        seo_title="Phase 7 Case Study | Vyntics",
        meta_description="Service test.",
        client_name="Example Client",
        excerpt="Service test.",
        cover_image_url=(
            "https://example.com/cover.jpg" if status == "published" else None
        ),
        tech_stack=["Python", "FastAPI"],
        tags=["API"],
        content={"type": "doc"},
        status=status,
    )


def _service(
    repository: CaseStudyRepository,
    audit_repository: AuditLogRepository,
):
    session = AsyncMock(spec=AsyncSession)
    service = CaseStudyService(
        session,
        case_study_repository=repository,
        audit_repository=audit_repository,
        clock=lambda: NOW,
    )
    return service, session


def test_create_published_sets_timestamp_and_safe_audit() -> None:
    case_studies = AsyncMock(spec=CaseStudyRepository)
    case_studies.slug_exists.return_value = False
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(case_studies, audits)

    created = asyncio.run(service.create(_create_request(status="published")))

    assert created.published_at == NOW
    case_studies.add.assert_awaited_once_with(created)
    audit = audits.add.await_args.args[0]
    assert audit.action == "create"
    assert audit.resource_type == "case_study"
    assert audit.actor_id is None
    assert audit.context == {"slug": created.slug, "status": "published"}
    assert "content" not in audit.context
    session.commit.assert_awaited_once_with()


def test_public_and_admin_reads_delegate_without_transactions() -> None:
    expected = [
        _case_study(status="draft"),
        _case_study(status="published", published_at=NOW),
        _case_study(status="unpublished"),
    ]
    case_studies = AsyncMock(spec=CaseStudyRepository)
    case_studies.list_published.return_value = [expected[1]]
    case_studies.list_all.return_value = expected
    case_studies.get_published_by_slug.return_value = expected[1]
    case_studies.get_by_id.return_value = expected[0]
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(case_studies, audits)

    assert asyncio.run(service.list_published()) == [expected[1]]
    assert asyncio.run(service.list_all()) == expected
    assert asyncio.run(service.get_published_by_slug("slug")) is expected[1]
    assert asyncio.run(service.get_by_id(CASE_STUDY_ID)) is expected[0]
    session.commit.assert_not_awaited()
    audits.add.assert_not_awaited()


def test_missing_reads_update_and_delete_raise_not_found() -> None:
    case_studies = AsyncMock(spec=CaseStudyRepository)
    case_studies.get_published_by_slug.return_value = None
    case_studies.get_by_id.return_value = None
    audits = AsyncMock(spec=AuditLogRepository)
    service, _ = _service(case_studies, audits)

    with pytest.raises(CaseStudyNotFoundError):
        asyncio.run(service.get_published_by_slug("missing"))
    with pytest.raises(CaseStudyNotFoundError):
        asyncio.run(service.get_by_id(CASE_STUDY_ID))
    with pytest.raises(CaseStudyNotFoundError):
        asyncio.run(
            service.update(
                CASE_STUDY_ID,
                CaseStudyUpdateRequest(title="Missing"),
            )
        )
    with pytest.raises(CaseStudyNotFoundError):
        asyncio.run(service.delete(CASE_STUDY_ID))


def test_create_rejects_duplicate_slug_without_transaction() -> None:
    case_studies = AsyncMock(spec=CaseStudyRepository)
    case_studies.slug_exists.return_value = True
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(case_studies, audits)

    with pytest.raises(CaseStudySlugConflictError):
        asyncio.run(service.create(_create_request()))

    case_studies.add.assert_not_awaited()
    audits.add.assert_not_awaited()
    session.commit.assert_not_awaited()


def test_update_enters_and_remains_published_preserving_timestamp() -> None:
    case_study = _case_study()
    case_studies = AsyncMock(spec=CaseStudyRepository)
    case_studies.get_by_id.return_value = case_study
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(case_studies, audits)

    updated = asyncio.run(
        service.update(
            CASE_STUDY_ID,
            CaseStudyUpdateRequest(status="published"),
        )
    )

    assert updated.status == "published"
    assert updated.published_at == NOW
    audit = audits.add.await_args.args[0]
    assert audit.context["changed_fields"] == ["published_at", "status"]
    assert "content" not in audit.context
    session.commit.assert_awaited_once_with()

    later = datetime(2026, 9, 24, tzinfo=timezone.utc)
    second_service = CaseStudyService(
        session,
        case_study_repository=case_studies,
        audit_repository=audits,
        clock=lambda: later,
    )
    asyncio.run(
        second_service.update(
            CASE_STUDY_ID,
            CaseStudyUpdateRequest(title="Updated title"),
        )
    )
    assert case_study.published_at == NOW


@pytest.mark.parametrize("status", ["draft", "unpublished"])
def test_update_leaving_published_clears_timestamp(status: str) -> None:
    case_study = _case_study(status="published", published_at=NOW)
    case_studies = AsyncMock(spec=CaseStudyRepository)
    case_studies.get_by_id.return_value = case_study
    audits = AsyncMock(spec=AuditLogRepository)
    service, _ = _service(case_studies, audits)

    updated = asyncio.run(
        service.update(CASE_STUDY_ID, CaseStudyUpdateRequest(status=status))
    )

    assert updated.status == status
    assert updated.published_at is None


def test_update_enforces_resulting_cover_and_slug_rules() -> None:
    case_study = _case_study(status="published", published_at=NOW)
    case_studies = AsyncMock(spec=CaseStudyRepository)
    case_studies.get_by_id.return_value = case_study
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(case_studies, audits)

    with pytest.raises(CaseStudyValidationError, match="cover_image_url"):
        asyncio.run(
            service.update(
                CASE_STUDY_ID,
                CaseStudyUpdateRequest(cover_image_url=None),
            )
        )

    case_studies.slug_exists.return_value = True
    with pytest.raises(CaseStudySlugConflictError):
        asyncio.run(
            service.update(
                CASE_STUDY_ID,
                CaseStudyUpdateRequest(slug="duplicate"),
            )
        )

    session.commit.assert_not_awaited()


def test_delete_hard_deletes_and_audits_in_one_transaction() -> None:
    case_study = _case_study(status="published", published_at=NOW)
    case_studies = AsyncMock(spec=CaseStudyRepository)
    case_studies.get_by_id.return_value = case_study
    audits = AsyncMock(spec=AuditLogRepository)
    service, session = _service(case_studies, audits)

    asyncio.run(service.delete(CASE_STUDY_ID))

    case_studies.delete.assert_awaited_once_with(case_study)
    audit = audits.add.await_args.args[0]
    assert audit.action == "delete"
    assert audit.resource_id == CASE_STUDY_ID
    assert audit.context == {
        "slug": case_study.slug,
        "status": "published",
    }
    session.commit.assert_awaited_once_with()


def test_audit_failure_rolls_back_mutation_transaction() -> None:
    case_studies = AsyncMock(spec=CaseStudyRepository)
    case_studies.slug_exists.return_value = False
    audits = AsyncMock(spec=AuditLogRepository)
    audits.add.side_effect = RuntimeError("audit failure")
    service, session = _service(case_studies, audits)

    with pytest.raises(RuntimeError, match="audit failure"):
        asyncio.run(service.create(_create_request()))

    session.rollback.assert_awaited_once_with()
    session.commit.assert_not_awaited()


def test_published_case_study_cover_cannot_be_deleted() -> None:
    case_study = _case_study(status="published", published_at=NOW)
    repository = AsyncMock(spec=CaseStudyRepository)
    repository.get_by_id.return_value = case_study
    audits = AsyncMock(spec=AuditLogRepository)
    storage = AsyncMock(spec=PublicImageStorage)
    session = AsyncMock(spec=AsyncSession)
    service = CaseStudyService(
        session,
        case_study_repository=repository,
        audit_repository=audits,
        image_storage=storage,
    )

    with pytest.raises(CaseStudyValidationError, match="draft or unpublished"):
        asyncio.run(service.delete_cover(CASE_STUDY_ID))

    session.commit.assert_not_awaited()
    storage.delete_managed_url.assert_not_awaited()
