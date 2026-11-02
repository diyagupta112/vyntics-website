"""Opt-in API entry point: uvicorn app.sitemap_main:app."""

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.config import BACKEND_ENV_FILE
from app.main import app as original_app
from app.sitemap_addon import SitemapNotifier, SitemapRefreshMiddleware


class SitemapSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ENV_FILE,
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    next_public_site_url: str
    sitemap_revalidation_secret: SecretStr


settings = SitemapSettings()
app = SitemapRefreshMiddleware(
    original_app,
    SitemapNotifier(
        settings.next_public_site_url,
        settings.sitemap_revalidation_secret.get_secret_value(),
    ),
)
