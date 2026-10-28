"""Optional ASGI wrapper that refreshes the website sitemap after content writes."""

import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import Any
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

logger = logging.getLogger(__name__)
Message = dict[str, Any]
Receive = Callable[[], Awaitable[Message]]
Send = Callable[[Message], Awaitable[None]]
ASGIApp = Callable[[Message, Receive, Send], Awaitable[None]]


class _NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Never forward the trigger credential to a redirect destination.
        return None


class SitemapNotifier:
    """Send a bounded trigger request without affecting the saved content."""

    def __init__(self, site_url: str, secret: str) -> None:
        site_url = site_url.rstrip("/")
        parsed = urlsplit(site_url)
        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.hostname
            or parsed.username is not None
            or parsed.password is not None
            or parsed.path
            or parsed.query
            or parsed.fragment
        ):
            raise ValueError("NEXT_PUBLIC_SITE_URL must be an HTTP(S) website origin.")
        if not secret.strip() or "\r" in secret or "\n" in secret:
            raise ValueError("SITEMAP_REVALIDATION_SECRET must be configured.")
        self._url = f"{site_url}/api/revalidate-sitemap"
        self._secret = secret

    def _post(self) -> None:
        request = Request(
            self._url,
            data=b"",
            headers={"Authorization": f"Bearer {self._secret}"},
            method="POST",
        )
        with build_opener(_NoRedirects()).open(request, timeout=5) as response:
            if not 200 <= response.status < 300:
                raise RuntimeError("Sitemap trigger was rejected.")

    async def __call__(self) -> None:
        try:
            await asyncio.to_thread(self._post)
        except Exception as error:
            # Do not include credentials, response bodies, or request URLs.
            logger.warning("Sitemap notification failed (%s).", type(error).__name__)


def is_content_write(method: str, path: str) -> bool:
    """Match content writes, excluding nested job applications and reads."""
    parts = path.strip("/").split("/")
    if not parts or parts[0] not in {"blogs", "case-studies", "careers"}:
        return False
    if len(parts) == 1:
        return method == "POST"
    if len(parts) == 2 and parts[1]:
        return method in {"PATCH", "PUT", "DELETE"}
    return (
        parts[0] in {"blogs", "case-studies"}
        and len(parts) == 3
        and bool(parts[1])
        and parts[2] == "cover-image"
        and method in {"PUT", "DELETE"}
    )


class SitemapRefreshMiddleware:
    """Delegate unchanged, then notify after a completed successful write."""

    def __init__(self, app: ASGIApp, notify: Callable[[], Awaitable[None]]) -> None:
        self.app = app
        self.notify = notify

    async def __call__(self, scope: Message, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or not is_content_write(
            scope.get("method", ""), scope.get("path", "")
        ):
            await self.app(scope, receive, send)
            return

        status = 0
        complete = False

        async def track_response(message: Message) -> None:
            nonlocal status, complete
            await send(message)
            if message["type"] == "http.response.start":
                status = message["status"]
            elif message["type"] == "http.response.body" and not message.get("more_body", False):
                complete = True

        await self.app(scope, receive, track_response)
        if complete and 200 <= status < 300:
            # The original response has already been sent. Trigger failures
            # cannot change the successful mutation's response or transaction.
            try:
                await self.notify()
            except Exception as error:
                logger.warning("Sitemap notification failed (%s).", type(error).__name__)
