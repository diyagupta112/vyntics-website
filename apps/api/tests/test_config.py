"""Tests for environment-backed application settings."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import Environment, Settings
from app.main import create_app


def test_database_url_loads_from_dotenv_without_exposing_secret(
    monkeypatch,
) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    env_file = Path(__file__).resolve().parents[1] / ".env.example"

    settings = Settings(_env_file=env_file)

    assert settings.database_url is not None
    assert settings.database_url.get_secret_value().startswith(
        "postgresql+psycopg://"
    )
    assert "PASSWORD" not in repr(settings)


def test_settings_load_from_environment(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENVIRONMENT", "test")
    monkeypatch.setenv("APP_NAME", "Configured Vyntics API")
    monkeypatch.setenv("APP_DEBUG", "true")
    monkeypatch.setenv("APP_LOG_LEVEL", "DEBUG")
    monkeypatch.setenv(
        "APP_CORS_ORIGINS",
        '["http://localhost:3000","http://localhost:3001"]',
    )
    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql://example:secret@localhost:5432/vyntics",
    )
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "example-anon-key")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "example-service-key")
    monkeypatch.setenv("SUPABASE_PROJECT_ID", "example-project")
    monkeypatch.setenv("AUTH_ALLOWED_EMAIL_DOMAIN", "vyntics.com")
    monkeypatch.setenv("STORAGE_PROVIDER", "supabase")
    monkeypatch.setenv("STORAGE_BLOG_COVERS_BUCKET", "blog-covers")
    monkeypatch.setenv("STORAGE_CASE_STUDY_COVERS_BUCKET", "case-study-covers")
    monkeypatch.setenv("STORAGE_TEAM_PHOTOS_BUCKET", "team-photos")
    monkeypatch.setenv("STORAGE_BADGE_LOGOS_BUCKET", "badge-logos")
    monkeypatch.setenv("STORAGE_JOB_RESUMES_BUCKET", "job-applications")
    monkeypatch.setenv("STORAGE_IMAGE_MAX_BYTES", "5242880")
    monkeypatch.setenv("STORAGE_RESUME_MAX_BYTES", "10485760")
    monkeypatch.setenv("RESEND_API_KEY", "example-resend-key")
    monkeypatch.setenv("SENTRY_DSN", "https://example@sentry.invalid/1")

    settings = Settings(_env_file=None)

    assert settings.environment is Environment.TEST
    assert settings.app_name == "Configured Vyntics API"
    assert settings.debug is True
    assert settings.log_level == "DEBUG"
    assert settings.cors_origins == [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    assert settings.database_url is not None
    assert settings.database_url.get_secret_value().startswith("postgresql://")
    assert str(settings.supabase_url) == "https://example.supabase.co/"
    assert settings.supabase_anon_key is not None
    assert settings.supabase_service_role_key is not None
    assert settings.supabase_project_id == "example-project"
    assert settings.auth_allowed_email_domain == "vyntics.com"
    assert settings.storage_provider == "supabase"
    assert settings.blog_covers_bucket == "blog-covers"
    assert settings.case_study_covers_bucket == "case-study-covers"
    assert settings.team_photos_bucket == "team-photos"
    assert settings.badge_logos_bucket == "badge-logos"
    assert settings.job_resumes_bucket == "job-applications"
    assert settings.image_max_bytes == 5 * 1024 * 1024
    assert settings.resume_signed_url_ttl_seconds == 300
    assert settings.resume_max_bytes == 10 * 1024 * 1024
    assert settings.resend_api_key is not None
    assert settings.sentry_dsn is not None
    assert "example-service-key" not in repr(settings)
    assert "example-anon-key" not in repr(settings)
    assert "example-resend-key" not in repr(settings)


def test_app_uses_injected_settings_for_cors() -> None:
    settings = Settings(
        _env_file=None,
        environment=Environment.TEST,
        cors_origins=["http://localhost:3000"],
    )
    client = TestClient(create_app(settings))

    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == (
        "http://localhost:3000"
    )


@pytest.mark.parametrize("variable", ["CORS_ORIGINS", "APP_CORS_ORIGINS"])
@pytest.mark.parametrize("origin", ["https://example.com", "https://another-example.com"])
def test_environment_origins_reach_contact_preflight(monkeypatch, variable, origin):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.delenv("APP_CORS_ORIGINS", raising=False)
    monkeypatch.setenv(variable, f' [ "{origin}" ] ')
    settings = Settings(_env_file=None)
    assert settings.cors_origins == [origin]
    app = create_app(settings)
    middleware = next(m for m in app.user_middleware if m.cls.__name__ == "CORSMiddleware")
    assert middleware.kwargs["allow_origins"] == [origin]
    client = TestClient(app)
    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    response = client.options("/contact-us", headers=headers)
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin
    assert "content-type" in response.headers["access-control-allow-headers"]
    response = client.options("/contact-us", headers={**headers, "Origin": "https://unlisted.example"})
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_cors_origins_takes_precedence_over_legacy_alias(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", '["https://example.com"]')
    monkeypatch.setenv("APP_CORS_ORIGINS", '["https://legacy.example"]')
    assert Settings(_env_file=None).cors_origins == ["https://example.com"]


def test_cors_matches_exact_hosts_from_json_array(monkeypatch):
    monkeypatch.setenv(
        "CORS_ORIGINS",
        '["https://first.example.com", "https://website.example.com"]',
    )
    settings = Settings(_env_file=None)
    assert settings.cors_origins == ["https://first.example.com", "https://website.example.com"]
    client = TestClient(create_app(settings))
    for origin, expected in [
        ("https://first.example.com", 200),
        ("https://website.example.com", 200),
        ("https://website-example.com", 400),
    ]:
        response = client.options("/contact-us", headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        })
        assert response.status_code == expected
        assert response.headers.get("access-control-allow-origin") == (
            origin if expected == 200 else None
        )
