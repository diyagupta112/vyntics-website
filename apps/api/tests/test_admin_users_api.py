"""Superadmin-only Admin User list endpoint tests."""

from datetime import timedelta
from unittest.mock import MagicMock
from uuid import UUID

import pytest
from sqlalchemy.dialects import postgresql
from sqlalchemy.exc import SQLAlchemyError

from app.auth.supabase import InvalidAccessTokenError
from app.db.models.admin_user import AdminUser
from tests.test_auth import NOW, _admin, authenticated_api


AUTHORIZATION = {"Authorization": "Bearer valid-access-token"}
FIRST_ID = UUID("1193d394-af70-4a35-b1a9-538af7187392")
SECOND_ID = UUID("842fb067-8eb6-43d3-92e6-a61d9830cdb3")
EXPECTED_FIELDS = {"id", "email", "role", "is_active"}


def _listed_admin(
    *,
    admin_id: UUID,
    email: str,
    role: str,
    is_active: bool,
) -> AdminUser:
    return AdminUser(
        id=admin_id,
        auth_user_id=UUID(int=admin_id.int ^ 1),
        email=email,
        role=role,
        is_active=is_active,
        created_at=NOW,
        updated_at=NOW + timedelta(minutes=1),
    )


def _set_list_result(session, admins: list[AdminUser]) -> None:
    result = MagicMock()
    result.all.return_value = admins
    session.scalars.return_value = result


def test_superadmin_receives_active_and_inactive_admins_in_safe_contract(
    authenticated_api,
) -> None:
    client, _, session, _ = authenticated_api
    session.scalar.return_value = _admin(role="superadmin")
    admins = [
        _listed_admin(
            admin_id=FIRST_ID,
            email="a.admin@vyntics.com",
            role="superadmin",
            is_active=True,
        ),
        _listed_admin(
            admin_id=SECOND_ID,
            email="z.former@vyntics.com",
            role="admin",
            is_active=False,
        ),
    ]
    _set_list_result(session, admins)

    response = client.get("/admin/users", headers=AUTHORIZATION)

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": str(FIRST_ID),
            "email": "a.admin@vyntics.com",
            "role": "superadmin",
            "is_active": True,
        },
        {
            "id": str(SECOND_ID),
            "email": "z.former@vyntics.com",
            "role": "admin",
            "is_active": False,
        },
    ]
    assert all(set(item) == EXPECTED_FIELDS for item in response.json())
    assert response.json()[0]["id"] == str(admins[0].id)
    assert "auth_user_id" not in response.text
    assert "token" not in response.text.casefold()

    statement = session.scalars.await_args.args[0]
    sql = str(statement.compile(dialect=postgresql.dialect()))
    assert "ORDER BY admin_users.email ASC, admin_users.id ASC" in sql
    assert "WHERE" not in sql
    session.scalars.assert_awaited_once()


def test_empty_admin_table_returns_empty_list(authenticated_api) -> None:
    client, _, session, _ = authenticated_api
    session.scalar.return_value = _admin(role="superadmin")
    _set_list_result(session, [])

    response = client.get("/admin/users", headers=AUTHORIZATION)

    assert response.status_code == 200
    assert response.json() == []


def test_normal_admin_receives_403_without_list_query(authenticated_api) -> None:
    client, _, session, _ = authenticated_api
    session.scalar.return_value = _admin(role="admin")

    response = client.get("/admin/users", headers=AUTHORIZATION)

    assert response.status_code == 403
    assert response.json() == {"detail": "Insufficient permissions."}
    session.scalars.assert_not_awaited()


def test_unauthenticated_request_receives_401(authenticated_api) -> None:
    client, verifier, session, _ = authenticated_api

    response = client.get("/admin/users")

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
    verifier.verify.assert_not_awaited()
    session.scalars.assert_not_awaited()


@pytest.mark.parametrize("token", ["invalid-token", "expired-token"])
def test_invalid_or_expired_token_receives_401(
    authenticated_api,
    token: str,
) -> None:
    client, verifier, session, _ = authenticated_api
    verifier.verify.side_effect = InvalidAccessTokenError()

    response = client.get(
        "/admin/users",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401
    session.scalars.assert_not_awaited()


@pytest.mark.parametrize("admin_record", [None, _admin(is_active=False)])
def test_unmapped_or_inactive_admin_receives_401(
    authenticated_api,
    admin_record,
) -> None:
    client, _, session, _ = authenticated_api
    session.scalar.return_value = admin_record

    response = client.get("/admin/users", headers=AUTHORIZATION)

    assert response.status_code == 401
    session.scalars.assert_not_awaited()


def test_database_failure_returns_sanitized_503(authenticated_api) -> None:
    client, _, session, _ = authenticated_api
    session.scalar.return_value = _admin(role="superadmin")
    session.scalars.side_effect = SQLAlchemyError("secret database details")

    response = client.get("/admin/users", headers=AUTHORIZATION)

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Admin users are temporarily unavailable."
    }
    assert "secret" not in response.text


def test_openapi_exposes_only_authenticated_get(authenticated_api) -> None:
    client, _, _, _ = authenticated_api

    document = client.get("/openapi.json").json()
    operation = document["paths"]["/admin/users"]["get"]

    assert set(document["paths"]["/admin/users"]) == {"get"}
    assert operation["security"] == [{"HTTPBearer": []}]
    response_schema = operation["responses"]["200"]["content"][
        "application/json"
    ]["schema"]
    assert response_schema["type"] == "array"
    assert response_schema["items"] == {
        "$ref": "#/components/schemas/AdminUserListItem"
    }
    schema = document["components"]["schemas"]["AdminUserListItem"]
    assert set(schema["properties"]) == EXPECTED_FIELDS
    assert set(schema["required"]) == EXPECTED_FIELDS
