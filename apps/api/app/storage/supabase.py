"""Shared asynchronous Supabase Storage gateway."""

from __future__ import annotations

from urllib.parse import quote, unquote, urlsplit

import httpx

from app.core.config import Settings


class StorageError(RuntimeError):
    """Raised when a Storage provider operation fails safely."""


class StorageConfigurationError(StorageError):
    """Raised when required server-side Storage settings are unavailable."""


class SupabaseStorageGateway:
    """Server-authorized access to the Supabase Storage HTTP API."""

    def __init__(self, settings: Settings, client: httpx.AsyncClient) -> None:
        if settings.supabase_url is None or settings.supabase_service_role_key is None:
            raise StorageConfigurationError("Storage is not configured.")

        self._origin = str(settings.supabase_url).rstrip("/")
        self._base_url = f"{self._origin}/storage/v1"
        self._client = client
        server_key = settings.supabase_service_role_key.get_secret_value()
        self._headers = {"apikey": server_key}
        # Current server keys are API keys, not JWTs. Legacy service-role JWTs
        # must additionally be supplied as a bearer token to bypass Storage RLS.
        if not server_key.startswith("sb_secret_"):
            self._headers["Authorization"] = f"Bearer {server_key}"

    async def upload(
        self,
        bucket: str,
        object_path: str,
        content: bytes,
        content_type: str,
    ) -> None:
        """Upload one new object; callers own all bucket/path selection."""

        await self._request(
            "POST",
            self._object_url(bucket, object_path),
            headers={
                **self._headers,
                "Content-Type": content_type,
                "cache-control": "3600",
                "x-upsert": "false",
            },
            content=content,
        )

    async def delete(self, bucket: str, object_path: str) -> None:
        """Delete one trusted object path from a configured bucket."""

        url = f"{self._base_url}/object/{quote(bucket, safe='')}"
        await self._request(
            "DELETE",
            url,
            headers=self._headers,
            json={"prefixes": [object_path]},
        )

    def public_url(self, bucket: str, object_path: str) -> str:
        """Return the canonical public URL for an already-public bucket."""

        return (
            f"{self._base_url}/object/public/{quote(bucket, safe='')}/"
            f"{quote(object_path, safe='/')}"
        )

    async def create_signed_url(
        self,
        bucket: str,
        object_path: str,
        expires_in: int,
    ) -> str:
        """Create a short-lived URL for a private object."""

        url = (
            f"{self._base_url}/object/sign/{quote(bucket, safe='')}/"
            f"{quote(object_path, safe='/')}"
        )
        response = await self._request(
            "POST",
            url,
            headers=self._headers,
            json={"expiresIn": expires_in},
        )
        try:
            signed_path = response.json()["signedURL"]
        except (KeyError, TypeError, ValueError) as error:
            raise StorageError("Private object access could not be created.") from error
        if not isinstance(signed_path, str) or not signed_path.startswith("/"):
            raise StorageError("Private object access could not be created.")
        return f"{self._base_url}{signed_path}"

    def managed_public_object_path(self, bucket: str, value: str) -> str | None:
        """Recover a path only from this project's exact public bucket URL."""

        candidate = urlsplit(value)
        expected = urlsplit(self.public_url(bucket, "sentinel"))
        prefix = expected.path.removesuffix("sentinel")
        if (
            candidate.scheme != expected.scheme
            or candidate.netloc != expected.netloc
            or candidate.query
            or candidate.fragment
            or not candidate.path.startswith(prefix)
        ):
            return None
        object_path = unquote(candidate.path[len(prefix) :])
        if not object_path or object_path.startswith("/") or ".." in object_path.split("/"):
            return None
        return object_path

    def _object_url(self, bucket: str, object_path: str) -> str:
        return (
            f"{self._base_url}/object/{quote(bucket, safe='')}/"
            f"{quote(object_path, safe='/')}"
        )

    async def _request(self, method: str, url: str, **kwargs: object) -> httpx.Response:
        try:
            response = await self._client.request(method, url, **kwargs)
            response.raise_for_status()
            return response
        except (httpx.HTTPError, OSError) as error:
            raise StorageError("Storage operation failed.") from error
