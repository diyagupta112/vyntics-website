# Vyntics API

FastAPI backend for the Vyntics public website and Admin Panel.

## Local server

From `apps/api`, install the project and start Uvicorn:

```powershell
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

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
