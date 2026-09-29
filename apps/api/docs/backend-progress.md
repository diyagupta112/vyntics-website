# Backend Progress

**Last updated:** 2026-09-25

## Current phase

Phase 6 — Blog API, including the additional admin read endpoints, is complete.
Phase 7 — Case Studies is implemented and verified through automated contract,
repository, service, API, OpenAPI, and real Supabase PostgreSQL tests.
Phase 11 — Contact Us is implemented and verified through automated schema,
repository, service, API, OpenAPI, and real Supabase PostgreSQL tests.
Phase 10 — Our Team is implemented and verified through automated schema,
repository, service, API, OpenAPI, migration, and real Supabase PostgreSQL
tests.
Phase 8 — Careers is implemented and verified through schema, repository,
service, API/OpenAPI, full-suite, live Supabase PostgreSQL, and manual live API
checks.

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
- [x] The Phase 8/9 correction migration replaces the initial restrictive
  Career foreign key with nullable `career_id` and `ON DELETE SET NULL`.
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
- [x] Authentication and authorization were added in Phase 12.

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
- [x] Authentication and authorization were added in Phase 12.

## Phase 8 — Careers documentation preparation

- [x] Reviewed the architecture, implementation plan, progress record, Career
  ORM model, initial Supabase migration, existing public Career schemas, prior
  resource APIs, audit implementation, and Job Application model/schema.
- [x] Replaced the former open/close wording with the product decision that a
  Career's existence means it is open and available.
- [x] Confirmed there is no Career status, visibility, active, archived,
  closed, or soft-delete state and that `published_at` is not a lifecycle flag.
- [x] Defined the exact five-operation Phase 8 API surface: two shared reads
  and three administrative-intent mutations, with PATCH and no PUT or duplicate
  admin reads.
- [x] Defined exact create, partial-update, public list, and public detail
  fields, including backend-managed field rejection and public ownership-field
  exclusion.
- [x] Documented non-null behavior, `{}` omission defaults for `nice_to_have`
  and `benefits`, and explicit-null rejection for all editable fields.
- [x] Documented backend-generated, immutable, timezone-aware `published_at`
  behavior and the frontend's date-only presentation requirement.
- [x] Documented established slug behavior: surrounding-whitespace trimming,
  empty-value rejection, otherwise exact preservation, case-sensitive stored
  matching/uniqueness, and HTTP `409` duplicate handling.
- [x] Defined `published_at DESC` list ordering, errors, repository/service
  boundaries, safe atomic audit events with `resource_type=career`, automated
  tests, and manual Swagger/Supabase verification.
- [x] Kept Job Applications and `POST /careers/{slug}/apply` in Phase 9.
- [x] Corrected Career deletion so related Job Applications never block a hard
  delete and are retained through nullable `career_id` plus `ON DELETE SET NULL`.
- [x] Added strict Career create and partial-update request schemas, including
  trimmed non-empty strings, unmodified slug preservation, JSON-object
  validation, `{}` defaults, explicit-null rejection, and backend-field
  rejection.
- [x] Added repository/service layering with all-record reads ordered by
  `published_at DESC`, exact case-sensitive slug matching, backend-generated
  `published_at`, preserved update timestamps, and no repository commits.
- [x] Added shared `GET /careers` and `GET /careers/{slug}` plus unprefixed
  `POST /careers`, `PATCH /careers/{id}`, and hard-delete
  `DELETE /careers/{id}`.
- [x] Added no PUT, duplicate admin reads, fake authentication, lifecycle
  fields, migration, or Phase 9 application endpoint.
- [x] Added atomic create/update/delete audit logging with nullable actors,
  `resource_type=career`, and safe metadata excluding Career content.
- [x] Career deletion now returns HTTP 204 even when applications exist; the
  database nulls their Career foreign keys without deleting the applications.
- [x] Added focused schema, repository, service, API/OpenAPI, and opt-in
  PostgreSQL lifecycle/restriction tests.
- [x] Verified the complete Career lifecycle and application-preserving
  deletion against the configured Supabase PostgreSQL database with cleanup.
- [x] Verified the live FastAPI `/docs`, generated OpenAPI surface, all five
  operations, response fields, ordering, generated/preserved `published_at`,
  duplicate slug, restricted delete, missing behavior, and empty 204 bodies.

