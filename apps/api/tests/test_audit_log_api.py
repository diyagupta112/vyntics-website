"""Audit read contracts using the existing authentication test architecture."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.api.dependencies.audit_logs import get_audit_log_service
from app.auth.supabase import InvalidAccessTokenError
from app.db.models.audit_log import AuditLog
from app.schemas.audit_logs import AuditLogDetail, AuditLogListResponse
from app.services.audit_logs import AuditLogNotFoundError, AuditLogService
from tests.test_auth import authenticated_api, _admin, ADMIN_ID, RESOURCE_ID

PATH = "/admin/audit-logs"
HEADERS = {"Authorization": "Bearer valid-access-token"}
NOW = datetime(2026, 10, 1, tzinfo=timezone.utc)


@pytest.fixture
def audit_api(authenticated_api):
    client, verifier, session, _ = authenticated_api
    session.scalar.return_value = _admin(role="superadmin")
    service = AsyncMock(spec=AuditLogService)
    service.list_page.return_value = AuditLogListResponse(
        items=[], page=1, page_size=25, total=0
    )
    service.get_by_id.return_value = AuditLog(
        id=RESOURCE_ID, actor_id=ADMIN_ID, actor_email="admin@vyntics.com",
        action="update", resource_type="blog", resource_id=RESOURCE_ID,
        context={"changed_fields": ["status"], "nested": {"ok": True, "old": None}},
        created_at=NOW,
    )
    client.app.dependency_overrides[get_audit_log_service] = lambda: service
    return client, verifier, session, service


@pytest.mark.parametrize("path", [PATH, f"{PATH}/{RESOURCE_ID}"])
@pytest.mark.parametrize("identity", ["missing", "invalid", "expired", "unmapped", "inactive", "admin", "superadmin"])
def test_authorization(audit_api, path, identity):
    client, verifier, session, service = audit_api
    headers = HEADERS.copy()
    expected = 401
    if identity == "missing":
        headers = {}
    elif identity in {"invalid", "expired"}:
        verifier.verify.side_effect = InvalidAccessTokenError()
    elif identity == "unmapped":
        session.scalar.return_value = None
    elif identity == "inactive":
        session.scalar.return_value = _admin(role="superadmin", is_active=False)
    elif identity == "admin":
        session.scalar.return_value = _admin()
        expected = 403
    else:
        expected = 200
    response = client.get(path, headers=headers)
    assert response.status_code == expected
    if expected != 200:
        service.list_page.assert_not_awaited()
        service.get_by_id.assert_not_awaited()
    if expected == 401:
        assert response.headers["www-authenticate"] == "Bearer"


@pytest.mark.parametrize("path", [PATH, f"{PATH}/{RESOURCE_ID}"])
def test_frontend_identity_cannot_override_role(audit_api, path):
    client, _, session, service = audit_api
    session.scalar.return_value = _admin()
    response = client.get(path, headers={**HEADERS, "X-Admin-Role": "superadmin"}, params={
        "role": "superadmin", "actor_id": str(ADMIN_ID),
        "admin_user_id": str(ADMIN_ID), "email": "superadmin@vyntics.com",
    })
    assert response.status_code == 403
    service.list_page.assert_not_awaited()
    service.get_by_id.assert_not_awaited()


def test_list_defaults_and_combined_filter_forwarding(audit_api):
    client, _, _, service = audit_api
    response = client.get(PATH, headers=HEADERS)
    assert response.json() == {"items": [], "page": 1, "page_size": 25, "total": 0}
    response = client.get(PATH, headers=HEADERS, params={
        "page": 2, "page_size": 10, "actor_id": str(ADMIN_ID),
        "action": "update", "resource_type": "blog", "resource_id": str(RESOURCE_ID),
        "from": NOW.isoformat(), "to": NOW.isoformat(),
    })
    assert response.status_code == 200
    assert service.list_page.await_args.kwargs == {
        "page": 2, "page_size": 10, "actor_id": ADMIN_ID, "action": "update",
        "resource_type": "blog", "resource_id": RESOURCE_ID,
        "from_time": NOW, "to_time": NOW,
    }


@pytest.mark.parametrize("params", [
    {"page": 0}, {"page": "bad"}, {"page_size": 0}, {"page_size": 101},
    {"page_size": -1}, {"actor_id": "bad"}, {"resource_id": "bad"},
    {"from": "bad"}, {"to": "bad"}, {"from": "2026-10-01T12:00:00"},
    {"from": "2026-10-02T00:00:00Z", "to": "2026-10-01T00:00:00Z"},
    {"action": ""}, {"resource_type": ""},
])
def test_invalid_queries(audit_api, params):
    client, _, _, service = audit_api
    assert client.get(PATH, headers=HEADERS, params=params).status_code == 422
    service.list_page.assert_not_awaited()


def test_detail_exact_stored_fields_and_structured_json(audit_api):
    client, _, _, service = audit_api
    record = service.get_by_id.return_value
    record.access_token = record.refresh_token = record.password_hash = "must-not-leak"
    response = client.get(f"{PATH}/{RESOURCE_ID}", headers=HEADERS)
    assert response.status_code == 200
    assert response.json() == AuditLogDetail.model_validate(record).model_dump(mode="json")
    assert set(response.json()) == {
        "id", "actor_id", "actor_email", "action", "resource_type",
        "resource_id", "context", "created_at",
    }
    assert "must-not-leak" not in response.text
    assert response.json()["context"]["nested"] == {"ok": True, "old": None}
    service.get_by_id.assert_awaited_once_with(RESOURCE_ID)
    record.actor_id = record.actor_email = record.resource_id = None
    assert client.get(f"{PATH}/{RESOURCE_ID}", headers=HEADERS).json()["actor_id"] is None


def test_missing_and_invalid_detail(audit_api):
    client, _, _, service = audit_api
    service.get_by_id.side_effect = AuditLogNotFoundError()
    response = client.get(f"{PATH}/{RESOURCE_ID}", headers=HEADERS)
    assert response.status_code == 404
    assert response.json() == {"detail": "Audit Log not found."}
    assert client.get(f"{PATH}/bad", headers=HEADERS).status_code == 422


@pytest.mark.parametrize("path,method", [(PATH, "list_page"), (f"{PATH}/{RESOURCE_ID}", "get_by_id")])
def test_database_errors_are_sanitized(audit_api, path, method):
    client, _, _, service = audit_api
    getattr(service, method).side_effect = SQLAlchemyError("private SQL credentials")
    response = client.get(path, headers=HEADERS)
    assert response.status_code == 503
    assert response.json() == {"detail": "Audit logs are temporarily unavailable."}


def test_openapi_read_only_security_parameters_and_startup(audit_api):
    client, _, _, _ = audit_api
    assert client.get("/health").status_code == 200
    schema = client.get("/openapi.json").json()
    for path in (PATH, f"{PATH}/{{audit_log_id}}"):
        assert set(schema["paths"][path]) == {"get"}
        assert schema["paths"][path]["get"]["security"] == [{"HTTPBearer": []}]
    assert {p["name"] for p in schema["paths"][PATH]["get"]["parameters"]} == {
        "page", "page_size", "actor_id", "action", "resource_type", "resource_id", "from", "to",
    }
    for method in ("post", "put", "patch", "delete"):
        assert client.request(method, PATH, headers=HEADERS).status_code == 405
        assert client.request(method, f"{PATH}/{RESOURCE_ID}", headers=HEADERS).status_code == 405
