# Vyntics API

FastAPI backend for the Vyntics public website and Admin Panel.

## Local server

From the repository root on Windows, install the project and start Uvicorn on
the same port configured by `frontend/.env`:

```powershell
.\.venv\Scripts\python.exe -m pip install -e ".\apps\api[dev]"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir apps/api --host 127.0.0.1 --port 8000 --reload
```

If the current directory is already `apps/api`, use:

```powershell
..\..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

`.venv/bin/python` is the Unix virtual-environment path and does not apply to
this Windows checkout.

Configuration is loaded from process environment variables and the untracked
`apps/api/.env` file. Use `.env.example` as the placeholder-only template.

## Tests

```powershell
.\.venv\Scripts\python.exe -m pytest
```

## Database connectivity

The development connectivity check opens one pooled connection, executes
`SELECT 1`, disposes the engine, and does not expose the configured URL:

```powershell
.\.venv\Scripts\python.exe -m app.db.connectivity
```

The equivalent integration test is opt-in so the normal suite remains usable
without external database access:

```powershell
$env:RUN_DATABASE_INTEGRATION_TESTS = "1"
.\.venv\Scripts\python.exe -m pytest tests/test_database_integration.py
```

Supabase SQL migrations remain the only database schema migration mechanism.
Do not use SQLAlchemy `create_all()` or Alembic.