## Phase 9 — Job Applications documentation preparation

- [x] Reviewed the architecture, implementation plan, progress record, Job
  Application ORM model and migration, existing multipart request schema,
  finalized Careers behavior, prior resource APIs, repository/service/dependency
  layering, audit implementation, error conventions, and storage direction.
- [x] Confirmed Job Applications remain a separate API family and finalized
  public `POST /careers/{slug}/apply` plus the five approved administrative
  list, detail, PATCH, and hard-delete routes.
- [x] Finalized the complete status set as `new`, `reviewing`, `shortlisted`,
  `rejected`, and `hired`, with public submissions always starting at `new` and
  status changes reserved for future authenticated Admin Panel users.
- [x] Defined exact applicant-controlled, backend-managed, PATCH-editable, and
  immutable field boundaries, including explicit-null behavior for status and
  notes.
- [x] Defined separate minimal public receipt, administrative list-item, detail,
  and update response contracts without exposing the ORM universally.
- [x] Defined the Career-scoped unpaginated admin list, `submitted_at DESC`
  ordering, empty-list behavior, and all table fields needed without per-row
  detail requests.
- [x] Finalized hard deletion with HTTP 204, Career preservation, resume cleanup,
  missing-resource behavior, and no soft or cascade deletion.
- [x] Corrected the Career relationship to `ON DELETE SET NULL`; applications
  are historical records and no longer block Career deletion.
- [x] Defined create/update/delete audit events with
  `resource_type=job_application`, nullable deferred actors, atomic database
  mutation/audit behavior, and context that excludes applicant PII, note text,
  cover letters, and resume data.
- [x] Documented exact existing resume extension validation and the approved
  private, backend-managed Supabase Storage boundary.
- [x] Recorded bucket, object path, stored-reference format, private/signed
  access, signed-URL lifetime, MIME/content inspection, maximum size, and
  cross-system compensation as Phase 9 storage implementation details because
  the current repository does not define them.
- [x] Defined validation, safe errors, automated PostgreSQL/Supabase tests, and
  manual Swagger/database/storage verification with temporary-data cleanup.
- [x] Made no implementation, schema, migration, route, repository, service,
  dependency, test, frontend, or unrelated documentation change.

### Phase 9 implementation

- [x] Added the six-operation Job Applications API surface: public
  `POST /careers/{slug}/apply`, global and Career-scoped admin lists, and admin
  detail, PATCH, and hard-delete routes.
- [x] Added strict multipart create, status/notes PATCH, minimal public receipt,
  admin list-item, and admin detail response schemas with the five approved
  statuses and no universal ORM serialization.
- [x] Added Job Application repository/service/dependency layering with
  Career-scoped `submitted_at DESC` reads, service-owned commit/rollback
  boundaries, and no repository commits.
- [x] Implemented private backend-managed Supabase resume storage using the
  existing project URL and service-role configuration rather than adding a
  second storage architecture.
- [x] Phase 13 superseded the initial resume-specific defaults with private
  bucket `job-applications`, opaque
  `{application_id}/{content_digest}.{validated_extension}` paths stored in
  `resume_url`, five-minute signed admin download URLs, and a 10 MB maximum.
- [x] Added strict extension/MIME/signature matching for PDF, legacy DOC, and
  DOCX files, including empty, oversized, mismatched, and malformed rejection.
- [x] Kept stored resume paths and permanent public URLs out of public responses;
  admin list/detail responses receive short-lived backend-generated signed URLs.
- [x] Added upload compensation when database creation fails, storage-first
  application deletion so storage failure preserves the database row, and
  cleanup of the stored object before the hard-delete transaction commits.
- [x] Added safe HTTP handling for missing resources, validation failures,
  unavailable/unconfigured storage, and persistence failure without returning
  raw database or storage details.
- [x] Added atomic create/update/delete audit events using
  `resource_type=job_application`, nullable actors, and exact safe context that
  excludes applicant PII, notes, cover letters, resume references, and signed
  URLs.
- [x] Preserved application hard-delete behavior while correcting Career hard
  deletion to retain applications with a null foreign key and snapshots.
