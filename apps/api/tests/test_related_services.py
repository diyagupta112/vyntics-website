"""Shared Blog/Case Study targeting contracts and SQL filtering."""

import asyncio
import json
from pathlib import Path
from typing import get_args
from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import ValidationError
from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.related_services import ServiceIdentifier
from tests.test_featured_content import RESOURCES, setup_service
from tests.test_blog_api import blog_api, _request_body as blog_body
from tests.test_case_study_api import case_study_api, _request_body as case_body

SERVICES = get_args(ServiceIdentifier)
TARGETS = [None, *SERVICES, "all"]


@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
@pytest.mark.parametrize("target", TARGETS)
def test_create_accepts_each_target(config, target):
    service, repository, audits, session, _ = setup_service(config)
    payload = config[6](status="draft").model_dump()
    payload["related_service"] = target
    created = asyncio.run(service.create(config[2](**payload)))
    assert created.related_service == target
    assert repository.add.await_args.args[0].related_service == target
    session.commit.assert_awaited_once()
    audits.add.assert_awaited_once()


@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
@pytest.mark.parametrize("before,after", [(None, SERVICES[0]), (SERVICES[0], SERVICES[1]), (SERVICES[1], "all"), ("all", None)])
def test_update_preserves_null_specific_all_transitions(config, before, after):
    service, repository, audits, session, existing = setup_service(config, status="draft")
    existing.related_service = before
    updated = asyncio.run(service.update(existing.id, config[3](related_service=after)))
    assert updated.related_service == after
    assert audits.add.await_args.args[0].context["changed_fields"] == ["related_service"]
    session.commit.assert_awaited_once()


@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
def test_omitted_target_patch_preserves_value(config):
    service, _, _, _, existing = setup_service(config, status="draft")
    existing.related_service = "all"
    result = asyncio.run(service.update(existing.id, config[3](title="New title")))
    assert result.related_service == "all"
    assert "related_service" not in config[3](title="New title").model_dump(exclude_unset=True)


@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
@pytest.mark.parametrize("invalid", ["Cloud Foundations", "cloud-foundations", "https://example.com", "unknown", "", ["all"]])
def test_unsupported_targets_rejected(config, invalid):
    payload = config[6](status="draft").model_dump()
    with pytest.raises(ValidationError):
        config[2](**{**payload, "related_service": invalid})
    with pytest.raises(ValidationError):
        config[3](related_service=invalid)


@pytest.mark.parametrize("config", RESOURCES, ids=["blogs", "case-studies"])
@pytest.mark.parametrize("service", SERVICES)
def test_repository_filter_is_sql_and_retains_public_order(config, service):
    session = AsyncMock(spec=AsyncSession)
    result = MagicMock()
    result.all.return_value = []
    session.scalars.return_value = result
    assert asyncio.run(config[0](session).list_published(related_service=service)) == []
    query = str(session.scalars.await_args.args[0].compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))
    table = "blogs" if config[7] == "blogs" else "case_studies"
    assert f"{table}.status = 'published'" in query
    assert f"{table}.related_service = '{service}' OR {table}.related_service = 'all'" in query
    assert f"ORDER BY {table}.published_at DESC" in query


@pytest.mark.parametrize("fixture_name,config,body", [("blog_api", RESOURCES[0], blog_body), ("case_study_api", RESOURCES[1], case_body)])
@pytest.mark.parametrize("service", SERVICES)
def test_public_filter_and_write_read_contract(request, fixture_name, config, body, service):
    client, mocked = request.getfixturevalue(fixture_name)
    model = config[5]()
    model.published_at = model.created_at
    model.related_service = service
    mocked.list_published.return_value = [model]
    response = client.get(f"/{config[7]}?related_service={service}")
    assert response.status_code == 200
    assert response.json()["data"][0]["related_service"] == service
    mocked.list_published.assert_awaited_once_with(related_service=service)
    mocked.create.return_value = model
    response = client.post(f"/{config[7]}", json=body(related_service=service))
    assert response.status_code == 201
    assert mocked.create.await_args.args[0].related_service == service
    assert response.json()["related_service"] == service
    mocked.update.return_value = model
    assert client.patch(f"/{config[7]}/{model.id}", json={"related_service": None}).status_code == 200
    assert mocked.update.await_args.args[1].model_dump(exclude_unset=True) == {"related_service": None}
    assert client.get(f"/{config[7]}?related_service=unknown").status_code == 422


def test_shared_frontend_values_match_backend_openapi():
    from app.core.config import Settings
    from app.main import create_app
    targets = json.loads((Path(__file__).resolve().parents[3] / "packages/types/src/related-services.json").read_text())
    assert set(targets) == {*SERVICES, "all"}
    schema = create_app(Settings(_env_file=None)).openapi()
    for resource in ("blogs", "case-studies"):
        parameter = next(p for p in schema["paths"][f"/{resource}"]["get"]["parameters"] if p["name"] == "related_service")
        assert set(parameter["schema"]["anyOf"][0]["enum"]) == set(SERVICES)
    for prefix in ("Blog", "CaseStudy"):
        for suffix in ("CreateRequest", "UpdateRequest", "ListItem", "DetailResponse", "AdminResponse"):
            field = schema["components"]["schemas"][prefix + suffix]["properties"]["related_service"]
            values = {item for option in field["anyOf"] for item in option.get("enum", [])}
            values.update(option["const"] for option in field["anyOf"] if "const" in option)
            assert values == set(targets)
            assert any(option.get("type") == "null" for option in field["anyOf"])
