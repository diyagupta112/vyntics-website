# Backend Progress

**Last updated:** 2026-09-23

## Current phase

Phase 6 — Blog API, including the additional admin read endpoints, is complete.
Phase 7 — Case Studies is implemented and verified through automated contract,
repository, service, API, OpenAPI, and real Supabase PostgreSQL tests.
Phase 11 — Contact Us is implemented and verified through automated schema,
repository, service, API, OpenAPI, and real Supabase PostgreSQL tests.

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

- [x] Applied the approved initial migration to the configured Supabase PostgreSQL
  database and verified all eight expected application tables.
- [x] Added PostgreSQL integration coverage against the migrated configured
  database.
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

## Phase 5 — Database Connectivity Foundation

- [x] Verified the settings layer reads `DATABASE_URL` as a masked `SecretStr`
  from environment variables and dotenv files.
- [x] Retained SQLAlchemy 2.x async operation through Psycopg 3.
- [x] Verified the engine uses SQLAlchemy's application-side
  `AsyncAdaptedQueuePool` with `pool_pre_ping` enabled.
- [x] Retained lazy engine construction with no import-time connection attempt.
- [x] Completed FastAPI lifespan ownership of database resources and now clears
  the disposed resource from application state during shutdown.
- [x] Retained one `AsyncSession` per request/task with `expire_on_commit=False`.
- [x] Corrected normal dependency shutdown so async-generator closure is not
  misclassified as a request failure.
- [x] Verified failed dependency consumers are rolled back and the database
  dependency never commits implicitly. Repository/service transaction behavior
  remains for those future layers to implement explicitly.
- [x] Added an explicit `SELECT 1` connectivity command at
  `python -m app.db.connectivity`; no public database-health endpoint was added.
- [x] Added an opt-in real PostgreSQL integration test controlled by
  `RUN_DATABASE_INTEGRATION_TESTS=1`.
- [x] Updated `.env.example` with a placeholder-only Supabase Session Pooler URL.
- [x] Kept Supabase migrations as the only schema migration source of truth;
  no Alembic or `metadata.create_all()` was added.

Live verification result:

- [x] The configured Supabase Session Pooler connection was verified with
  `SELECT 1` without printing or modifying its credentials.
- [x] The standalone connectivity command uses a Windows Selector event loop so
  Psycopg async mode works on Windows.

## Phase 6 — Blogs

- [x] Added public `GET /blogs` with published-only filtering and
  `published_at DESC` ordering.
- [x] Added public `GET /blogs/{slug}` with published-only visibility and 404
  behavior for missing or non-public Blogs.
- [x] Added admin `POST /blogs`, `PATCH /blogs/{id}`, and hard-delete
  `DELETE /blogs/{id}` operations without temporary or fake authentication.
- [x] Added strict Blog create/update request schemas and the confirmed admin
  response schema without exposing ownership fields.
- [x] Enforced non-empty required strings, valid URLs, JSON-object content,
  approved statuses, unique slugs, and the published cover-image requirement.
- [x] Implemented the confirmed `published_at` transition rules.
- [x] Added repository/service separation with service-owned commit/rollback
  boundaries and no repository commits.
- [x] Added create/update/delete audit events with nullable actors and safe
  context that excludes full Blog content.
- [x] Added unit/API tests for repositories, services, routes, validation,
  filtering, ordering, errors, publication transitions, audit logging, and
  response contracts.
- [x] Added an opt-in Blog lifecycle integration test against configured
  PostgreSQL/Supabase with cleanup.
- [x] Verified Swagger/OpenAPI exposes all five Blog operations and the Blog
  create/update request schemas.
- [x] Verified the live full-stack Blog lifecycle against Supabase: create 201,
  list/detail 200, update 200, and hard delete 204; temporary rows were cleaned.
- [ ] Authentication and authorization remain deferred to the approved auth
  phase.

### Additional Phase 6 work identified during manual verification

**Status:** Implemented and verified.

The manual Swagger/Supabase verification established the following sequence:

1. `POST /blogs` was manually tested.
2. The Blog was successfully inserted into Supabase.
3. `GET /blogs` initially returned no result because the created Blog had
   `status=draft`.
4. The Blog was changed to `status=published`.
5. `GET /blogs` and `GET /blogs/{slug}` then returned the Blog as expected.
6. This confirmed that the public published-only behavior is working.
7. During this verification, the Admin Panel requirement to read draft and
   unpublished Blogs was identified.
