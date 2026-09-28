"""Typed, environment-backed application settings."""

from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import AnyHttpUrl, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ENV_FILE = BACKEND_ROOT / ".env"


class Environment(str, Enum):
    """Supported application environments."""

    DEVELOPMENT = "development"
    TEST = "test"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Configuration loaded from process variables and ``apps/api/.env``."""

    model_config = SettingsConfigDict(
        env_file=BACKEND_ENV_FILE,
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
        case_sensitive=False,
        populate_by_name=True,
    )

    # Application
    environment: Environment = Field(
        default=Environment.DEVELOPMENT,
        validation_alias="APP_ENVIRONMENT",
    )
    app_name: str = Field(default="Vyntics API", validation_alias="APP_NAME")
    debug: bool = Field(default=False, validation_alias="APP_DEBUG")
    log_level: Literal["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG"] = Field(
        default="INFO",
        validation_alias="APP_LOG_LEVEL",
    )
    cors_origins: list[str] = Field(
        default_factory=list,
        validation_alias="APP_CORS_ORIGINS",
    )

    # Database
    database_url: SecretStr | None = Field(
        default=None,
        validation_alias="DATABASE_URL",
    )

    # Supabase
    supabase_url: AnyHttpUrl | None = Field(
        default=None,
        validation_alias="SUPABASE_URL",
    )
    supabase_anon_key: SecretStr | None = Field(
        default=None,
        validation_alias="SUPABASE_ANON_KEY",
    )
    supabase_service_role_key: SecretStr | None = Field(
        default=None,
        validation_alias="SUPABASE_SERVICE_ROLE_KEY",
    )
    supabase_project_id: str | None = Field(
        default=None,
        validation_alias="SUPABASE_PROJECT_ID",
    )

    # Authentication / security
    auth_allowed_email_domain: str = Field(
        default="vyntics.com",
        validation_alias="AUTH_ALLOWED_EMAIL_DOMAIN",
    )

    # Storage
    storage_provider: Literal["supabase"] = Field(
        default="supabase",
        validation_alias="STORAGE_PROVIDER",
    )
    blog_covers_bucket: str = Field(
        default="blog-covers",
        validation_alias="STORAGE_BLOG_COVERS_BUCKET",
    )
    case_study_covers_bucket: str = Field(
        default="case-study-covers",
        validation_alias="STORAGE_CASE_STUDY_COVERS_BUCKET",
    )
    team_photos_bucket: str = Field(
        default="team-photos",
        validation_alias="STORAGE_TEAM_PHOTOS_BUCKET",
    )
    job_resumes_bucket: str = Field(
        default="job-applications",
        validation_alias="STORAGE_JOB_RESUMES_BUCKET",
    )
    image_max_bytes: int = Field(
        default=5 * 1024 * 1024,
        gt=0,
        validation_alias="STORAGE_IMAGE_MAX_BYTES",
    )
    resume_signed_url_ttl_seconds: int = Field(
        default=300,
        gt=0,
        validation_alias="STORAGE_RESUME_SIGNED_URL_TTL_SECONDS",
    )
    resume_max_bytes: int = Field(
        default=10 * 1024 * 1024,
        gt=0,
        validation_alias="STORAGE_RESUME_MAX_BYTES",
    )

    # External integrations
    resend_api_key: SecretStr | None = Field(
        default=None,
        validation_alias="RESEND_API_KEY",
    )
    sentry_dsn: SecretStr | None = Field(
        default=None,
        validation_alias="SENTRY_DSN",
    )


@lru_cache
def get_settings() -> Settings:
    """Return one settings instance for the application process."""
    return Settings()

