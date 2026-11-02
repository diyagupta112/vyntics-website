# Local activation

The add-on was activated locally on October 28, 2026:

- Website: http://127.0.0.1:3000
- API: http://127.0.0.1:8000
- API entry point: `app.sitemap_main:app`

`start-sitemap-local.ps1` starts the add-on API and restarts this checkout's local
website with matching settings. To activate again, run that script from apps/api
in PowerShell 7. It uses the isolated `.venv` containing the API's existing
declared dependencies. Both servers run as hidden background processes.

The new `.env.sitemap.local` holds the local origin, API URL, and generated
trigger secret. It is ignored by Git and the script never prints the secret.
Existing source files and existing environment files were not changed.
Logs are kept under `.venv/sitemap-local-*.log`.

Verified: API health HTTP 200, authenticated trigger HTTP 200, unauthenticated
trigger HTTP 401, a direct API-notifier call to the live local frontend, valid
sitemap XML containing 29 URLs with the local origin, and all 10 isolated
add-on tests passing in the new API runtime.

This checkout has no configured database connection or Supabase credentials.
The add-on is running, but real content save/delete operations cannot be tested
until the API's normal credentials are supplied through its process environment
or usual `.env`. No content was created, edited, or deleted during activation.

The servers must be started again after a computer restart. This activation does
not install an operating-system service or change production configuration.
