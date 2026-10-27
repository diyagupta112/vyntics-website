"""Shared Blog/Case Study multi-service and multi-sub-service targeting contracts."""

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

SERVICES = list(get_args(ServiceIdentifier))
IDS = ["blogs", "case-studies"]
CASES = [
    ([], []),
    (["cloud_foundations"], []),
    (["cloud_foundations", "data_engineering"], []),
    ([], ["cloud_migration", "data_migration"]),
    (["cloud_foundations", "data_engineering"], ["cloud_migration", "data_migration"]),
    (SERVICES, []),
]


def _payload(config, **targets):
    return {**config[6](status="draft").model_dump(), **targets}


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
@pytest.mark.parametrize("services,subs", CASES)
def test_create_stores_service_and_sub_service_arrays(config, services, subs):
    service, repository, audits, session, _ = setup_service(config)
    created = asyncio.run(service.create(config[2](**_payload(config, related_services=services, related_sub_services=subs))))
    assert created.related_services == services and created.related_sub_services == subs
    stored = repository.add.await_args.args[0]
    assert stored.related_services == services and stored.related_sub_services == subs
    session.commit.assert_awaited_once()
    audits.add.assert_awaited_once()


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
def test_omitted_and_null_targets_mean_no_targeting(config):
    payload = {k: v for k, v in _payload(config).items() if not k.startswith("related_")}
    request = config[2](**payload)
    assert request.related_services == [] and request.related_sub_services == []
    request = config[2](**_payload(config, related_services=None, related_sub_services=None))
    assert request.related_services == [] and request.related_sub_services == []


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
def test_values_are_trimmed_deduplicated_and_keep_first_seen_order(config):
    request = config[2](**_payload(
        config,
        related_services=[" data_engineering ", "cloud_foundations", "data_engineering", "cloud_foundations"],
        related_sub_services=["data_migration", " cloud_migration", "data_migration"],
    ))
    assert request.related_services == ["data_engineering", "cloud_foundations"]
    assert request.related_sub_services == ["data_migration", "cloud_migration"]


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
@pytest.mark.parametrize("invalid", [
    ["all"], ["unknown"], ["Cloud Foundations"], ["cloud-foundations"], [""], [None], [5],
    "cloud_foundations", "cloud_foundations,data_engineering", ["cloud_foundations,data_engineering"], "all", 5,
])
def test_invalid_service_values_are_rejected(config, invalid):
    with pytest.raises(ValidationError):
        config[2](**_payload(config, related_services=invalid))
    with pytest.raises(ValidationError):
        config[3](related_services=invalid)


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
@pytest.mark.parametrize("invalid", [
    ["Cloud Migration"], ["cloud-migration"], ["cloud__migration"], ["_cloud"], ["cloud_"], [""], ["   "], [None], [5],
    ["x" * 101], "cloud_migration", "cloud_migration,data_migration", ["cloud_migration,data_migration"],
    [f"sub_{i}" for i in range(51)],
])
def test_invalid_sub_service_values_are_rejected(config, invalid):
    with pytest.raises(ValidationError):
        config[2](**_payload(config, related_sub_services=invalid))
    with pytest.raises(ValidationError):
        config[3](related_sub_services=invalid)


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
def test_legacy_single_value_field_is_rejected(config):
    with pytest.raises(ValidationError):
        config[2](**_payload(config, related_service="cloud_foundations"))
    with pytest.raises(ValidationError):
        config[3](related_service="cloud_foundations")


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
@pytest.mark.parametrize("before,after", [
    ([], ["cloud_foundations"]),
    (["cloud_foundations"], ["cloud_foundations", "data_engineering"]),
    (["cloud_foundations", "data_engineering"], ["data_engineering"]),
    (["cloud_foundations", "data_engineering"], []),
])
def test_update_changes_and_removes_service_assignments(config, before, after):
    service, _, audits, session, existing = setup_service(config, status="draft")
    existing.related_services = list(before)
    updated = asyncio.run(service.update(existing.id, config[3](related_services=after)))
    assert updated.related_services == after
    assert audits.add.await_args.args[0].context["changed_fields"] == ["related_services"]
    session.commit.assert_awaited_once()


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
def test_update_sub_services_and_explicit_null_clears(config):
    service, _, audits, _, existing = setup_service(config, status="draft")
    existing.related_sub_services = ["cloud_migration"]
    updated = asyncio.run(service.update(existing.id, config[3](related_sub_services=["cloud_migration", "data_migration"])))
    assert updated.related_sub_services == ["cloud_migration", "data_migration"]
    assert audits.add.await_args.args[0].context["changed_fields"] == ["related_sub_services"]
    cleared = asyncio.run(service.update(existing.id, config[3](related_sub_services=None)))
    assert cleared.related_sub_services == []
    assert config[3](related_sub_services=None).model_dump(exclude_unset=True) == {"related_sub_services": []}


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
def test_omitted_targets_in_patch_are_preserved(config):
    service, _, _, _, existing = setup_service(config, status="draft")
    existing.related_services = ["cloud_foundations", "data_engineering"]
    existing.related_sub_services = ["cloud_migration"]
    result = asyncio.run(service.update(existing.id, config[3](title="New title")))
    assert result.related_services == ["cloud_foundations", "data_engineering"]
    assert result.related_sub_services == ["cloud_migration"]
    assert config[3](title="New title").model_dump(exclude_unset=True) == {"title": "New title"}


