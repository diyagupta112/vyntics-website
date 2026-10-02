"""Phase 15 current-admin identity endpoint tests."""

import pytest

from app.auth.supabase import InvalidAccessTokenError
from tests.test_auth import (
    ADMIN_ID,
    AUTH_USER_ID,
    NOW,
    _admin,
    authenticated_api,
)


AUTHORIZATION = {"Authorization": "Bearer valid-access-token"}
EXPECTED_FIELDS = {
    "id",
    "auth_user_id",
    "email",
    "role",
    "is_active",
    "created_at",
    "updated_at",
}


@pytest.mark.parametrize(
    ("headers", "verifier_error", "admin_record"),
    [
        ({}, None, _admin()),
        (
            {"Authorization": "Bearer invalid-token"},
            InvalidAccessTokenError(),
            _admin(),
        ),
        (
            {"Authorization": "Bearer expired-token"},
            InvalidAccessTokenError(),
            _admin(),
        ),
        (AUTHORIZATION, None, None),
        (AUTHORIZATION, None, _admin(is_active=False)),
    ],
    ids=[
        "missing-token",
        "invalid-token",
        "expired-token",
        "unmapped-user",
        "inactive-admin",
    ],
)
def test_current_admin_rejects_invalid_authentication_states(
    authenticated_api,
    headers: dict[str, str],
    verifier_error: Exception | None,
    admin_record,
) -> None:
    client, verifier, session, _ = authenticated_api
    if verifier_error is not None:
        verifier.verify.side_effect = verifier_error
    session.scalar.return_value = admin_record

    response = client.get("/admin/me", headers=headers)

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


@pytest.mark.parametrize("role", ["admin", "superadmin"])
def test_current_admin_returns_exact_database_identity_for_both_roles(
    authenticated_api,
    role: str,
) -> None:
    client, verifier, session, _ = authenticated_api
    session.scalar.return_value = _admin(role=role)

    response = client.get("/admin/me", headers=AUTHORIZATION)

    assert response.status_code == 200
    assert response.json() == {
        "id": str(ADMIN_ID),
        "auth_user_id": str(AUTH_USER_ID),
        "email": "database-admin@vyntics.com",
        "role": role,
        "is_active": True,
        "created_at": NOW.isoformat().replace("+00:00", "Z"),
        "updated_at": NOW.isoformat().replace("+00:00", "Z"),
    }
    assert set(response.json()) == EXPECTED_FIELDS
    verifier.verify.assert_awaited_once_with("valid-access-token")
    session.scalar.assert_awaited_once()


def test_current_admin_ignores_client_identity_and_role_hints(
    authenticated_api,
) -> None:
    client, _, session, _ = authenticated_api
    session.scalar.return_value = _admin(role="admin")

    response = client.get(
        "/admin/me",
        params={
            "admin_id": "00000000-0000-0000-0000-000000000000",
            "auth_user_id": "00000000-0000-0000-0000-000000000000",
            "email": "attacker@example.com",
            "role": "superadmin",
        },
        headers={
            **AUTHORIZATION,
            "X-Admin-Id": "00000000-0000-0000-0000-000000000000",
            "X-Admin-Role": "superadmin",
        },
    )

    assert response.status_code == 200
    assert response.json()["id"] == str(ADMIN_ID)
    assert response.json()["auth_user_id"] == str(AUTH_USER_ID)
    assert response.json()["email"] == "database-admin@vyntics.com"
    assert response.json()["role"] == "admin"


def test_current_admin_has_no_mutation_or_identity_path_routes(
    authenticated_api,
) -> None:
    client, _, _, _ = authenticated_api

    assert client.post("/admin/me", headers=AUTHORIZATION).status_code == 405
    assert (
        client.get(f"/admin/me/{ADMIN_ID}", headers=AUTHORIZATION).status_code
        == 404
    )


def test_current_admin_response_excludes_authentication_secrets(
    authenticated_api,
) -> None:
    client, _, _, _ = authenticated_api

    response = client.get("/admin/me", headers=AUTHORIZATION)

    assert response.status_code == 200
    assert set(response.json()) == EXPECTED_FIELDS
    serialized = response.text.casefold()
    for secret_name in (
        "access_token",
        "refresh_token",
        "password",
        "service_role",
        "supabase_email",
    ):
        assert secret_name not in serialized


def test_current_admin_openapi_contract(authenticated_api) -> None:
    client, _, _, _ = authenticated_api

    document = client.get("/openapi.json").json()
    operation = document["paths"]["/admin/me"]["get"]

    assert set(document["paths"]["/admin/me"]) == {"get"}
    assert operation["security"] == [{"HTTPBearer": []}]
    assert operation.get("parameters", []) == []
    assert operation["responses"]["200"]["content"]["application/json"][
        "schema"
    ] == {"$ref": "#/components/schemas/CurrentAdminResponse"}
    schema = document["components"]["schemas"]["CurrentAdminResponse"]
    assert set(schema["properties"]) == EXPECTED_FIELDS
    assert set(schema["required"]) == EXPECTED_FIELDS