- [x] Added focused schema/API/OpenAPI, repository, service, storage, privacy,
  cleanup, audit, and opt-in PostgreSQL integration coverage.
- [x] Verified the service lifecycle and the complete FastAPI HTTP lifecycle
  against the configured Supabase PostgreSQL database under the required
  Windows Selector event loop, with temporary database data cleaned up.
- [ ] Live Supabase Storage upload/sign/delete verification remains pending
  because the configured `SUPABASE_SERVICE_ROLE_KEY` is not currently a
  recognized privileged server-key format. The API returns a safe HTTP 503 for
  failed provider operations; the private `job-applications` bucket is already
  provisioned.
- [x] Authentication and authorization were added in Phase 12 without fake
  credentials or identities.

### Temporary Phase 9 verification adjustment

- [x] Temporarily made the public `resume` multipart field optional so Job
  Application verification can continue before Supabase resume storage is
  configured. The finalized product contract still requires a resume once
  storage is available.
- [x] Added and applied forward migration `20260925180000` to make
  `job_applications.resume_url` nullable without rewriting the initial migration;
  the version was recorded in the Supabase migration ledger.
- [x] No-resume creation stores a genuine SQL `NULL`, creates no fake URL or
  storage reference, and performs no upload, signing, or deletion call.
- [x] Administrative list/detail responses return `resume_url: null` for these
  temporary no-resume applications; applications that do have stored resume
  references continue to use the existing signed-access behavior.
- [x] Verified both no-resume and resume-present lifecycles against the
  configured Supabase PostgreSQL database with temporary-data cleanup.
- [ ] When resume storage is ready, restore the required request field and
  non-null response/model contract, resolve or remove any temporary rows with
  null resume references, and add a forward migration restoring the database
  `NOT NULL` constraint.

### Phase 8 + Phase 9 Career/application retention correction

- [x] Added forward migration `20260925190000` without rewriting the applied
  initial schema. It backfills `career_title_snapshot` and
  `career_slug_snapshot`, makes both snapshots non-null, makes `career_id`
  nullable, and replaces the restrictive foreign key with `ON DELETE SET NULL`.
- [x] Career hard deletion now succeeds with HTTP 204 whether or not
  applications exist. It removes the Career from list/detail reads and prevents
  future submissions through the deleted slug without deleting applications.
- [x] Public application creation captures the current Career ID, title, and
  slug. Snapshot values remain unchanged during application status/notes PATCH.
- [x] Added `GET /admin/job-applications`, ordered by `submitted_at DESC`, for
  current and historical applications. The existing current-Career-scoped list
  remains available at `GET /admin/careers/{career_id}/applications`.
- [x] Admin list/detail/PATCH responses expose nullable `career_id` and the
  retained Career title/slug snapshots so deleted-Career applications remain
  identifiable without constructing a fake Career object.
- [x] Preserved the five statuses, status/notes-only PATCH contract, optional
  resume verification behavior, hard application deletion, and safe Career and
  Job Application audit logging.
- [x] Added focused model, migration, repository, service, API/OpenAPI, and
  PostgreSQL lifecycle coverage for current and historical applications.

## Phase 10 — Our Team documentation preparation

- [x] Reviewed the existing Team Member ORM model, initial Supabase migration,
  Phase 4 response schema, database conventions, and prior API patterns.
- [x] Identified the outdated `is_visible` design in the model, migration,
  index, architecture-era behavior, and Phase 10 checklist.
- [x] Documented complete removal of `is_visible` with no replacement status,
  active, hidden, archived, or soft-delete behavior.
- [x] Documented the requirement for a new forward Supabase migration that
  removes the visibility index and column without rewriting the applied
  historical migration.
- [x] Defined shared `GET /our-team` and `GET /our-team/{id}` endpoints for both
  the public website and Admin Panel, with no duplicate admin reads.
- [x] Defined `POST /our-team`, `PATCH /our-team/{id}`, and hard-delete
  `DELETE /our-team/{id}` as mutation endpoints with deferred authentication.
- [x] Resolved the URL-field contract: `photo_url` and `linkedin_url` are both
  optional and nullable in create, PATCH, and all responses; non-null values
  require valid HTTP(S) URLs.
