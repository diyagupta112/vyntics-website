"""Opt-in Case Study integration tests against configured PostgreSQL."""

import asyncio
import os
import sys
from uuid import uuid4

import pytest
from sqlalchemy import delete, select

from app.core.config import Settings
from app.db.models.audit_log import AuditLog
from app.db.models.case_study import CaseStudy
from app.db.session import create_database, dispose_database
from app.schemas.case_studies import (
    CaseStudyCreateRequest,
    CaseStudyUpdateRequest,
)
from app.services.case_studies import CaseStudyNotFoundError, CaseStudyService


RUN_DATABASE_INTEGRATION_TESTS = (
    os.getenv("RUN_DATABASE_INTEGRATION_TESTS", "").lower()
    in {"1", "true", "yes"}
)


def _run(coroutine) -> None:
    if sys.platform == "win32":
        with asyncio.Runner(loop_factory=asyncio.SelectorEventLoop) as runner:
            runner.run(coroutine)
    else:
        asyncio.run(coroutine)


@pytest.mark.skipif(
    not RUN_DATABASE_INTEGRATION_TESTS,
    reason="set RUN_DATABASE_INTEGRATION_TESTS=1 to use the configured database",
)
def test_case_study_lifecycle_against_configured_postgresql() -> None:
    async def exercise() -> None:
        settings = Settings()
        assert settings.database_url is not None, "DATABASE_URL is not configured"
        database = create_database(settings)
        run_id = uuid4()
        case_study_ids = []

        try:
            async with database.session_factory() as session:
                service = CaseStudyService(session)
                created_by_status = {}
                for case_study_status in ("draft", "published", "unpublished"):
                    created = await service.create(
                        CaseStudyCreateRequest(
                            slug=(
                                "phase-7-integration-"
                                f"{case_study_status}-{run_id}"
                            ),
                            title=(
                                "Phase 7 "
                                f"{case_study_status.title()} Case Study"
                            ),
                            seo_title=(
                                "Phase 7 "
                                f"{case_study_status.title()} | Vyntics"
                            ),
                            meta_description="Temporary integration test.",
                            client_name="Integration Client",
                            excerpt="Temporary integration test.",
                            cover_image_url=(
                                "https://example.com/integration.jpg"
                                if case_study_status == "published"
                                else None
                            ),
                            tech_stack=["Python", "FastAPI"],
                            tags=["Integration"],
                            content={"type": "doc", "content": []},
                            status=case_study_status,
                        )
                    )
                    case_study_ids.append(created.id)
                    created_by_status[case_study_status] = created

                published = created_by_status["published"]
                original_published_at = published.published_at
                assert original_published_at is not None

                admin_ids = {item.id for item in await service.list_all()}
                assert set(case_study_ids).issubset(admin_ids)
                public_ids = {
                    item.id for item in await service.list_published()
                }
                assert published.id in public_ids
                assert created_by_status["draft"].id not in public_ids
                assert created_by_status["unpublished"].id not in public_ids

                for hidden_status in ("draft", "unpublished"):
                    with pytest.raises(CaseStudyNotFoundError):
                        await service.get_published_by_slug(
                            created_by_status[hidden_status].slug
                        )

                still_published = await service.update(
                    published.id,
                    CaseStudyUpdateRequest(title="Still published"),
                )
                assert still_published.published_at == original_published_at
                unpublished = await service.update(
                    published.id,
                    CaseStudyUpdateRequest(status="unpublished"),
                )
                assert unpublished.published_at is None

                for case_study_id in case_study_ids:
                    await service.delete(case_study_id)
                    assert await session.get(CaseStudy, case_study_id) is None

                actions = set(
                    (
                        await session.scalars(
                            select(AuditLog.action).where(
                                AuditLog.resource_id == published.id
                            )
                        )
                    ).all()
                )
                assert actions == {"create", "update", "delete"}
        finally:
            if case_study_ids:
                async with database.session_factory() as cleanup_session:
                    await cleanup_session.execute(
                        delete(AuditLog).where(
                            AuditLog.resource_id.in_(case_study_ids)
                        )
                    )
                    await cleanup_session.execute(
                        delete(CaseStudy).where(
                            CaseStudy.id.in_(case_study_ids)
                        )
                    )
                    await cleanup_session.commit()
            await dispose_database(database)

    _run(exercise())
