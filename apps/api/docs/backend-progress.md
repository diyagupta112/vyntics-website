# Backend Progress

**Last updated:** 2026-09-23

## Current phase

Phase 4 — Pydantic API schemas complete; Phase 3 PostgreSQL integration
validation remains pending.

## Phase 1 — FastAPI Bootstrap

- [x] Added Python project and dependency configuration in `pyproject.toml`.
- [x] Added FastAPI and Uvicorn runtime dependencies.
- [x] Added pytest and HTTPX development/test dependencies.
- [x] Created the FastAPI application entry point and application factory.
- [x] Added and registered the top-level API router.
- [x] Added `GET /health`, which returns HTTP 200 without requiring a database.
- [x] Added a safe CORS middleware foundation with no origins enabled yet.
- [x] Added a global exception-handler registration hook without defining a premature error response contract.
- [x] Added initial packages for routes, core infrastructure, schemas, services, repositories, and future database code.
- [x] Added tests for the health endpoint and Swagger UI.
- [x] Verified the application boots under Uvicorn.
- [x] Verified `GET /health` returns 200.
- [x] Verified `GET /docs` returns 200 and serves Swagger UI.

## Phase 2 — Configuration and Environment Setup

- [x] Added typed settings based on `pydantic-settings`.
- [x] Added explicit development, test, and production environment values.
- [x] Added application name, debug, log-level, and CORS settings.
- [x] Prepared optional database settings without creating a connection.
- [x] Prepared optional Supabase settings without creating a client.
- [x] Prepared the documented Vyntics email-domain setting without implementing authentication.
- [x] Recorded Supabase as the documented storage provider without configuring buckets or storage clients.
- [x] Prepared optional Resend and Sentry settings without initializing integrations.
- [x] Added `apps/api/.env.example` with placeholders only.
- [x] Confirmed local `.env` files are ignored by Git.
- [x] Connected FastAPI application metadata, logging, and CORS middleware to typed settings.
- [x] Added tests for environment-variable parsing, secret masking, settings injection, and CORS.
- [x] Verified the configured application boots under Uvicorn without external services.

## Phase 3 — Database + SQLAlchemy

Completed foundation:

- [x] Selected SQLAlchemy 2.x with asynchronous Psycopg 3.
- [x] Added SQLAlchemy and Psycopg runtime dependencies.
- [x] Added a shared SQLAlchemy declarative base.
- [x] Added validated PostgreSQL URL normalization to the Psycopg dialect.
- [x] Added asynchronous engine construction with connection pre-ping.
- [x] Added an `async_sessionmaker` factory for request-scoped sessions.
- [x] Added FastAPI lifespan initialization and engine disposal.
- [x] Added a FastAPI dependency that yields one `AsyncSession` per request task and rolls back on failure.
- [x] Kept startup database-optional so unit tests and non-database routes require no live service.
- [x] Added database foundation tests that do not make a network connection.
- [x] Confirmed Supabase SQL migrations will remain the sole schema migration source of truth.
- [x] Confirmed Alembic will not be introduced alongside Supabase migrations.
- [x] Added the application-level `admin_users` identity table design.
- [x] Kept Supabase Auth as the authentication identity/source of truth.
- [x] Defined `admin_users.auth_user_id` as the unique mapping to Supabase Auth.
- [x] Defined initial admin roles as `superadmin` and `admin` without implementing permissions.
- [x] Added ORM models for all eight approved application tables.
- [x] Registered all models in shared SQLAlchemy metadata.
- [x] Added UUID primary keys, timestamps, JSONB structured content, and PostgreSQL arrays where approved.
- [x] Added approved relationships to `admin_users` for content ownership, contact resolution, and audit actors.
- [x] Added the career/application foreign key with `ON DELETE RESTRICT`.
- [x] Added the initial Supabase SQL migration at `supabase/migrations/20260923073155_initial_application_schema.sql`.
- [x] Added reusable database-managed `updated_at` triggers for tables that have `updated_at`.
- [x] Added static model, metadata, constraint, relationship, index, and migration tests.

Remaining Phase 3 work:

- [ ] Initialize approved Supabase CLI project configuration.
- [ ] Apply migrations to an empty local Supabase database.
- [ ] Add PostgreSQL integration tests against the migrated local database.
- [ ] Decide and implement RLS only after access policies are explicitly approved.

## Phase 4 — Pydantic API Schemas

- [x] Added shared Pydantic v2 request and response schema foundations.
- [x] Configured request schemas to reject undeclared/client-controlled fields.
- [x] Configured response schemas for mapping or ORM-attribute input while exposing
  only declared public contract fields.
- [x] Added public blog list-item, list-envelope, and detail response schemas.
- [x] Added public case-study list-item, list-envelope, and detail response schemas.
- [x] Added public career list-item, list-envelope, and detail response schemas.
- [x] Added the multipart job-application request schema with applicant-only fields.
- [x] Added the public team-member and team-list response schemas.
- [x] Added the public contact-submission request schema.
- [x] Added UUID, datetime, HTTP URL, email, enum, list, and structured JSON typing
  where required by the approved contracts.
- [x] Added approved resume filename-extension validation without implementing
  upload/storage behavior.
- [x] Added `email-validator` for Pydantic `EmailStr` validation.
- [x] Added focused schema contract tests for valid payloads, required fields,
  internal-field exclusion, member types, structured content, URLs, emails, and
  resume extensions.
- [x] Confirmed Phase 4 runs without a database or Supabase credentials.
- [x] Did not add routes, service/repository logic, authentication, storage, or
  database changes.

## Validation

```text
53 tests passed (including 27 Phase 4 schema tests)
GET /health -> 200
GET /docs   -> 200 (Swagger UI)
Environment-backed application title -> verified
Environment-backed CORS origin       -> verified
SQLAlchemy engine/session setup       -> verified without connecting
Database-optional application startup -> verified
Eight-table ORM metadata              -> verified
PostgreSQL DDL compilation            -> verified
Migration structure/parity checks     -> verified statically
Pydantic public contract schemas       -> verified
Backend-controlled request fields      -> rejected
Schema tests require no database       -> verified
```

## Deferred by design

- A live Supabase/PostgreSQL connection has not been configured or tested.
- The Supabase CLI and local Docker-backed Supabase environment are not available on this machine.
- The migration has not yet been applied to PostgreSQL; current schema verification is static only.
- RLS policies are intentionally not created because direct-client access rules are not approved.
- The final error contract remains a later phase.
- Supabase Auth and Storage clients are not configured.
- Storage bucket names and policies remain Phase 13 decisions.
- External integrations are not initialized.
- Resource APIs and business workflows are not implemented.
- Docker and AWS deployment are not configured.

The existing Node/TypeScript scaffold remains unchanged.

## Next task

Review the Phase 4 schemas and contract tests. Phase 5 API infrastructure has
not started. Separately, initialize an approved local Supabase environment,
apply the initial migration to an empty database, and run the still-pending
PostgreSQL integration tests before claiming live database validation.
