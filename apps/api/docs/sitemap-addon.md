# Automatic sitemap notifications: optional add-on

This add-on consists entirely of new files. Existing API routes, services,
settings, database code, and frontend files are unchanged.

## Activate

Configure these API process environment variables using the new
`.env.sitemap.example` as a reference:

- `NEXT_PUBLIC_SITE_URL`: the same website origin used by the frontend.
- `SITEMAP_REVALIDATION_SECRET`: the same server-only secret configured in the
  frontend deployment. Never expose it in the admin browser.

The new settings class also accepts these values from the API's usual `.env`.
No existing environment file has been modified by this change.

From apps/api, start the API with the new entry point, using the Python
environment where the existing API dependencies are installed:

```powershell
python -m uvicorn app.sitemap_main:app --host 127.0.0.1 --port 8000
```

Retain the host, port, workers, and other options used by your deployment; change
only its import target from `app.main:app` to `app.sitemap_main:app`.
The old entry point remains available and does not activate the add-on.

Activation needs that startup change and both environment values. Adding files
alone does not change an already-running API. No running service was restarted.

## Behavior

Successful creates, updates, and deletes on `/blogs`, `/case-studies`, and
`/careers` automatically call the existing frontend sitemap trigger. Blog and
case-study cover updates also notify. Reads, rejected writes, job applications,
and unrelated routes do not notify.

The wrapper waits until the existing application has completed and sent its
successful response. The current content services commit before that response.
It then makes an authenticated POST to `/api/revalidate-sitemap` on the configured
website. The next sitemap request regenerates the cached XML using fresh data.

Notification requests have a five-second timeout, do not follow redirects, and
run off the event loop. Failure is logged without credentials and does not fail
the original content save. There is no polling or hourly refresh. Notifications
are best effort, with no persistent retry queue. Direct database edits and writes
that bypass this API entry point do not trigger notifications.

New page files still require a frontend build.

## Focused checks

From apps/api:

```powershell
python -B -m unittest discover -s tests -p test_sitemap_addon.py -v
```

These isolated tests use the standard library and mocked requests. They do not
access the database, change content, or call the live frontend.