def _query(config, **filters):
    session = AsyncMock(spec=AsyncSession)
    result = MagicMock()
    result.all.return_value = []
    session.scalars.return_value = result
    assert asyncio.run(config[0](session).list_published(**filters)) == []
    return str(session.scalars.await_args.args[0].compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
@pytest.mark.parametrize("service", SERVICES)
def test_service_filter_is_array_containment_and_keeps_published_order(config, service):
    table = "blogs" if config[7] == "blogs" else "case_studies"
    query = _query(config, related_service=service)
    assert f"{table}.status = 'published'" in query
    assert f"{table}.related_services @> ARRAY['{service}']" in query
    where = query.split("WHERE", 1)[1]
    assert "related_sub_services" not in where and "'all'" not in where
    assert f"ORDER BY {table}.published_at DESC" in query


@pytest.mark.parametrize("config", RESOURCES, ids=IDS)
def test_sub_service_and_combined_filters_and_unfiltered_query(config):
    table = "blogs" if config[7] == "blogs" else "case_studies"
    assert f"{table}.related_sub_services @> ARRAY['cloud_migration']" in _query(config, related_sub_service="cloud_migration")
    both = _query(config, related_service="cloud_foundations", related_sub_service="cloud_migration")
    assert "related_services @> ARRAY['cloud_foundations']" in both and "related_sub_services @> ARRAY['cloud_migration']" in both
    plain = _query(config)
    assert "@>" not in plain and f"{table}.status = 'published'" in plain


@pytest.mark.parametrize("fixture_name,config,body", [("blog_api", RESOURCES[0], blog_body), ("case_study_api", RESOURCES[1], case_body)])
def test_http_filters_and_write_read_contract(request, fixture_name, config, body):
    client, mocked = request.getfixturevalue(fixture_name)
    model = config[5]()
    model.published_at = model.created_at
    model.related_services = ["cloud_foundations", "data_engineering"]
    model.related_sub_services = ["cloud_migration", "data_migration"]
    mocked.list_published.return_value = [model]
    path = f"/{config[7]}"
    for query, expected in [
        ("", {}),
        ("?related_service=cloud_foundations", {"related_service": "cloud_foundations"}),
        ("?related_service=data_engineering", {"related_service": "data_engineering"}),
        ("?related_sub_service=data_migration", {"related_sub_service": "data_migration"}),
        ("?related_service=cloud_foundations&related_sub_service=cloud_migration",
         {"related_service": "cloud_foundations", "related_sub_service": "cloud_migration"}),
    ]:
        response = client.get(path + query)
        assert response.status_code == 200
        item = response.json()["data"][0]
        assert item["related_services"] == ["cloud_foundations", "data_engineering"]
        assert item["related_sub_services"] == ["cloud_migration", "data_migration"]
        assert "related_service" not in item
        mocked.list_published.assert_awaited_with(**expected)
    for bad in ("?related_service=unknown", "?related_service=all", "?related_sub_service=Cloud%20Migration", "?related_sub_service="):
        assert client.get(path + bad).status_code == 422

    mocked.create.return_value = model
    response = client.post(path, json=body(related_services=["cloud_foundations", "data_engineering"], related_sub_services=["cloud_migration", "data_migration"]))
    assert response.status_code == 201
    created = mocked.create.await_args.args[0]
    assert created.related_services == ["cloud_foundations", "data_engineering"]
    assert created.related_sub_services == ["cloud_migration", "data_migration"]
    assert response.json()["related_services"] == ["cloud_foundations", "data_engineering"]
    assert client.post(path, json=body(related_service="cloud_foundations")).status_code == 422
    assert client.post(path, json=body(related_services="cloud_foundations,data_engineering")).status_code == 422

    mocked.update.return_value = model
    assert client.patch(f"{path}/{model.id}", json={"related_services": None, "related_sub_services": []}).status_code == 200
    assert mocked.update.await_args.args[1].model_dump(exclude_unset=True) == {"related_services": [], "related_sub_services": []}


def test_shared_service_keys_and_openapi_contract():
    from app.core.config import Settings
    from app.main import create_app

    shared = json.loads((Path(__file__).resolve().parents[3] / "packages/types/src/related-services.json").read_text())
    # The shared Admin/website list may still carry the retired "all"; every real service must be present.
    assert set(SERVICES) <= set(shared)
    schema = create_app(Settings(_env_file=None)).openapi()
    for resource in ("blogs", "case-studies"):
        parameters = {p["name"]: p for p in schema["paths"][f"/{resource}"]["get"]["parameters"]}
        assert set(parameters) == {"related_service", "related_sub_service"}
        assert set(parameters["related_service"]["schema"]["anyOf"][0]["enum"]) == set(SERVICES)
    for prefix in ("Blog", "CaseStudy"):
        for suffix in ("CreateRequest", "UpdateRequest", "ListItem", "DetailResponse", "AdminResponse"):
            properties = schema["components"]["schemas"][prefix + suffix]["properties"]
            assert "related_service" not in properties
            for name in ("related_services", "related_sub_services"):
                options = properties[name].get("anyOf", [properties[name]])
                assert any(option.get("type") == "array" for option in options)
