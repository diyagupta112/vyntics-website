"""Supabase Auth access-token verification."""

from typing import Protocol
from uuid import UUID

import httpx

from app.auth.models import SupabaseIdentity
from app.core.config import Settings


class AuthConfigurationError(RuntimeError):
    """Raised when server-side Supabase Auth configuration is unavailable."""


class InvalidAccessTokenError(ValueError):
    """Raised when Supabase rejects an access token or identity payload."""


class AuthServiceUnavailableError(RuntimeError):
    """Raised when Supabase Auth cannot complete token verification."""


class AccessTokenVerifier(Protocol):
    """Interface used by the FastAPI authentication dependency."""

    async def verify(self, token: str) -> SupabaseIdentity:
        """Verify a token and return only the required identity fields."""


class SupabaseTokenVerifier:
    """Verify bearer tokens through Supabase Auth's authenticated-user API."""

    def __init__(
        self,
        settings: Settings,
        *,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self._settings = settings
        self._client = client
        self._owns_client = client is None

    async def verify(self, token: str) -> SupabaseIdentity:
        """Ask Supabase Auth to verify the token and return its user identity."""

        if (
            self._settings.supabase_url is None
            or self._settings.supabase_anon_key is None
        ):
            raise AuthConfigurationError("Supabase Auth is not configured.")

        client = self._client
        if client is None:
            client = httpx.AsyncClient()
            self._client = client

        endpoint = (
            f"{str(self._settings.supabase_url).rstrip('/')}"
            "/auth/v1/user"
        )
        headers = {
            "apikey": self._settings.supabase_anon_key.get_secret_value(),
            "Authorization": f"Bearer {token}",
        }
        try:
            response = await client.get(endpoint, headers=headers)
        except httpx.HTTPError as error:
            raise AuthServiceUnavailableError(
                "Supabase Auth verification is unavailable."
            ) from error

        if (
            response.status_code in {400, 401, 403}
            and self._is_api_key_rejection(response)
        ):
            raise AuthConfigurationError(
                "Supabase rejected the configured Auth API key."
            )
        if response.status_code in {400, 401, 403}:
            raise InvalidAccessTokenError("Access token is invalid or expired.")
        if response.status_code != 200:
            raise AuthServiceUnavailableError(
                "Supabase Auth verification did not complete."
            )

        try:
            payload = response.json()
            user_id = UUID(payload["id"])
            email = payload["email"]
        except (KeyError, TypeError, ValueError) as error:
            raise InvalidAccessTokenError(
                "Supabase returned an invalid identity."
            ) from error
        if not isinstance(email, str) or not email.strip():
            raise InvalidAccessTokenError(
                "Supabase returned an invalid identity."
            )

        return SupabaseIdentity(user_id=user_id, email=email.strip())

    @staticmethod
    def _is_api_key_rejection(response: httpx.Response) -> bool:
        """Identify a rejected project API key without exposing its details."""

        try:
            payload = response.json()
        except ValueError:
            return False
        if not isinstance(payload, dict):
            return False

        diagnostic = " ".join(
            str(payload.get(field, ""))
            for field in (
                "code",
                "error",
                "error_code",
                "error_description",
                "message",
                "msg",
            )
        ).casefold()
        return any(
            marker in diagnostic
            for marker in ("api key", "apikey", "api_key", "invalid-api-key")
        )

    async def aclose(self) -> None:
        """Close the reusable HTTP client owned by this verifier."""

        if self._owns_client and self._client is not None:
            await self._client.aclose()
            self._client = None
