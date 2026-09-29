"""API contract tests for Team Member routes."""

from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from tests.auth_helpers import authenticate_test_admin

from app.api.dependencies.team_members import get_team_member_service
from app.core.config import Environment, Settings
from app.db.models.team_member import TeamMember
from app.main import create_app
from app.services.team_members import TeamMemberNotFoundError, TeamMemberService

MEMBER_ID = UUID("ce8e3179-52a8-4109-b5b4-1c8f896d10b1")
RESPONSE_FIELDS = {
    "id", "name", "role", "bio", "photo_url", "linkedin_url",
    "display_order", "member_type",
}


def _member(**overrides: object) -> TeamMember:
    values: dict[str, object] = {
        "id": MEMBER_ID,
        "name": "Jane Doe",
        "role": "CEO",
        "bio": "Jane leads Vyntics.",
        "photo_url": None,
        "linkedin_url": None,
        "display_order": 1,
        "member_type": "leadership",
    }
    values.update(overrides)
    return TeamMember(**values)


def _body(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "name": "Jane Doe",
        "role": "CEO",
        "bio": "Jane leads Vyntics.",
        "photo_url": None,
        "linkedin_url": None,
        "display_order": 1,
        "member_type": "leadership",
    }
    body.update(overrides)
    return body


@pytest.fixture
def team_api() -> tuple[TestClient, AsyncMock]:
    service = AsyncMock(spec=TeamMemberService)
    application = create_app(Settings(_env_file=None, environment=Environment.TEST))
    authenticate_test_admin(application)
    application.dependency_overrides[get_team_member_service] = lambda: service
    with TestClient(application) as client:
        yield client, service


def test_list_returns_envelope_exact_fields_and_nullable_urls(team_api) -> None:
    client, service = team_api
    service.list_all.return_value = [
        _member(display_order=1),
        _member(id=UUID("4f4ce1a4-fae2-4eec-85a4-ce1633e229b5"), display_order=2),
    ]

    response = client.get("/our-team")

    assert response.status_code == 200
    assert [item["display_order"] for item in response.json()["data"]] == [1, 2]
    assert all(set(item) == RESPONSE_FIELDS for item in response.json()["data"])
    assert response.json()["data"][0]["photo_url"] is None
    assert response.json()["data"][0]["linkedin_url"] is None
    service.list_all.assert_awaited_once_with()


def test_detail_returns_member_and_maps_missing_or_invalid_uuid(team_api) -> None:
    client, service = team_api
    service.get_by_id.return_value = _member()

    response = client.get(f"/our-team/{MEMBER_ID}")
    assert response.status_code == 200 and set(response.json()) == RESPONSE_FIELDS

    service.get_by_id.side_effect = TeamMemberNotFoundError
    missing = client.get(f"/our-team/{MEMBER_ID}")
    invalid = client.get("/our-team/not-a-uuid")
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Team member not found."}
    assert invalid.status_code == 422


def test_create_returns_201_shared_contract_and_has_no_admin_route(team_api) -> None:
    client, service = team_api
    service.create.return_value = _member()

    response = client.post("/our-team", json=_body())
    wrong_route = client.post("/admin/our-team", json=_body())

    assert response.status_code == 201 and set(response.json()) == RESPONSE_FIELDS
    assert wrong_route.status_code == 404
    service.create.assert_awaited_once()


@pytest.mark.parametrize(
    "body",
    [
        {"name": "   "},
        {"member_type": "contractor"},
        {"photo_url": "not-a-url"},
        {"is_visible": True},
        {"created_by": str(MEMBER_ID)},
        {"unknown": "field"},
    ],
)
def test_create_rejects_invalid_or_forbidden_input(team_api, body) -> None:
    client, service = team_api
    response = client.post("/our-team", json=_body(**body))
    assert response.status_code == 422
    service.create.assert_not_awaited()


def test_patch_returns_200_supports_null_url_and_maps_errors(team_api) -> None:
    client, service = team_api
    service.update.return_value = _member(photo_url=None)

    response = client.patch(f"/our-team/{MEMBER_ID}", json={"photo_url": None})
    assert response.status_code == 200 and response.json()["photo_url"] is None

    service.update.side_effect = TeamMemberNotFoundError
    missing = client.patch(f"/our-team/{MEMBER_ID}", json={"role": "CTO"})
    invalid = client.patch("/our-team/not-a-uuid", json={"role": "CTO"})
    assert missing.status_code == 404 and invalid.status_code == 422


@pytest.mark.parametrize("field", ["name", "role", "bio", "display_order", "member_type"])
def test_patch_rejects_null_required_fields(team_api, field: str) -> None:
    client, service = team_api
    response = client.patch(f"/our-team/{MEMBER_ID}", json={field: None})
    assert response.status_code == 422
    service.update.assert_not_awaited()


def test_delete_returns_empty_204_and_maps_errors(team_api) -> None:
    client, service = team_api
    deleted = client.delete(f"/our-team/{MEMBER_ID}")
    assert deleted.status_code == 204 and deleted.content == b""

    service.delete.side_effect = TeamMemberNotFoundError
    missing = client.delete(f"/our-team/{MEMBER_ID}")
    invalid = client.delete("/our-team/not-a-uuid")
    assert missing.status_code == 404 and invalid.status_code == 422


def test_photo_file_endpoints_upload_and_delete(team_api) -> None:
    client, service = team_api
    service.upload_photo.return_value = _member(
        photo_url="https://project/storage/team-photos/id/hash.webp"
    )
    uploaded = client.put(
        f"/our-team/{MEMBER_ID}/photo",
        files={"file": ("photo.webp", b"RIFF\x04\x00\x00\x00WEBPimage", "image/webp")},
    )
    assert uploaded.status_code == 200
    assert uploaded.json()["photo_url"].endswith("/id/hash.webp")

    deleted = client.delete(f"/our-team/{MEMBER_ID}/photo")
    assert deleted.status_code == 204 and deleted.content == b""


def test_openapi_exposes_exact_five_operations(team_api) -> None:
    client, _ = team_api
    paths = client.get("/openapi.json").json()["paths"]

    assert set(paths["/our-team"]) == {"get", "post"}
    assert set(paths["/our-team/{team_member_id}"]) == {"get", "patch", "delete"}
    assert set(paths["/our-team/{team_member_id}/photo"]) == {"put", "delete"}
    assert "/admin/our-team" not in paths
    assert "/admin/team" not in paths