8. The following additional admin read endpoints are therefore planned:
   - `GET /admin/blogs`
   - `GET /admin/blogs/{id}`

Completed additional work:

- [x] Added `GET /admin/blogs`, returning Blogs in `draft`, `published`, and
  `unpublished` states using the established admin Blog response shape.
- [x] Added `GET /admin/blogs/{id}`, returning a Blog by database UUID regardless
  of status and returning 404 when it does not exist.
- [x] Kept both endpoints structurally ready for later authentication and
  authorization without adding fake or temporary security.
- [x] Added repository, service, API contract, UUID-validation, status-coverage,
  OpenAPI, public-regression, and PostgreSQL integration tests.
- [x] Verified Swagger exposes and executes both admin endpoints.
- [x] Verified through Swagger that the admin listing includes draft,
  published, and unpublished Blogs.
- [x] Verified through Swagger that UUID detail requests return known draft and
  published Blogs.
- [x] Verified against Supabase that admin reads include all three statuses,
  while public listing/detail behavior remains published-only.
- [x] Removed all temporary Blogs and audit rows created for verification.

Existing public Blog GET behavior remains unchanged.

## Phase 7 — Case Studies preparation

- [x] Reviewed the Phase 7 plan against the existing Case Study SQLAlchemy
  model, Supabase migration, and Phase 4 public schemas.
- [x] Identified the prior documentation gap: the plan referred to established
  Case Study create, update, and admin schemas that do not exist.
- [x] Corrected the plan by defining the create request, partial-update request,
  and admin response contracts explicitly while preserving the existing public
  list and detail contracts.
- [x] Documented public and admin route behavior, status visibility,
  publication timestamp lifecycle, slug conflicts, cover-image rules,
  validation, structured content, array fields, audit logging, testing, manual
  Swagger/Supabase verification, architecture layering, deferred
  authentication, and Phase 7 boundaries.
- [x] Verified that the corrected contract does not conflict with the existing
  Case Study model, migration, or public schemas.
- [x] Added strict Case Study create and partial-update request schemas and the
  exact admin response schema without exposing ownership fields.
- [x] Added public `GET /case-studies` and `GET /case-studies/{slug}` with
  published-only visibility and `published_at DESC` list ordering.
- [x] Added unprefixed admin mutations: `POST /case-studies`,
  `PATCH /case-studies/{id}`, and hard-delete `DELETE /case-studies/{id}`.
- [x] Added admin reads at `GET /admin/case-studies` and
  `GET /admin/case-studies/{id}` with all-status visibility.
- [x] Enforced the three approved statuses, non-empty required strings, valid
  URLs, JSON-object content, array-of-string tech stack/tags, unique slugs, and
  the published cover-image requirement.
- [x] Implemented the documented `published_at` transition rules.
- [x] Added repository/service separation with service-owned commit/rollback
  boundaries and no repository commits.
- [x] Added atomic create/update/delete audit logging with nullable actors and
  safe context that excludes full Case Study content.
- [x] Added focused schema, repository, service, API/OpenAPI, and opt-in
  PostgreSQL integration tests.
- [x] Verified the Case Study lifecycle against the configured Supabase
  PostgreSQL database with temporary records and cleanup.
- [ ] Manual Swagger UI execution has not yet been performed; generated OpenAPI
  route and schema coverage is verified automatically.
- [ ] Authentication and authorization remain deferred to the approved auth
  phase.

## Phase 11 — Contact Us documentation preparation

- [x] Reviewed the existing Contact Submission ORM model, Supabase migration,
  Phase 4 request schema, database/session infrastructure, and prior resource
  implementation patterns.
- [x] Expanded the previous high-level Phase 11 checklist into an explicit,
  implementation-ready API contract.
- [x] Defined public `POST /contact-us` separately from the admin list, detail,
  and hard-delete endpoints.
- [x] Defined the exact public request, public receipt, and admin response
  fields, including backend-managed field boundaries.
- [x] Documented validation, ordering, errors, transaction ownership, delete
  audit logging, automated tests, and manual Swagger/Supabase verification.
- [x] Explicitly deferred email automation, authentication, authorization,
  status management, notes/resolution workflows, and unrelated scope.
