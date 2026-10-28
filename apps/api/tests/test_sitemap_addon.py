"""Isolated checks for the optional sitemap add-on."""

import unittest
from unittest.mock import AsyncMock, Mock, patch
from urllib.error import URLError

from app.sitemap_addon import SitemapNotifier, SitemapRefreshMiddleware, is_content_write


class SitemapAddonTests(unittest.IsolatedAsyncioTestCase):
    async def request(self, method="PATCH", path="/blogs/item", status=200, notify=None):
        events = []
        original_scope = {"type": "http", "method": method, "path": path}

        async def application(scope, receive, send):
            self.assertIs(scope, original_scope)
            await send({"type": "http.response.start", "status": status, "headers": []})
            await send({"type": "http.response.body", "body": b"unchanged"})
            events.append("application-completed")

        async def send(message):
            events.append(message.copy())

        async def notification():
            self.assertEqual(events[-1], "application-completed")
            events.append("notified")

        callback = notify if notify is not None else AsyncMock(side_effect=notification)
        wrapper = SitemapRefreshMiddleware(application, callback)
        await wrapper(original_scope, AsyncMock(), send)
        return events, callback

    async def test_successful_writes_notify_after_unchanged_response(self):
        for collection in ("blogs", "case-studies", "careers"):
            for method, suffix, status in (("POST", "", 201), ("PATCH", "/item", 200), ("DELETE", "/item", 204)):
                with self.subTest(collection=collection, method=method):
                    events, notify = await self.request(method, f"/{collection}{suffix}", status)
                    notify.assert_awaited_once()
                    self.assertEqual(events[0]["status"], status)
                    self.assertEqual(events[1]["body"], b"unchanged")

    async def test_reads_unrelated_writes_and_failed_writes_do_not_notify(self):
        for method, path, status in (
            ("GET", "/blogs", 200),
            ("POST", "/careers/item/applications", 201),
            ("POST", "/contact-submissions", 201),
            ("POST", "/blogs-preview", 201),
            ("PATCH", "/blogs/item", 401),
            ("PATCH", "/case-studies/item", 422),
            ("DELETE", "/careers/item", 500),
            ("POST", "/blogs", 307),
        ):
            with self.subTest(method=method, path=path, status=status):
                _, notify = await self.request(method, path, status)
                notify.assert_not_awaited()

    async def test_notification_failure_preserves_success(self):
        with self.assertLogs("app.sitemap_addon", level="WARNING") as captured:
            events, notify = await self.request(notify=AsyncMock(side_effect=RuntimeError("private detail")))
        self.assertEqual(events[0]["status"], 200)
        self.assertEqual(events[1]["body"], b"unchanged")
        self.assertNotIn("private detail", " ".join(captured.output))
        notify.assert_awaited_once()

    async def test_non_http_scope_is_delegated(self):
        original, notify = AsyncMock(), AsyncMock()
        scope, receive, send = {"type": "lifespan"}, AsyncMock(), AsyncMock()
        await SitemapRefreshMiddleware(original, notify)(scope, receive, send)
        original.assert_awaited_once_with(scope, receive, send)
        notify.assert_not_awaited()

    async def test_incomplete_response_does_not_notify(self):
        async def application(scope, receive, send):
            await send({"type": "http.response.start", "status": 200})
            await send({"type": "http.response.body", "body": b"partial", "more_body": True})

        notify = AsyncMock()
        await SitemapRefreshMiddleware(application, notify)(
            {"type": "http", "method": "DELETE", "path": "/blogs/item"}, AsyncMock(), AsyncMock()
        )
        notify.assert_not_awaited()

    async def test_exception_from_original_app_is_preserved(self):
        notify = AsyncMock()
        original = AsyncMock(side_effect=RuntimeError("original failure"))
        with self.assertRaisesRegex(RuntimeError, "original failure"):
            await SitemapRefreshMiddleware(original, notify)(
                {"type": "http", "method": "DELETE", "path": "/blogs/item"}, AsyncMock(), AsyncMock()
            )
        notify.assert_not_awaited()

    def test_cover_routes_and_nested_route_exclusions(self):
        self.assertTrue(is_content_write("PUT", "/blogs/item/cover-image"))
        self.assertTrue(is_content_write("DELETE", "/case-studies/item/cover-image"))
        self.assertFalse(is_content_write("POST", "/careers/item/applications"))
        self.assertFalse(is_content_write("PUT", "/careers/item/cover-image"))

    def test_notification_posts_secret_with_timeout_and_no_redirects(self):
        notifier = SitemapNotifier("https://example.test///", "test-secret")
        response = Mock(status=200)
        opener = Mock()
        opener.open.return_value.__enter__ = Mock(return_value=response)
        opener.open.return_value.__exit__ = Mock(return_value=False)
        with patch("app.sitemap_addon.build_opener", return_value=opener) as build:
            notifier._post()
        request = opener.open.call_args.args[0]
        self.assertEqual(request.full_url, "https://example.test/api/revalidate-sitemap")
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(request.get_header("Authorization"), "Bearer test-secret")
        self.assertEqual(opener.open.call_args.kwargs["timeout"], 5)
        self.assertIsNone(build.call_args.args[0].redirect_request(None, None, 302, None, None, "https://elsewhere.test"))

    async def test_network_failure_is_logged_without_secret(self):
        notifier = SitemapNotifier("https://example.test", "test-secret")
        with patch.object(notifier, "_post", side_effect=URLError("test-secret")):
            with self.assertLogs("app.sitemap_addon", level="WARNING") as captured:
                await notifier()
        self.assertNotIn("test-secret", " ".join(captured.output))

    def test_configuration_validation(self):
        for site in ("", "file:///tmp", "https://user:pass@example.test", "https://example.test/path"):
            with self.subTest(site=site), self.assertRaises(ValueError):
                SitemapNotifier(site, "test-secret")
        with self.assertRaises(ValueError):
            SitemapNotifier("https://example.test", "")


if __name__ == "__main__":
    unittest.main()