- [x] Defined exact request/response fields, validation, display ordering,
  member types, errors, audit behavior, testing, and manual verification.
- [x] Added and applied the forward Supabase migration that drops
  `ix_team_members_visible_order` and `team_members.is_visible` without
  rewriting the initial migration or adding a replacement lifecycle field.
- [x] Recorded migration version `20260923175653` in the Supabase migration
  ledger in the same transaction as the schema change.
- [x] Updated ORM metadata to remove `is_visible` and its visibility index while
  preserving nullable `photo_url` and `linkedin_url` columns.
- [x] Added strict create and partial-update request schemas and corrected the
  shared response so both URL fields may be `null`.
- [x] Added repository/service layering with list ordering solely by
  `display_order ASC`, UUID detail lookup, and no repository commits.
- [x] Added shared `GET /our-team` and `GET /our-team/{id}` routes and the
  unprefixed `POST`, `PATCH`, and hard-delete `DELETE` mutation routes.
- [x] Added no duplicate `/admin` Team routes and no fake authentication or
  authorization.
- [x] Added atomic create/update/delete audit logging using
  `resource_type=team_member`, nullable actors, and safe context that excludes
  biographies and profile URLs.
- [x] Added schema, repository, service, API/OpenAPI, migration, ORM metadata,
  and opt-in PostgreSQL lifecycle tests.
- [x] Verified against the configured Supabase PostgreSQL database that the
  visibility column/index are absent and create, ordered reads, detail,
  partial update, nullable URL clearing, hard deletion, audit rows, and cleanup
  work as documented.
- [ ] The manual Swagger/Supabase sequence has not been performed; generated
  OpenAPI and the real database lifecycle were verified automatically.
- [x] Authentication and authorization were added in Phase 12.

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
- [x] Authentication and authorization were added in Phase 12.
- [ ] Email automation remains deferred and was not implemented.

## Phase 12 â€” Supabase Auth implementation

- [x] Implemented Phase 12 authentication and authorization cohesively.
- [x] Defined the authentication input as `Authorization: Bearer <access_token>`
  and implemented Supabase verification through the configured project's
  authenticated-user endpoint without trusting decoded JWT payloads.
- [x] Corrected `/auth/v1/user` verification to use the dedicated
  `SUPABASE_ANON_KEY` as `apikey`; `SUPABASE_SERVICE_ROLE_KEY` remains reserved
  for privileged server-side operations and is never used for user-token
  verification.
- [x] Distinguished Supabase API-key/configuration rejection (`503`) from an
  invalid or expired user access token (`401`) without exposing upstream
  credentials or error details.
- [x] Defined authenticated identity resolution through the verified Supabase
  user UUID and matching `admin_users.auth_user_id`, with `is_active=true`
  required for successful Vyntics administrator authentication.
- [x] Defined HTTP `401 Unauthorized` for unsuccessful authentication and
  implemented HTTP `403 Forbidden` for an authenticated-but-not-authorized
  role decision.
- [x] Documented that client-supplied email, `admin_user_id`, hardcoded users,
  hardcoded tokens, fake JWTs, and local/fake authentication are never accepted
  as identity proof.
- [x] Documented that access tokens are not stored in application/database
  tables, service-role credentials remain server-side, the existing
  `admin_users` model remains authoritative for Vyntics admin mapping, and no
  schema change or generic `users` table is required.
- [x] Recorded completed manual setup: Google is enabled in Supabase Auth; the
  Google Cloud project and OAuth Web Application client exist; the Supabase
  callback is the authorized redirect URI; Client ID and Client Secret are
  configured in Supabase; Skip nonce checks and Allow users without an email
  remain off.
- [x] Documented that Google provider enablement does not authorize a Vyntics
  administrator and that no Admin Panel URL, JavaScript origin, or browser E2E
  login verification exists yet because the Admin Panel has not been built.
- [x] Added a typed authenticated-admin context containing the verified
  Supabase identity and authoritative `admin_users` identity, role, and active
  state.
- [x] Added one reusable Bearer authentication dependency and one reusable role
  authorization dependency; missing/invalid authentication returns `401`, and
  insufficient authenticated role returns `403`.