- [x] Verified that the prepared contract is compatible with the existing
  Contact Submission model, migration, and database conventions.
- [x] Added strict Contact Submission request validation and exact public
  receipt and admin response schemas.
- [x] Added public `POST /contact-us`, returning HTTP 201 with only `id`,
  `status`, and `submitted_at`.
- [x] Added `GET /admin/contact-submissions`, ordered by `submitted_at DESC`,
  and `GET /admin/contact-submissions/{id}`.
- [x] Added hard-delete `DELETE /admin/contact-submissions/{id}` with HTTP 204
  and standard missing/invalid-UUID behavior.
- [x] Kept the public submission unauthenticated and added no fake
  authentication to the deferred admin routes.
- [x] Enforced valid emails, trimmed non-empty required strings, nullable
  optional company, simple non-empty source-page references, and strict
  rejection of unknown/backend-managed request fields.
- [x] Added repository/service layering with service-owned commit and rollback
  boundaries and no repository commits.
- [x] Kept public submission audit-free and added atomic, safe audit logging for
  admin hard deletion using `resource_type=contact_submission`.
- [x] Added focused schema, repository, service, API/OpenAPI, and opt-in
  PostgreSQL integration tests.
- [x] Verified the Contact Submission lifecycle against the configured
  Supabase PostgreSQL database with temporary data and cleanup.
- [ ] The manual Swagger/Supabase sequence has not been performed; generated
  OpenAPI and the real database lifecycle were verified automatically.
- [ ] Authentication and authorization remain deferred to the approved auth
  phase.
- [ ] Email automation remains deferred and was not implemented.

## Validation

```text
204 tests passed, 4 opt-in integration tests skipped in the default suite
48 focused Contact Submission tests passed, 1 opt-in integration test skipped
Real Contact Submission PostgreSQL lifecycle integration test -> 1 passed
56 focused Case Study tests passed, 1 opt-in integration test skipped
Real Case Study PostgreSQL lifecycle integration test -> 1 passed
69 focused schema/repository/service/API tests passed
30 focused Blog tests passed, 1 opt-in integration test skipped
Real Blog PostgreSQL integration test -> 1 passed
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
Dotenv DATABASE_URL loading            -> verified with placeholder template
Async application connection pool      -> verified
FastAPI database lifecycle/disposal    -> verified
Session dependency rollback/no-commit  -> verified
Python compileall                       -> passed
Real Supabase SELECT 1                 -> previously verified
Live POST /blogs                       -> 201
Live GET /blogs                        -> 200; created published Blog present
Live GET /blogs/{slug}                 -> 200
Live PATCH /blogs/{id}                 -> 200; published_at transition verified
Live DELETE /blogs/{id}                -> 204; hard delete verified
Swagger GET /admin/blogs               -> 200; all three statuses verified
Swagger GET /admin/blogs/{id}          -> 200 for draft and published UUIDs
Public listing regression              -> draft/unpublished excluded
Public detail regression               -> published 200; hidden statuses 404
Case Study OpenAPI routes/schemas       -> verified
Case Study public/admin separation      -> verified
Case Study publication lifecycle        -> verified
Case Study audit transaction behavior   -> verified
Python compileall after Phase 7          -> passed
Contact OpenAPI routes/schemas           -> verified
Contact public/admin separation          -> verified
Contact backend-managed fields           -> verified
Contact delete audit transaction         -> verified
Python compileall after Phase 11         -> passed
```

## Deferred by design

- Plain Uvicorn and the pre-existing connectivity integration test select the
  incompatible Proactor event loop on this Windows/Python environment. Live
  async Psycopg verification succeeds under a Selector event loop; the shared
  SQLAlchemy engine/session architecture remains unchanged.
- The Supabase CLI and local Docker-backed Supabase environment are not available
  on this machine; verification used the configured hosted Supabase database.
- RLS policies are intentionally not created because direct-client access rules are not approved.
- The final error contract remains a later phase.
- Supabase Auth and Storage clients are not configured.
- Storage bucket names and policies remain Phase 13 decisions.
- External integrations are not initialized.
- Resource APIs and business workflows other than Blogs, Case Studies, and
  Contact Submissions are not implemented.
- Docker and AWS deployment are not configured.

The existing Node/TypeScript scaffold remains unchanged.

## Next task

Phase 11 is complete. Stop before any additional implementation phase; further
work requires a separate approved task.
