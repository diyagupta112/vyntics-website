"""CORS behavior for local Admin Panel origins and configured production origins."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import Environment, Settings
from app.main import create_app

LOCAL = ["http://localhost:3000", "http://localhost:3001"]
PRODUCTION = "https://admin.example.com"


def client(origins):
    settings = Settings(_env_file=None, environment=Environment.TEST, debug=False, cors_origins=origins)
    return TestClient(create_app(settings), raise_server_exceptions=False)


@pytest.mark.parametrize("origin", [*LOCAL, PRODUCTION])
def test_configured_origins_get_credentialed_cors_headers(origin):
    with client([*LOCAL, PRODUCTION]) as api:
        for path, status in [("/health", 200), ("/admin/contact-submissions", 401)]:
            response = api.get(path, headers={"Origin": origin})
            assert response.status_code == status
            assert response.headers["access-control-allow-origin"] == origin
            assert response.headers["access-control-allow-credentials"] == "true"


@pytest.mark.parametrize("origin", LOCAL)
def test_preflight_for_admin_endpoint_allows_authorization(origin):
    with client(LOCAL) as api:
        response = api.options(
            "/admin/contact-submissions",
            headers={"Origin": origin, "Access-Control-Request-Method": "GET",
                     "Access-Control-Request-Headers": "authorization"},
        )
        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == origin


def test_unlisted_origin_is_rejected_and_never_wildcarded():
    with client(LOCAL) as api:
        response = api.get("/health", headers={"Origin": "https://evil.example"})
        assert "access-control-allow-origin" not in response.headers
        assert "*" not in response.headers.get("access-control-allow-origin", "")