- [x] Enforced the configured `auth_allowed_email_domain` using exact,
  case-insensitive domain comparison before the administrator lookup.
- [x] Protected all current `/admin/...` reads and mutations plus Blog, Case
  Study, Career, and Team Member mutations.
- [x] Kept Blog, Case Study, Career, and Team Member public reads, Contact Us
  submission, and Job Application submission public.
- [x] Passed authenticated administrator IDs and database emails into the
  existing atomic audit events for protected mutations; public Job Application
  creation remains an anonymous audit event.
- [x] Implemented focused verification, authentication, authorization,
  route-boundary, public-regression, and audit-actor tests.
- [x] Confirmed no current operation is documented as superadmin-only; both
  active `admin` and `superadmin` records can use current protected operations.
- [x] Confirmed no schema or migration change was required.

## Phase 13 — Supabase Storage implementation

- [x] Confirmed the server-owned architecture is Admin Panel → FastAPI →
  Supabase Storage; no direct browser mutation path or broad authenticated-user
  Storage policy was introduced.
- [x] Added a shared asynchronous Supabase Storage gateway with centralized
  safe error mapping, public URL generation, private signed URL generation,
  upload/delete operations, and legacy/current server-key header handling.
- [x] Added one application-lifetime Storage HTTP client created and closed by
  the FastAPI lifespan rather than request-local network clients.
- [x] Configured the manually provisioned public `blog-covers`,
  `case-study-covers`, and `team-photos` buckets at 5 MB, and private
  `job-applications` resume bucket at 10 MB.
- [x] Preserved the Phase 12 credential split: `SUPABASE_ANON_KEY` verifies
  users and server-only `SUPABASE_SERVICE_ROLE_KEY` performs privileged
  Storage operations.
- [x] Added shared JPEG/PNG/WebP and PDF/DOC/DOCX validation covering empty
  files, byte limits, extension, declared MIME, and actual signature/content.
- [x] Added server-generated
  `{resource_id}/{content_digest}.{validated_extension}` paths; client
  filenames are ignored for naming and clients cannot select buckets or paths.
- [x] Added authenticated `PUT`/`DELETE` Blog cover, Case Study cover, and Team
  photo subresources while retaining all existing JSON CRUD contracts.
- [x] Kept published Blog and Case Study covers mandatory and Team photos
  optional.
- [x] Implemented upload → database commit → guarded previous-object cleanup,
  including new-upload compensation on persistence failure and sanitized
  logging for post-commit cleanup failure.
- [x] Limited public-object deletion to URLs proven to match the configured
  Supabase origin and expected bucket; arbitrary external URLs are not deleted.
- [x] Refactored the Phase 9 resume adapter onto the shared gateway, changed its
  configured private bucket to `job-applications`, raised validation to 10 MB,
  and retained short-lived admin-only signed URLs.
- [x] Kept multipart resumes optional and `resume_url` nullable. The read-only
  database inspection found four existing Job Applications and four null resume
  references, so no `NOT NULL` migration or placeholder URL was added.
- [x] Preserved authenticated audit actors and safe context without file bytes,
  URLs, paths, applicant data, provider bodies, tokens, or credentials.
- [x] Added focused gateway, validator, naming, cleanup, compensation,
  authentication, endpoint, published-cover, resume, and audit regression tests.
- [ ] Live Storage upload/sign/delete verification remains blocked until
  `SUPABASE_SERVICE_ROLE_KEY` contains a valid privileged Supabase server key.

## Validation

