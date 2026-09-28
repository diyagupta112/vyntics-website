"""Shared Supabase Storage gateway contract tests."""

import asyncio

import httpx
import pytest
from fastapi.testclient import TestClient

from app.core.config import Environment, Settings
from app.main import create_app
from app.storage.supabase import StorageError, SupabaseStorageGateway


def _settings(key: str) -> Settings:
    return Settings(
        _env_file=None,
        debug=False,
        supabase_url="https://project.supabase.co",
        supabase_service_role_key=key,
    )


def test_gateway_upload_delete_public_and_signed_url_contracts() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        if "/object/sign/" in str(request.url):
            return httpx.Response(200, json={"signedURL": "/signed/file?token=x"})
        return httpx.Response(200, json={})

    async def exercise() -> tuple[str, str | None]:
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            gateway = SupabaseStorageGateway(_settings("eyJlegacy"), client)
            await gateway.upload("blog-covers", "id/hash.jpg", b"image", "image/jpeg")
            public = gateway.public_url("blog-covers", "id/hash.jpg")
            managed = gateway.managed_public_object_path("blog-covers", public)
            signed = await gateway.create_signed_url(
                "job-applications", "id/hash.pdf", 300
            )
            await gateway.delete("blog-covers", "id/hash.jpg")
            return signed, managed

    signed, managed = asyncio.run(exercise())
    assert managed == "id/hash.jpg"
    assert signed == "https://project.supabase.co/storage/v1/signed/file?token=x"
    assert [request.method for request in requests] == ["POST", "POST", "DELETE"]
    assert requests[0].headers["apikey"] == "eyJlegacy"
    assert requests[0].headers["authorization"] == "Bearer eyJlegacy"
    assert requests[0].headers["x-upsert"] == "false"


def test_current_server_key_uses_apikey_and_external_urls_are_not_managed() -> None:
    async def exercise() -> tuple[httpx.Request, SupabaseStorageGateway]:
        captured: list[httpx.Request] = []

        def handler(request: httpx.Request) -> httpx.Response:
            captured.append(request)
            return httpx.Response(200, json={})

        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            gateway = SupabaseStorageGateway(_settings("sb_secret_server"), client)
            await gateway.delete("team-photos", "id/hash.webp")
            return captured[0], gateway

    request, gateway = asyncio.run(exercise())
    assert request.headers["apikey"] == "sb_secret_server"
    assert "authorization" not in request.headers
    assert gateway.managed_public_object_path(
        "team-photos", "https://example.com/id/hash.webp"
    ) is None
    assert gateway.managed_public_object_path(
        "team-photos",
        "https://project.supabase.co/storage/v1/object/public/blog-covers/id/hash.webp",
    ) is None


def test_gateway_wraps_provider_errors_without_leaking_body() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(403, text="secret provider response")

    async def exercise() -> None:
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            gateway = SupabaseStorageGateway(_settings("sb_secret_server"), client)
            await gateway.delete("team-photos", "id/hash.webp")

    with pytest.raises(StorageError) as raised:
        asyncio.run(exercise())
    assert "secret provider response" not in str(raised.value)


def test_application_lifespan_owns_storage_gateway_client() -> None:
    settings = _settings("sb_secret_server").model_copy(
        update={"environment": Environment.TEST, "database_url": None}
    )
    application = create_app(settings)
    assert application.state.storage_gateway is None

    with TestClient(application) as client:
        assert client.get("/health").status_code == 200
        assert isinstance(
            application.state.storage_gateway,
            SupabaseStorageGateway,
        )

    assert application.state.storage_gateway is None