```text
486 tests passed, 8 opt-in integration tests skipped after Phase 13
219 focused Phase 13/auth/resource/resume tests passed
Shared Storage legacy/current credential headers -> verified with mock HTTP
Public and signed URL generation               -> verified with mock HTTP
Image/resume validation and digest naming      -> verified
Replacement compensation/external URL guard    -> verified
New endpoint authentication/OpenAPI contracts  -> verified
Python compileall after Phase 13                -> passed
459 tests passed, 8 opt-in integration tests skipped after Phase 12 Auth fix
57 focused Phase 12 authentication/authorization/audit/config tests passed
239 broader affected API/service tests passed after Phase 12 Auth fix
Supabase anon-key selection and service-role exclusion -> verified
Supabase API-key rejection -> safe 503 verified
Phase 12 OpenAPI Bearer security boundary -> verified
Phase 12 authenticated PostgreSQL HTTP lifecycle -> passed with cleanup
Python compileall after Phase 12 -> passed
405 tests passed, 8 opt-in integration tests skipped in the default suite
108 focused Career/Job Application/model/migration tests passed, 3 opt-in skipped
Career/application migration 20260925190000 -> applied and ledger-recorded
Live ON DELETE SET NULL retention lifecycle -> passed with cleanup
Live historical Job Application HTTP flow   -> passed with cleanup
Live Career retention service lifecycle     -> passed with cleanup
Live resume-present application lifecycle   -> passed with cleanup
FastAPI startup and corrected OpenAPI        -> passed
Python compileall after correction           -> passed
399 tests passed, 8 opt-in integration tests skipped before correction
117 focused optional-resume/schema/model/migration/Phase 9 tests passed
Temporary no-resume PostgreSQL HTTP lifecycle -> passed with cleanup
Existing resume-present PostgreSQL lifecycle  -> passed with cleanup
55 focused Job Application tests passed, 2 opt-in integration tests skipped
Real Job Application PostgreSQL service lifecycle -> passed with cleanup
Real Job Application FastAPI HTTP lifecycle       -> passed with cleanup
Phase 9 OpenAPI six-operation surface             -> verified
Phase 9 public/admin response separation          -> verified
Phase 9 status/notes PATCH contract               -> verified
Phase 9 private signed resume access contract     -> verified with mock Storage
Phase 9 upload/delete cleanup behavior            -> verified
Phase 9 create/update/delete safe audit context   -> verified
Python compileall after Phase 9                    -> passed
339 tests passed, 6 opt-in integration tests skipped in the default suite
83 focused Career tests passed, 1 opt-in integration test skipped
Real Career PostgreSQL retention lifecycle integration test -> 1 passed
Live Career Swagger/API verification       -> passed with temporary-data cleanup
Career OpenAPI exact five-operation surface -> verified
Career list published_at DESC ordering      -> verified
Career generated/preserved published_at     -> verified
Career duplicate slug                       -> 409 verified
Career delete with applications             -> 204; application retained with null FK
Career successful hard delete               -> 204 with empty body
Python compileall after Phase 8              -> passed
256 tests passed, 5 opt-in integration tests skipped in the default suite
261 tests passed with all configured PostgreSQL integration tests enabled under
the required Windows Selector event-loop policy
68 focused Team schema/repository/service/API/model/migration tests passed
Real Team PostgreSQL lifecycle integration test -> 1 passed
Team visibility migration                     -> applied and ledger-recorded
Live team_members.is_visible column            -> absent
Live ix_team_members_visible_order index        -> absent
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
Team OpenAPI exact five-operation surface -> verified
Team nullable URL contract                -> verified
Team mutation/audit atomicity              -> verified
Python compileall after Phase 10           -> passed
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
- The Supabase Google provider and Phase 12 FastAPI authentication/authorization
  are implemented. No Admin Panel exists, so browser end-to-end Google login
  verification remains pending and is not claimed as complete.
- The Phase 13 gateway and all four resource workflows are implemented. Live
  hosted Storage verification remains pending because the configured
  `SUPABASE_SERVICE_ROLE_KEY` does not currently have a recognized privileged
  Supabase server-key format. This is a deployment/configuration prerequisite;
  credentials were not changed by the implementation.
- Storage RLS policies for browser roles remain intentionally absent. FastAPI
  owns authorization and uses its server-only privileged credential.
- External integrations are not initialized.
- Resource APIs and business workflows other than Blogs, Case Studies,
  Careers, Job Applications, Team Members, and Contact Submissions are not
  implemented.
- Docker and AWS deployment are not configured.

The existing Node/TypeScript scaffold remains unchanged.

## Next task

Phases 6 through 13 are implemented. Phase 13 requires a valid privileged
Supabase server credential before live upload, public URL, signed URL, and
deletion verification can be completed against the four provisioned buckets.
The future Admin Panel must implement its Supabase browser login and send access
tokens to the protected APIs; that browser flow cannot be verified until the
Admin Panel exists.
