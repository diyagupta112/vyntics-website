# Vyntics Website Backend --- FastAPI Implementation Plan

## 1. Purpose

This is the implementation plan and working specification for the
Vyntics website backend.

The backend will use **FastAPI / Python** inside:

``` text
apps/api/
```

The repository already contains an earlier Node/TypeScript API scaffold
in `apps/api`. Per the team's decision, those existing files are left
as-is. The FastAPI implementation is added in the same `apps/api`
application area.

The public website and Admin Panel are separate clients of the FastAPI
API.

``` text
Public Website (Next.js) ──┐
                           ├──> FastAPI ──> Database
Admin Panel ── Auth ───────┘       │
                                   └──> Supabase Storage
```

------------------------------------------------------------------------

## 2. Codex Operating Rules

Codex is the implementation assistant.

### Mandatory

-   **Do not commit.**
-   **Do not push.**
-   **Do not create commits automatically.**
-   Do not run `git reset`, branch-changing commands, or destructive Git
    operations unless explicitly requested.
-   Do not modify `main` or `dev`.
-   Work only on the developer's feature branch.
-   Do not delete or rewrite the existing Node/TypeScript scaffold in
    `apps/api` unless explicitly requested.
-   Do not modify `apps/web` or `apps/admin` unless a task explicitly
    requires an integration change.
-   Do not invent API endpoints, request fields, response fields, roles,
    statuses, or business rules.
-   Do not put secrets in source code.
-   Do not create production credentials.
-   Do not make destructive database changes without approval.
-   Implement one task at a time.
-   After each task, run relevant tests/checks and report the changes.
-   The developer reviews the diff and commits manually.

### Manual Git workflow

Codex stops after implementation/testing.

The developer handles:

``` bash
git status
git diff
git add ...
git commit ...
git push ...
```

------------------------------------------------------------------------

## 3. Repository Boundary

Relevant structure:

``` text
vyntics_website/
├── apps/
│   ├── admin/                 # Admin Panel frontend
│   ├── api/                   # FastAPI backend
│   │   ├── package.json       # old Node scaffold — leave as-is
│   │   ├── tsconfig.json      # old TypeScript config — leave as-is
│   │   └── src/
│   │       ├── index.ts       # old Node scaffold — leave as-is
│   │       ├── routes/
│   │       └── services/
│   └── web/                   # Public website frontend
│
├── packages/
├── supabase/
│   ├── functions/
│   └── migrations/
├── tests/
└── docs/
```

FastAPI remains under `apps/api`.

A Python structure can be introduced there, for example:

``` text
apps/api/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── routes/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── core/
│   └── db/
├── tests/
├── pyproject.toml
└── ...
```

The exact internal structure may be improved if it does not change the
external contract.

------------------------------------------------------------------------

## 4. Architecture

### FastAPI owns

-   HTTP API routes
-   request validation
-   response serialization
-   application/business logic
-   authorization checks
-   database access
-   storage operations
-   file validation
-   audit logging
-   API documentation
-   backend tests

### Supabase provides

-   Authentication
-   PostgreSQL database
-   Storage

Normal application flow:

``` text
Client → FastAPI → Supabase
```

Clients should not bypass FastAPI for normal application workflows.

### Admin authentication

``` text
Google OAuth
    ↓
Supabase Auth
    ↓
Admin Panel
    ↓
authenticated FastAPI request
    ↓
authorization/application logic
```

Only authorized `@vyntics.com` Google accounts are allowed for the Admin
Panel.

FastAPI does not implement Google OAuth itself. It verifies the
authenticated Supabase identity/token and performs authorization.

Supabase Auth and the Vyntics application database have separate
responsibilities:

-   **Supabase Auth** is the authentication identity/source of truth.
-   **`admin_users`** maps a Supabase identity through the unique
    `auth_user_id` and stores Vyntics-specific role and active state.
-   **FastAPI** will use the authenticated Supabase identity and the
    matching `admin_users` record to enforce authorization.

The initial application roles are `superadmin` and `admin`. Their
permission matrix is deferred to the authentication/authorization
phase. There is no generic public `users` table and no separate roles
table.

### AWS

AWS is the infrastructure/hosting layer for FastAPI. Deployment is a
later phase.

------------------------------------------------------------------------

# 5. Current Backend Scope

Current resources:

``` text
/blogs
/case-studies
/careers
/job-applications
/our-team
/contact-us
/logs
```

Explicitly removed from current scope:

-   clients
-   testimonials
-   newsletters
-   standalone media-library module
-   separate admin-user/roles module

Deferred:

-   larger SEO manager
-   analytics

**SEO metadata itself is in scope** wherever required by the current API
contracts.

The separate content-generation system remains a separate application.
Do not merge it into this backend.

------------------------------------------------------------------------

# 6. Approved Public API Contracts

## Blogs

### `GET /blogs`

``` json
{
  "data": [
    {
      "id": "uuid",
      "slug": "example-blog-slug",
      "title": "Example Blog Title",
      "author": "Author Name",
      "category": "Artificial Intelligence",
      "excerpt": "Short description of the blog...",
      "cover_image_url": "https://...",
      "read_time": 8,
      "published_at": "2026-09-22T10:30:00Z"
    }
  ]
}
```

Listing is intentionally lightweight. Do not include full content,
`seo_title`, or `meta_description`.

### `GET /blogs/{slug}`

``` json
{
  "id": "uuid",
  "slug": "example-blog-slug",
  "title": "Example Blog Title",
  "seo_title": "Example Blog Title | Vyntics",
  "meta_description": "A short description of the blog for search engines and page metadata.",
  "author": "Author Name",
  "category": "Artificial Intelligence",
  "excerpt": "Short description of the blog...",
  "cover_image_url": "https://...",
  "read_time": 8,
  "content": {},
  "published_at": "2026-09-22T10:30:00Z"
}
```

`title` is the visible H1. `seo_title` is document/page title metadata.
`meta_description` is page metadata. `content` is structured rich
content.

------------------------------------------------------------------------

## Case Studies

### `GET /case-studies`

``` json
{
  "data": [
    {
      "id": "uuid",
      "slug": "example-case-study",
      "title": "Example Case Study",
      "client_name": "Example Client",
      "excerpt": "A short description of the case study...",
      "cover_image_url": "https://...",
      "tech_stack": ["Python", "FastAPI", "AWS"],
      "tags": ["AI", "Web Development"],
      "published_at": "2026-09-22T10:30:00Z"
    }
  ]
}
```

### `GET /case-studies/{slug}`

``` json
{
  "id": "uuid",
  "slug": "example-case-study",
  "title": "Example Case Study",
  "seo_title": "Example Case Study | Vyntics",
  "meta_description": "A short description of the case study for search engines and page metadata.",
  "client_name": "Example Client",
  "excerpt": "A short description of the case study...",
  "cover_image_url": "https://...",
  "tech_stack": ["Python", "FastAPI", "AWS"],
  "tags": ["AI", "Web Development"],
  "content": {},
  "published_at": "2026-09-22T10:30:00Z"
}
```

Structured content may include headings, paragraphs, lists, images,
links, and videos.

Video is represented by a URL/reference, not file bytes:

``` json
{
  "type": "video",
  "attrs": {
    "src": "https://..."
  }
}
```

------------------------------------------------------------------------

## Careers

### `GET /careers`

``` json
{
  "data": [
    {
      "id": "uuid",
      "slug": "senior-software-engineer",
      "title": "Senior Software Engineer",
      "location": "Remote",
      "employment_type": "Full-time",
      "department": "Engineering",
      "experience": "3+ years",
      "short_description": "We are looking for a Senior Software Engineer...",
      "published_at": "2026-09-22T10:30:00Z"
    }
  ]
}
```

### `GET /careers/{slug}`

``` json
{
  "id": "uuid",
  "slug": "senior-software-engineer",
  "title": "Senior Software Engineer",
  "location": "Remote",
  "employment_type": "Full-time",
  "department": "Engineering",
  "experience": "3+ years",
  "short_description": "We are looking for a Senior Software Engineer...",
  "description": {},
  "responsibilities": {},
  "requirements": {},
  "nice_to_have": {},
  "benefits": {},
  "published_at": "2026-09-22T10:30:00Z"
}
```

Long-form sections use structured content.

------------------------------------------------------------------------

## Job Applications

### `POST /careers/{slug}/apply`

Content type:

``` text
multipart/form-data
```

Fields:

-   `name` --- required string
-   `email` --- required email
-   `phone` --- required string
-   `resume` --- required file
-   `cover_letter` --- optional string

Resume formats:

-   `.pdf`
-   `.doc`
-   `.docx`

Validate both extension and MIME/content type as appropriate.

Backend must:

1.  Resolve the career slug to the internal job.
2.  Confirm the job exists.
3.  Confirm it is open/accepting applications.
4.  Validate applicant data.
5.  Validate the resume.
6.  Store the resume through backend-managed storage.
7.  Create the application.
8.  Set internal fields.

Frontend must not submit:

-   `job_id`
-   `status`
-   `submitted_at`
-   `resume_url`
-   `notes`

------------------------------------------------------------------------

## Our Team

### `GET /our-team`

``` json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "role": "Chief Executive Officer",
      "bio": "John leads Vyntics and focuses on...",
      "photo_url": "https://...",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "display_order": 1,
      "member_type": "leadership"
    },
    {
      "id": "uuid",
      "name": "Jane Smith",
      "role": "Software Engineer",
      "bio": "Jane works on...",
      "photo_url": "https://...",
      "linkedin_url": "https://linkedin.com/in/janesmith",
      "display_order": 2,
      "member_type": "team"
    }
  ]
}
```

`member_type` values:

-   `leadership`
-   `team`

Backend filters hidden members and does not expose internal
`is_visible`.

No individual public team-member endpoint.

------------------------------------------------------------------------

## Contact Us

### `POST /contact-us`

Request:

``` json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Company",
  "subject": "Website Development Inquiry",
  "message": "We would like to discuss building a new website for our company.",
  "source_page": "/"
}
```

Fields:

-   `name` --- required
-   `email` --- required
-   `company` --- optional
-   `subject` --- required
-   `message` --- required
-   `source_page` --- required

Do not accept backend/admin fields from the frontend:

-   `id`
-   `status`
-   `submitted_at`
-   `notes`
-   `resolved_at`
-   `resolved_by`

The exact success/error response shape is not finalized yet; do not
invent it.

------------------------------------------------------------------------

# 7. Database Design

Core entities:

``` text
admin_users
blogs
case_studies
careers
job_applications
team_members
contact_submissions
audit_logs
```

## Admin Users

Support:

-   UUID primary key
-   unique Supabase Auth user UUID in `auth_user_id`
-   administrator email for application/audit display
-   role (`superadmin` or `admin`)
-   active flag, defaulting to active
-   audit timestamps

Supabase Auth remains the authentication source of truth. The
`admin_users` table is the Vyntics application-level administrator
identity and authorization record. Disabling an administrator does not
delete the record. No generic public `users` table or separate roles
table is part of this schema.

## Blogs

Support:

-   UUID primary key
-   unique slug
-   title
-   SEO title
-   meta description
-   excerpt
-   author
-   category
-   structured content
-   cover image URL/reference
-   read time
-   publication status
-   published timestamp
-   audit timestamps
-   creator/updater where applicable

## Case Studies

Support:

-   UUID primary key
-   unique slug
-   title
-   client name
-   SEO title
-   meta description
-   excerpt
-   structured content
-   cover image URL/reference
-   tech stack
-   tags
-   publication status
-   published timestamp
-   audit timestamps
-   creator/updater where applicable

## Careers

Support:

-   UUID primary key
-   unique slug
-   title
-   location
-   employment type
-   department
-   experience
-   short description
-   structured detail sections
-   published timestamp
-   audit timestamps
-   creator/updater references where applicable

Careers intentionally have no status, active, visible, or archived
column at this stage. The future Admin Panel workflow for removing a
career from public presentation is not defined by this schema.

## Job Applications

Support:

-   UUID primary key
-   career/job foreign key
-   applicant name
-   applicant email
-   phone
-   cover letter
-   resume URL/reference
-   application status
-   notes
-   submitted timestamp

## Team Members

Support:

-   UUID primary key
-   name
-   role
-   bio
-   photo URL/reference
-   LinkedIn URL
-   display order
-   visibility flag
-   timestamps
-   creator/updater references where applicable

## Contact Submissions

Support:

-   UUID primary key
-   name
-   email
-   company
-   subject
-   message
-   source page
-   status
-   internal notes
-   submitted timestamp
-   resolved timestamp
-   resolver reference to `admin_users`

## Audit Logs

Support:

-   UUID primary key
-   nullable administrator actor reference for system-generated events
-   actor email snapshot where applicable
-   action
-   resource type
-   nullable resource UUID
-   JSONB context
-   event timestamp

Audit context must not store credentials, tokens, secrets, private
message contents, or other unnecessary sensitive data.

------------------------------------------------------------------------

# 8. Database Migrations

Supabase SQL migrations are the only database schema migration source
of truth:

``` text
supabase/migrations/
```

Do not add Alembic and do not use SQLAlchemy `metadata.create_all()` as
a schema-management mechanism. Schema changes must be represented by
reviewed SQL migrations that can reproduce the schema from an empty
Supabase PostgreSQL database.

Supabase Auth and Storage remain Supabase-managed.

------------------------------------------------------------------------

# 9. Phased Implementation

## Phase 1 --- FastAPI Bootstrap

-   [ ] Add Python project configuration under `apps/api`.
-   [ ] Add FastAPI.
-   [ ] Add Uvicorn.
-   [ ] Add Python dependency management.
-   [ ] Create `main.py`.
-   [ ] Create FastAPI app.
-   [ ] Add `/health`.
-   [ ] Register routers.
-   [ ] Add basic CORS foundation.
-   [ ] Add global exception foundation.
-   [ ] Verify `/docs`.
-   [ ] Add a basic startup test.

**Definition of done:**

``` text
GET /health → 200
GET /docs   → Swagger UI
```

The app should boot without requiring a live database.

------------------------------------------------------------------------

## Phase 2 --- Configuration

-   [ ] Create typed settings/configuration.
-   [ ] Separate development/test/production configuration.
-   [ ] Configure database settings.
-   [ ] Configure Supabase settings.
-   [ ] Configure auth settings.
-   [ ] Configure storage settings.
-   [ ] Configure CORS origins.
-   [ ] Configure logging.
-   [ ] Add/update `.env.example`.
-   [ ] Ensure secrets are never committed.

Database credentials/project setup can be completed manually.

------------------------------------------------------------------------

## Phase 3 --- Database Layer

-   [ ] Configure SQLAlchemy/PostgreSQL.
-   [ ] Configure connection/session management.
-   [ ] Create declarative base.
-   [ ] Create ORM models.
-   [ ] Create relationships.
-   [ ] Create indexes.
-   [ ] Create unique constraints.
-   [ ] Configure UUIDs/timestamps.
-   [ ] Configure JSON/JSONB structured content.
-   [ ] Configure PostgreSQL arrays where required.
-   [ ] Create Supabase SQL migrations.
-   [ ] Review initial migration.
-   [ ] Add DB integration tests.

ORM models must not be returned directly from API routes.

------------------------------------------------------------------------

## Phase 4 --- Pydantic/API Schemas

-   [ ] Create request schemas.
-   [ ] Create update schemas where needed.
-   [ ] Create list response schemas.
-   [ ] Create detail response schemas.
-   [ ] Create query/filter schemas where needed.
-   [ ] Validate required/optional fields.
-   [ ] Validate emails/URLs.
-   [ ] Validate slugs.
-   [ ] Validate enums/statuses.
-   [ ] Validate structured content.
-   [ ] Validate multipart fields.
-   [ ] Prevent internal fields from being client-controlled.

Public responses must match the approved contracts exactly.

------------------------------------------------------------------------

## Phase 5 --- Database Connectivity Foundation

-   [ ] Load `DATABASE_URL` from backend-only environment configuration.
-   [ ] Support the Supabase PostgreSQL Session Pooler through SQLAlchemy's
    asynchronous Psycopg 3 dialect.
-   [ ] Use an application-side asynchronous connection pool with connection
    pre-ping.
-   [ ] Initialize engine/session resources during the FastAPI lifespan without
    connecting at import time.
-   [ ] Dispose the engine during application shutdown.
-   [ ] Provide one request/task-scoped `AsyncSession` through a FastAPI
    dependency.
-   [ ] Roll back failed request work without silently committing transactions.
-   [ ] Provide an explicit development/test connectivity check without adding a
    public production endpoint.
-   [ ] Add an opt-in integration test against the configured PostgreSQL
    database.

Supabase SQL migrations remain the sole schema migration source of truth. Do
not use `metadata.create_all()` or add Alembic. Raw database errors and database
credentials must not be exposed through public API responses or connectivity
command output.

HTTP error contracts, authentication responses, pagination, and other broader
API infrastructure remain in their dedicated later phases; they are not
invented as part of database connectivity.

------------------------------------------------------------------------

## Phase 6 — Blogs

### Confirmed Phase 6 API contract decisions

These decisions are authoritative for the Phase 6 implementation and resolve
the previously open Blog contract questions.

#### Public listing order

- `GET /blogs` returns published Blogs ordered by `published_at DESC`.

#### Admin mutation responses

- `POST /blogs` returns `201 Created`.
- `PATCH /blogs/{id}` returns `200 OK`.
- Both endpoints return the same admin Blog response containing exactly:
  `id`, `slug`, `title`, `seo_title`, `meta_description`, `author`, `category`,
  `excerpt`, `cover_image_url`, `read_time`, `content`, `status`,
  `published_at`, `created_at`, and `updated_at`.
- The admin Blog response does not expose `created_by` or `updated_by`.
- `DELETE /blogs/{id}` performs a hard delete and returns `204 No Content`.
- Blog deletion does not introduce archived or soft-delete behavior.

#### Publishing behavior

- When a Blog enters `status=published`, the backend sets `published_at`.
- While a Blog remains published, the backend preserves its existing
  `published_at`.
- When a Blog moves from `published` to `draft` or `unpublished`, the backend
  clears `published_at`.

#### Cover image behavior

- `cover_image_url` is optional for draft and unpublished Blogs.
- `cover_image_url` is required when `status=published`.

#### Audit logging

- Blog mutations use the actions `create`, `update`, and `delete`.
- Blog audit records use `resource_type=blog`.
- The audit actor is nullable until authentication is implemented.
- Audit context may contain the Blog slug, status, and changed field names.
- Audit context must never contain full Blog content.

#### Validation

- Required strings must be non-empty.
- `status` must be one of `draft`, `published`, or `unpublished`.
- URL fields must contain valid URLs.
- `content` must be a JSON object.
- Do not invent SEO length limits.
- Do not invent a Tiptap-specific content structure.

#### Errors

- Use FastAPI's standard error response format: `{"detail": "..."}`.
- Return `404 Not Found` for missing Blog resources.
- Return `409 Conflict` for Blog slug conflicts.
- Use the appropriate standard validation response for invalid request data.

#### Contract boundaries

- Existing Phase 4 schemas and established frontend API contracts remain the
  source of truth.
- Do not infer request fields solely from the database model.
- Do not add archived, scheduled, duplicate, or other Blog functionality.

- [ ] Use the existing Blog model from the database layer.
- [ ] Use the existing Blog Pydantic schemas and extend them only where a required Phase 6 request schema is missing.
- [ ] Implement Blog repository/data access.
- [ ] Implement Blog service layer.
- [ ] Implement Blog API routes.

### Public endpoints

- [ ] `GET /blogs` — return all published blogs using the established public list response contract.
  - [ ] Return only published blogs.
  - [ ] Do not expose full `content`, `seo_title`, or `meta_description` in the list response.
- [ ] `GET /blogs/{slug}` — return a single published blog using the established public detail response contract.
  - [ ] Return the full public Blog detail including SEO fields and structured `content`.
  - [ ] Return `404 Not Found` when the slug does not match a published blog.

### Admin endpoints

The following endpoints are intended for authenticated and authorized Admin Panel usage. Authentication and authorization enforcement will be implemented in the later authentication phase. Do not introduce temporary, mock, or fake authentication in Phase 6.

- [ ] `POST /blogs` — create a new blog.
  - [ ] Request body uses the established Blog request schema.
  - [ ] Support `slug`, `title`, `seo_title`, `meta_description`, `author`, `category`, `excerpt`, `cover_image_url`, `read_time`, `content`, and `status`.
  - [ ] Allow only the existing Blog statuses: `draft`, `published`, and `unpublished`.
  - [ ] Do not accept backend-managed fields such as `id`, `created_at`, `updated_at`, `created_by`, or `updated_by` from the client.
  - [ ] Validate required fields, SEO fields, structured content, slug uniqueness, and status.
  - [ ] Return an appropriate conflict response when the slug already exists.

- [ ] `PATCH /blogs/{id}` — update an existing blog.
  - [ ] Request body uses the established Blog update/request schema.
  - [ ] Support updating the established Blog fields.
  - [ ] The Blog `id` is provided through the URL path, not the request body.
  - [ ] Do not accept backend-managed fields from the client.
  - [ ] Validate supplied fields, SEO fields, structured content, slug uniqueness when changed, and status.
  - [ ] Return `404 Not Found` when the Blog does not exist.
  - [ ] Return an appropriate conflict response when the updated slug conflicts with another Blog.

- [ ] `DELETE /blogs/{id}` — delete a Blog according to the established backend deletion behavior.
  - [ ] No request body.
  - [ ] Return `404 Not Found` when the Blog does not exist.
  - [ ] Do not introduce an `archived` or other new deletion status.

### Blog rules and validation

- [ ] Published-content filtering for public endpoints.
- [ ] Unique slug handling and conflict detection.
- [ ] SEO validation.
- [ ] Structured-content validation.
- [ ] Preserve the existing Blog statuses: `draft`, `published`, and `unpublished`.
- [ ] Return appropriate validation errors for invalid request data.
- [ ] Do not introduce `archived`, `scheduled`, or any other new Blog statuses.
- [ ] Do not introduce additional Blog endpoints outside this Phase 6 scope.
- [ ] Use the existing API contracts and Pydantic schemas as the source of truth for API request and response shapes.
- [ ] Do not infer API request fields solely from the database model.
- [ ] Integrate important admin mutations with the existing audit-log design.

### Architecture and database

- [ ] Follow the existing FastAPI → service → repository → AsyncSession architecture.
- [ ] Use the existing async database/session infrastructure from Phase 5.
- [ ] Keep repository methods responsible for database access.
- [ ] Keep transaction ownership in the service/application layer.
- [ ] Wire all Blog routes into the FastAPI application.
- [ ] Do not modify the existing Node/TypeScript API scaffold.

### Testing and verification

- [ ] Repository/unit tests for Blog data access.
- [ ] Service-layer tests for Blog business logic.
- [ ] API contract tests for all Blog endpoints.
- [ ] Validation tests for Blog request schemas.
- [ ] Duplicate slug tests.
- [ ] Published-content filtering tests.
- [ ] `404 Not Found` tests.
- [ ] Database integration tests against PostgreSQL/Supabase.
- [ ] Verify all Blog endpoints through FastAPI Swagger.
- [ ] Use Swagger to create a real Blog with `POST /blogs`.
- [ ] Verify the created Blog is persisted correctly in the development Supabase `blogs` table.
- [ ] Use Swagger to verify `GET`, `PATCH`, and `DELETE` behavior against the development database.
- [ ] Run the complete backend test suite after implementation.

### Phase 6 — Additional Work: Admin Blog Read Endpoints

**Status:** Identified and planned; not yet implemented.

#### Purpose

The public Blog GET endpoints intentionally expose only published content. The
Admin Panel requires separate read endpoints so administrators can view and
manage Blogs regardless of publication status.

#### Admin listing endpoint

- [ ] `GET /admin/blogs` — return Blogs with all supported statuses:
  `draft`, `published`, and `unpublished`.
- [ ] Do not apply the public published-only filter to this endpoint.
- [ ] Use the established admin Blog response shape and existing schemas where
  appropriate.
- [ ] Do not introduce new Blog fields or statuses.
- [ ] Treat this as a conceptually admin-protected operation. Authentication and
  authorization are not implemented yet; do not add fake or temporary
  authentication for this work.

#### Admin detail endpoint

- [ ] `GET /admin/blogs/{id}` — return a specific Blog by its database UUID,
  regardless of whether its status is `draft`, `published`, or `unpublished`.
- [ ] Use the established admin Blog response shape.
- [ ] Return `404 Not Found` when the Blog does not exist.
- [ ] Use the database ID rather than the slug because the Admin Panel may edit
  the slug.
- [ ] Treat this as a conceptually admin-protected operation. Authentication and
  authorization are not implemented yet; do not add fake or temporary
  authentication for this work.

#### Public/admin separation

Public operations remain unchanged:

- `GET /blogs` — published Blogs only.
- `GET /blogs/{slug}` — published Blog detail only.

Admin operations are:

- `GET /admin/blogs` — all Blog statuses.
- `GET /admin/blogs/{id}` — a specific Blog regardless of status.
- `POST /blogs` — existing admin create operation.
- `PATCH /blogs/{id}` — existing admin update operation.
- `DELETE /blogs/{id}` — existing admin hard-delete operation.

Do not add an `include_drafts` query parameter or change the behavior of either
public GET endpoint. Do not introduce archived or scheduled statuses, new Blog
statuses, soft deletion, duplicate-post functionality, fake authentication, or
authorization implementation.

#### Additional testing and verification

- [ ] Verify `GET /admin/blogs` returns draft Blogs.
- [ ] Verify `GET /admin/blogs` returns published Blogs.
- [ ] Verify `GET /admin/blogs` returns unpublished Blogs.
- [ ] Verify `GET /admin/blogs/{id}` returns a draft Blog.
- [ ] Verify `GET /admin/blogs/{id}` returns a published Blog.
- [ ] Verify `GET /admin/blogs/{id}` returns an unpublished Blog.
- [ ] Verify `GET /admin/blogs/{id}` returns `404 Not Found` for an unknown ID.
- [ ] Verify public `GET /blogs` continues returning published Blogs only.
- [ ] Verify public `GET /blogs/{slug}` continues returning published Blogs only.
- [ ] Verify the admin endpoints against the real Supabase database where
  possible.
- [ ] Verify Swagger/OpenAPI exposes both new admin endpoints correctly.

------------------------------------------------------------------------

## Phase 7 — Case Studies

- [ ] Case study model.
- [ ] Schemas.
- [ ] Repository.
- [ ] Service.
- [ ] `GET /case-studies`.
- [ ] `GET /case-studies/{slug}`.
- [ ] Tech stack/tags.
- [ ] Structured content.
- [ ] Image/video references.
- [ ] Unique slug.
- [ ] Published-content behavior.
- [ ] Tests.

### Phase 7 — API Scope and Confirmed Behavior

Case Studies follow the same overall public/admin separation established during the Blogs phase.

The existing Phase 4 public Case Study schemas remain the source of truth for the public API. Phase 7 must add the create, update, and admin response schemas defined below; those schemas do not already exist and must not be inferred solely from the SQLAlchemy model or database table.

The database contains these Case Study fields:

- `id`
- `slug`
- `title`
- `seo_title`
- `meta_description`
- `client_name`
- `excerpt`
- `cover_image_url`
- `tech_stack`
- `tags`
- `content`
- `status`
- `published_at`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

The API contracts below deliberately separate client-editable fields, public response fields, admin response fields, and backend-managed fields. Do not introduce additional Case Study fields.

### Case Study Request Contracts

#### Create request

The request body for `POST /case-studies` contains exactly these client-editable fields:

- `slug`
- `title`
- `seo_title`
- `meta_description`
- `client_name`
- `excerpt`
- `cover_image_url`
- `tech_stack`
- `tags`
- `content`
- `status`

The client must not provide these backend-managed fields:

- `id`
- `published_at`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

All create fields are required except `cover_image_url`, which may be omitted or `null` for `draft` and `unpublished` Case Studies. A valid `cover_image_url` is required when the requested status is `published`.

#### Update request

The request body for `PATCH /case-studies/{id}` uses the same editable field set as the create request, with every field optional and omittable so the request can represent a partial update.

- Omitted fields retain their current values.
- The Case Study UUID is supplied only through the path and must not appear in the request body.
- Backend-managed fields are not accepted in the request body.
- Explicit `null` is rejected for database-required fields: `slug`, `title`, `seo_title`, `meta_description`, `client_name`, `excerpt`, `tech_stack`, `tags`, `content`, and `status`.
- `cover_image_url` may be explicitly set to `null` only when the resulting Case Study status is `draft` or `unpublished`.
- The resulting resource, after combining stored values with supplied changes, must satisfy every publication and validation rule in this section.

### Case Study Admin Response Contract

The admin response used by create, update, admin list, and admin detail contains exactly:

- `id`
- `slug`
- `title`
- `seo_title`
- `meta_description`
- `client_name`
- `excerpt`
- `cover_image_url`
- `tech_stack`
- `tags`
- `content`
- `status`
- `published_at`
- `created_at`
- `updated_at`

Do not expose `created_by` or `updated_by` in this Phase 7 response contract. They remain internal ownership fields until the authentication contract is implemented.

### Public Case Study Endpoints

#### `GET /case-studies`

Public Case Study listing endpoint.

Behavior:

- Return only Case Studies with `status=published`.
- Order results by `published_at DESC`.
- Preserve the existing Phase 4 public list response envelope and item schema.
- Each public list item contains `id`, `slug`, `title`, `client_name`, `excerpt`, `cover_image_url`, `tech_stack`, `tags`, and `published_at`.
- Do not expose `content`, `seo_title`, `meta_description`, `status`, ownership fields, or administrative timestamps in the public list response.

#### `GET /case-studies/{slug}`

Public Case Study detail endpoint.

Behavior:

- Return only a published Case Study.
- Resolve the Case Study using its `slug`.
- Preserve the existing Phase 4 public detail response schema.
- The public detail response contains `id`, `slug`, `title`, `seo_title`, `meta_description`, `client_name`, `excerpt`, `cover_image_url`, `tech_stack`, `tags`, `content`, and `published_at`.
- Do not expose `status`, ownership fields, or administrative timestamps in the public detail response.
- Return HTTP `404` when the slug does not correspond to a published Case Study.

Public endpoints must not expose draft or unpublished Case Studies.

### Admin Case Study Mutation Endpoints

The Admin Panel requires create, update, and delete operations.

These operations are conceptually admin-protected, but authentication and authorization are intentionally deferred to a later phase.

#### `POST /case-studies`

Create a Case Study.

Request body must use the Phase 7 create request contract defined above.

Response:

- HTTP `201 Created`.
- Return the Phase 7 admin Case Study response contract defined above.

Validation:

- Required string fields must be non-empty.
- `status` must be one of:
  - `draft`
  - `published`
  - `unpublished`
- URL fields must be valid URLs.
- `tech_stack` must be an array of strings.
- `tags` must be an array of strings.
- `content` must be a JSON object.
- `slug` must be unique.
- Return HTTP `409` for duplicate slug.

#### `PATCH /case-studies/{id}`

Update a Case Study.

Behavior:

- Use the Phase 7 partial-update request contract defined above.
- The Case Study database UUID is provided through the path.
- The ID must not be accepted in the request body.
- Return HTTP `200 OK`.
- Return the Phase 7 admin Case Study response contract defined above.
- Return HTTP `404` when the Case Study does not exist.
- Return HTTP `409` when the requested slug conflicts with another Case Study.
- Apply validation to the resulting resource, not only to fields present in the patch.

#### `DELETE /case-studies/{id}`

Delete a Case Study.

Behavior:

- Perform a hard delete.
- Return HTTP `204 No Content`.
- Return HTTP `404` when the Case Study does not exist.
- Do not introduce soft deletion.
- Do not introduce an archived status.

### Admin Case Study Read Endpoints

The Admin Panel must be able to view and manage Case Studies regardless of publication status.

These endpoints are additional Phase 7 work and are separate from the public read endpoints.

#### `GET /admin/case-studies`

Admin Case Study listing endpoint.

Behavior:

- Return all Case Studies regardless of status.
- Include:
  - `draft`
  - `published`
  - `unpublished`
- Do not apply the public published-only filter.
- Return a JSON array of Phase 7 admin Case Study response objects.
- This endpoint is conceptually an admin operation.

#### `GET /admin/case-studies/{id}`

Admin Case Study detail endpoint.

Behavior:

- Return one Case Study using its database UUID.
- Return the Case Study regardless of status:
  - `draft`
  - `published`
  - `unpublished`
- Return the Phase 7 admin Case Study response contract.
- Return HTTP `404` when the Case Study does not exist.
- Use the database UUID rather than the slug because the slug may be edited by the Admin Panel.

### Status

Only the following Case Study statuses are supported:

- `draft`
- `published`
- `unpublished`

Do not introduce:

- `archived`
- `scheduled`
- any other status

### Published Timestamp Behavior

Case Studies follow the confirmed publication timestamp behavior established for Blogs:

- When a Case Study enters `published` status, set `published_at`.
- While a Case Study remains `published`, preserve its existing `published_at`.
- When a Case Study moves from `published` to `draft` or `unpublished`, clear `published_at`.

### Cover Image Behavior

`cover_image_url` follows the established publication behavior:

- Optional for `draft`.
- Optional for `unpublished`.
- Required when `status=published`.

The API must reject a published Case Study that does not have a valid `cover_image_url`.

### Tech Stack and Tags

Case Studies support the established:

- `tech_stack`
- `tags`

Both fields use arrays of strings in requests and responses, matching the existing PostgreSQL array columns and public schemas.

Do not introduce alternative representations or additional fields.

### Structured Content

Case Study `content` is structured JSON.

The API must validate that `content` is a JSON object according to the established schema/contract.

Do not invent a Tiptap-specific content structure or additional content requirements unless they already exist in the established Case Study contract.

### Image and Video References

The existing Phase 7 scope includes image/video references.

Image and video references may be represented only inside the structured `content` object. Phase 7 must not add dedicated image/video columns, request fields, response fields, or a media-library model. No provider-specific or editor-specific nested content structure is required beyond validating that `content` is a JSON object.

### Unique Slug

Case Study slugs must be unique.

Behavior:

- Creating a Case Study with an existing slug returns HTTP `409`.
- Updating a Case Study to use another existing Case Study's slug returns HTTP `409`.
- Updating a Case Study while retaining its own existing slug is allowed.

### Error Handling

Use the standard FastAPI error response structure:

```json
{
  "detail": "..."
}
```

- Return HTTP `404` for a missing Case Study in admin detail, update, or delete operations.
- Return HTTP `404` from public detail when the slug is missing or belongs to a non-published Case Study.
- Return HTTP `409` for create or update slug conflicts.
- Let FastAPI return its standard HTTP `422` validation response for malformed UUID path values and invalid request data.
- Do not expose database exception details in API responses.

### Audit Logging

Every successful Case Study mutation must create an audit log in the same transaction as the mutation:

- `POST /case-studies` uses action `create`.
- `PATCH /case-studies/{id}` uses action `update`.
- `DELETE /case-studies/{id}` uses action `delete`.
- `resource_type` is `case_study`.
- The actor is nullable until authentication is implemented.
- Audit context may contain the Case Study slug, status, and changed field names.
- Audit context must not contain full structured content, credentials, tokens, private data, or other sensitive values.

Repositories and services must not silently commit. The service owns the mutation and audit-log transaction boundary and rolls back the entire operation when either part fails.

### Application Structure

Implement Phase 7 through the established layering:

```text
FastAPI route
  -> Case Study service
    -> Case Study repository
      -> AsyncSession
```

- Routes handle HTTP input/output and dependency injection.
- The service applies validation, publication lifecycle, conflict handling, audit logging, and transaction boundaries.
- The repository performs SQLAlchemy queries and persistence without committing independently.
- Use the existing asynchronous database session dependency.
- Do not use `create_all()`, add Alembic, or change the Supabase migration source of truth.

### Phase 7 Testing Requirements

Automated tests must cover:

- public list returns only published Case Studies and orders them by `published_at DESC`;
- public detail returns a published Case Study by slug;
- public detail returns `404` for missing, draft, and unpublished slugs;
- create returns `201` and the exact admin response shape;
- partial update returns `200`, preserves omitted values, and returns the exact admin response shape;
- delete hard-deletes the Case Study and returns `204` with no response body;
- admin list returns all three supported statuses;
- admin detail returns draft, published, and unpublished Case Studies by UUID;
- missing-resource behavior for admin detail, update, and delete;
- invalid UUID path validation;
- duplicate slug conflicts on create and update, including allowing an unchanged slug on the same Case Study;
- accepted statuses and rejection of unsupported statuses;
- the complete `published_at` lifecycle when entering, remaining in, and leaving `published` status;
- cover image requirements based on the resulting status, including PATCH requests;
- non-empty required strings and valid URL enforcement;
- `tech_stack` and `tags` array-of-strings validation;
- JSON-object validation for `content` and rejection of non-object JSON values;
- public responses exclude admin-only fields and admin responses match their explicit contract;
- image/video references remain inside structured content without new API fields;
- create, update, and delete audit records use the required action/resource metadata and safe context;
- mutation and audit logging are atomic, including rollback behavior.

Use the established test isolation and database fixtures. Do not substitute SQLite for PostgreSQL-specific behavior.

### Manual Verification

After automated tests pass:

- Verify all seven Phase 7 routes in generated OpenAPI/Swagger documentation.
- Exercise public and admin read behavior for `draft`, `published`, and `unpublished` records.
- Exercise create, partial update, duplicate-slug, publication lifecycle, cover-image, validation, and hard-delete behavior.
- Verify in Supabase PostgreSQL that mutations, hard deletion, timestamps, status changes, and audit rows match the documented behavior.
- Do not claim real Supabase verification unless it was actually performed successfully.

### Authentication and Phase Boundaries

Admin Case Study operations are conceptually protected but remain unauthenticated until the planned authentication phase. Do not add temporary credentials, fake authentication, authorization roles, or ownership behavior in Phase 7.

Phase 7 is limited to Case Study schemas, repository, service, routes, audit integration, and tests required by this section. Do not add:

- new database fields or migrations;
- new statuses such as `scheduled` or `archived`;
- soft deletion;
- a media library or storage integration;
- analytics;
- unrelated admin functionality;
- other resource APIs.

------------------------------------------------------------------------

## Phase 8 --- Careers

-   [ ] Career/job model.
-   [ ] Schemas.
-   [ ] Repository.
-   [ ] Service.
-   [ ] `GET /careers`.
-   [ ] `GET /careers/{slug}`.
-   [ ] Public/open-job filtering.
-   [ ] Slug validation.
-   [ ] Closed/non-existent job behavior.
-   [ ] Tests.

------------------------------------------------------------------------

## Phase 9 --- Job Applications

-   [ ] Application model.
-   [ ] Multipart handling.
-   [ ] Applicant validation.
-   [ ] Resume extension validation.
-   [ ] Resume MIME/content validation.
-   [ ] File-size limits.
-   [ ] Slug-to-job resolution.
-   [ ] Open-job check.
-   [ ] Backend-managed storage.
-   [ ] Application creation.
-   [ ] Initial status `new`.
-   [ ] Prevent client-controlled internal fields.
-   [ ] Upload failure cleanup/transaction behavior.
-   [ ] Tests for valid/invalid/oversized/closed-job applications.

------------------------------------------------------------------------

## Phase 10 --- Our Team

-   [ ] Create a new Supabase migration that removes `is_visible`.
-   [ ] Update the Team Member ORM model for the corrected schema.
-   [ ] Add the create and partial-update request schemas defined below.
-   [ ] Correct the shared Team Member response schema defined below.
-   [ ] Add repository and service layers.
-   [ ] Implement the two shared read endpoints.
-   [ ] Implement the three administrative mutation endpoints.
-   [ ] Add create, update, and delete audit logging.
-   [ ] Add unit, API-contract, migration, and PostgreSQL integration tests.

### Phase 10 Product and Database Decision

A Team member has exactly two lifecycle states:

- the Team member exists;
- the Team member has been hard-deleted.

The existing `is_visible` field is no longer part of the product design and
must be removed completely during Phase 10 implementation. It must not appear
in ORM models, Pydantic schemas, repository filters, request bodies, response
bodies, or Admin Panel behavior. There is no visibility toggle.

Do not replace `is_visible` with `status`, `active`, `hidden`, `archived`, or
any other lifecycle/visibility field.

The already-applied initial migration created `team_members.is_visible` and
the `ix_team_members_visible_order` index. Do not rewrite that historical
migration. Phase 10 implementation requires one new forward migration that:

- removes the existing visibility-based index that depends on `is_visible`;
- removes the `is_visible` column safely;
- does not add a replacement visibility/status column;
- does not add a uniqueness constraint to `display_order`.

Supabase SQL migrations remain the only database migration source of truth.
The new migration must be reproducible and verified against PostgreSQL before
Phase 10 is considered complete.

### Phase 10 API Surface

Shared reads used by both the public website and Admin Panel:

- `GET /our-team`
- `GET /our-team/{id}`

Mutations with administrative intent:

- `POST /our-team`
- `PATCH /our-team/{id}`
- `DELETE /our-team/{id}`

Do not add `/admin/our-team`, `/admin/team`, or duplicate administrative read
routes. Because there is no hidden state, the same read operations return the
complete Team collection to both clients.

Authentication and authorization for mutation routes are deferred to the
approved authentication phase. Phase 10 must not add fake authentication,
temporary credentials, or role checks.

### Team Member Fields

After the Phase 10 migration, the database model contains:

- `id`
- `name`
- `role`
- `bio`
- `photo_url`
- `linkedin_url`
- `display_order`
- `member_type`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Do not add fields such as status, active/inactive, visibility, archived, slug,
email, phone, department, or employee status.

Client-editable fields are:

- `name`
- `role`
- `bio`
- `photo_url`
- `linkedin_url`
- `display_order`
- `member_type`

Backend-managed fields are:

- `id`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

`is_visible` is neither client-editable nor backend-managed after the new
migration; it no longer exists.

### Shared Team Member Response Contract

The existing `TeamMemberResponse` is the Phase 4 response foundation, but it
currently conflicts with the corrected nullable URL contract. Phase 10 must
update it rather than pretending it is already correct.

The shared response used by list, detail, create, and update contains exactly:

- `id`
- `name`
- `role`
- `bio`
- `photo_url`
- `linkedin_url`
- `display_order`
- `member_type`

`photo_url` and `linkedin_url` are optional and nullable HTTP(S) URL values:

- return the validated URL when present;
- return `null` when absent.

Do not expose `created_by`, `updated_by`, `created_at`, or `updated_at`. Do not
expose `is_visible`.

The public and Admin Panel consumers use this same response shape. Do not add a
separate admin response schema.

### Shared Team Read Endpoints

#### `GET /our-team`

- Return every existing Team member.
- Do not filter by visibility, status, type, or any other field.
- Order results by `display_order ASC`.
- Return the existing list envelope shape: `{"data": [...]}`.
- Each item uses the shared Team Member response contract.
- `display_order` is not unique. If values are equal, no additional product
  ordering rule is defined.
- Do not add pagination, filtering, searching, or client-selected sorting.

#### `GET /our-team/{id}`

- Resolve one Team member by database UUID.
- Return the shared Team Member response contract.
- Return HTTP `404 Not Found` with the standard FastAPI
  `{"detail": "..."}` shape when the member does not exist.
- Let FastAPI return its standard HTTP `422` response when the path value is not
  a valid UUID.

### Create Contract

#### `POST /our-team`

The request contains exactly these client-controlled fields:

- `name` — required;
- `role` — required;
- `bio` — required;
- `photo_url` — optional and nullable;
- `linkedin_url` — optional and nullable;
- `display_order` — required integer;
- `member_type` — required and limited to `leadership` or `team`.

Both URL fields may be omitted or explicitly set to `null`. When non-null,
each must be a valid HTTP(S) URL according to the existing Pydantic URL
validation convention. Do not add `NOT NULL` constraints or defaults for
either URL field.

The request must reject unknown fields and backend-controlled fields,
including `id`, `created_by`, `updated_by`, `created_at`, `updated_at`, and
`is_visible`.

Success response:

- Return HTTP `201 Created`.
- Return the shared Team Member response contract.

### Partial Update Contract

#### `PATCH /our-team/{id}`

Use partial-update semantics consistent with Blogs and Case Studies. Every
client-editable field may be omitted:

- omitted fields retain their existing values;
- `name`, `role`, `bio`, `display_order`, and `member_type` reject explicit
  `null` because their database columns remain required;
- `photo_url` and `linkedin_url` may each be supplied as a valid HTTP(S) URL or
  explicitly set to `null`;
- the UUID is supplied only through the path;
- backend-managed fields, `is_visible`, and unknown fields are rejected.

Return HTTP `200 OK` with the shared Team Member response contract. Return HTTP
`404 Not Found` when the UUID does not identify a Team member. Invalid UUIDs
and invalid request values use FastAPI's standard HTTP `422` response.

Do not add a PUT endpoint.

### Delete Contract

#### `DELETE /our-team/{id}`

- Perform a hard delete.
- Return HTTP `204 No Content` with an empty response body.
- Return HTTP `404 Not Found` when the Team member does not exist.
- Let FastAPI return HTTP `422` for an invalid UUID path value.
- Do not implement soft deletion, visibility toggles, archived records, or a
  replacement status field.

### Validation

- Trim surrounding whitespace from `name`, `role`, and `bio`; reject empty or
  whitespace-only values.
- Allow only `leadership` and `team` for `member_type`.
- Require `display_order` to be an integer. The existing database contract does
  not define a minimum, maximum, or uniqueness rule, so Phase 10 must not
  invent one.
- `photo_url` and `linkedin_url` are optional and nullable. Validate each
  non-null value as an HTTP(S) URL using the existing project convention.
- Reject backend-managed fields, `is_visible`, and all other undeclared fields.
- Do not invent maximum string lengths because the existing PostgreSQL columns
  are unrestricted `text` and no API limits are approved.
- Use standard FastAPI validation responses for invalid input.

### Repository and Service Architecture

Use the established layering:

```text
FastAPI route
  -> Team Member service
    -> Team Member repository
      -> AsyncSession
```

- The repository performs SQLAlchemy queries and stages persistence changes.
- The repository does not commit.
- The service owns mutation and audit-log commit/rollback boundaries.
- Use the existing asynchronous database/session lifecycle.
- The list repository query orders solely by `display_order ASC` and applies no
  visibility filter.

### Audit Logging

Create audit events for all successful Team mutations:

- `POST /our-team` uses action `create`;
- `PATCH /our-team/{id}` uses action `update`;
- `DELETE /our-team/{id}` uses action `delete`;
- `resource_type` is `team_member`;
- the actor remains nullable until authentication is implemented;
- context may contain safe metadata such as `member_type`, `display_order`, and
  changed field names;
- context must not contain full biographies, profile URLs, credentials,
  tokens, or unnecessary private data.

The mutation and its audit event must commit atomically. Audit failure must
roll back the mutation. Do not introduce a separate audit system.

### Access Boundary

Shared/public reads:

- `GET /our-team`
- `GET /our-team/{id}`

Administrative mutation intent:

- `POST /our-team`
- `PATCH /our-team/{id}`
- `DELETE /our-team/{id}`

Authentication and authorization are deferred. Do not add fake authentication
or role checks in Phase 10.

### Phase 10 Testing Requirements

Automated tests must cover:

Shared reads:

- list returns every existing Team member without visibility filtering;
- list orders solely by `display_order ASC`;
- list returns the `{"data": [...]}` envelope and exact item fields;
- detail returns one member by UUID;
- missing detail returns `404`;
- invalid UUID detail returns `422`;
- nullable `photo_url` and `linkedin_url` serialize as `null`.

Create:

- successful creation returns `201` and the shared response contract;
- required-field and trimmed/non-empty string validation;
- both approved `member_type` values and rejection of other values;
- integer `display_order` validation without invented range/uniqueness rules;
- omitted and explicit-null URL fields;
- valid non-null URL fields and invalid URL rejection;
- rejection of backend-managed fields, `is_visible`, and unknown fields;
- create audit event and atomic rollback behavior.

Update:

- partial-update behavior preserves omitted fields;
- explicit-null rejection for database-required fields;
- URL replacement and explicit clearing to `null`;
- member type, string, URL, and display-order validation;
- rejection of backend-managed fields, `is_visible`, and unknown fields;
- missing member returns `404` and invalid UUID returns `422`;
- successful update returns `200` and the shared response contract;
- update audit event contains safe changed-field metadata;
- audit failure rolls back the update.

Delete:

- successful hard deletion returns `204` with no body;
- the row is actually removed;
- missing member returns `404` and invalid UUID returns `422`;
- delete audit event uses `resource_type=team_member` and safe context;
- audit failure rolls back deletion.

Database and migration:

- statically verify the new migration removes `is_visible` and its dependent
  visibility index without rewriting the initial migration;
- verify ORM metadata no longer contains `is_visible` or a visibility index;
- run an opt-in PostgreSQL/Supabase lifecycle integration test;
- verify the live schema no longer contains `is_visible` after applying the new
  migration;
- verify create, ordered reads, detail, partial update, deletion, audit rows,
  and cleanup against PostgreSQL;
- do not substitute SQLite for PostgreSQL-specific verification;
- do not claim real database verification unless it actually succeeds.

### Manual Swagger and Supabase Verification

After implementation, migration application, and automated tests pass:

1. Create a Team member through Swagger.
2. Confirm the record exists in Supabase.
3. Confirm `is_visible` is absent from the live `team_members` schema.
4. Call `GET /our-team` and confirm the member appears.
5. Call `GET /our-team/{id}` and confirm the detail response.
6. Create multiple Team members with different `display_order` values.
7. Confirm `GET /our-team` returns them in `display_order` order.
8. Update a member through `PATCH /our-team/{id}`.
9. Confirm the updated record in Supabase.
10. Delete the member through `DELETE /our-team/{id}`.
11. Confirm the delete returns HTTP `204`.
12. Confirm the record no longer exists in Supabase.
13. Confirm `GET /our-team` no longer returns the deleted member.

Do not add testing-only behavior and do not claim this sequence was completed
until it was actually performed.

### Phase 10 Scope Boundaries

Phase 10 does not include:

- authentication or authorization;
- fake authentication or role checks;
- visibility toggles or `is_visible`;
- replacement status, active, hidden, or archived fields;
- soft deletion;
- employee lifecycle/status management;
- pagination, search, filtering, or alternate sorting;
- separate admin GET endpoints;
- email notifications;
- analytics;
- unrelated Admin Panel UI work;
- unrelated APIs or phases.

------------------------------------------------------------------------

## Phase 11 --- Contact Us

-   [ ] Use the existing Contact Submission model.
-   [ ] Complete the request and response schemas defined below.
-   [ ] Implement the public submission endpoint.
-   [ ] Implement the admin list, detail, and hard-delete endpoints.
-   [ ] Add repository and service layers.
-   [ ] Enforce validation and backend-managed fields.
-   [ ] Add delete audit logging.
-   [ ] Add unit, API-contract, and PostgreSQL integration tests.

### Phase 11 API Contract

Phase 11 implements one public submission operation and three conceptually
administrative operations. The public endpoint must remain usable without
authentication. Authentication and authorization for the admin endpoints are
deferred to the approved authentication phase; Phase 11 must not add fake,
temporary, or testing-only authentication.

The existing `ContactCreateRequest` is only the current Phase 4 request-schema
foundation. Phase 11 must tighten its validation and add the response schemas
defined below. Do not refer to nonexistent established response schemas.

### Public Contact Submission

#### `POST /contact-us`

This endpoint is public. A website visitor does not need an authenticated
session or admin identity to submit the form.

The JSON request body contains exactly:

- `name` — required string;
- `email` — required valid email address;
- `company` — optional string and may be omitted or `null`;
- `subject` — required string;
- `message` — required string;
- `source_page` — required string identifying the website page from which the
  form was submitted.

The request must reject undeclared fields, including all backend-managed or
internal fields:

- `id`
- `status`
- `submitted_at`
- `notes`
- `resolved_at`
- `resolved_by`

Success response:

- Return HTTP `201 Created`.
- Return a public submission receipt containing exactly `id`, `status`, and
  `submitted_at`.
- `id` is the database-generated submission UUID.
- `status` is `new`.
- `submitted_at` is the database-generated timezone-aware creation timestamp.
- Do not echo the visitor's name, email, company, subject, message, or source
  page in the public success response.

Example response:

```json
{
  "id": "7fd6ff67-1db4-4dd7-81a2-c9e1df99f7f5",
  "status": "new",
  "submitted_at": "2026-09-23T12:00:00Z"
}
```

### Admin Contact Submission Responses

Phase 11 must add an admin response schema containing exactly:

- `id`
- `name`
- `email`
- `company`
- `subject`
- `message`
- `source_page`
- `status`
- `notes`
- `submitted_at`
- `resolved_at`
- `resolved_by`

Nullable fields remain nullable according to the existing model:

- `company`
- `notes`
- `resolved_at`
- `resolved_by`

The response exposes existing administrative data only. Phase 11 does not add
status changes, note editing, resolution actions, or new fields.

### Admin Contact Submission List

#### `GET /admin/contact-submissions`

- Return a JSON array of admin Contact Submission response objects.
- Return all stored submissions regardless of status.
- Order submissions by `submitted_at DESC` so the newest submission appears
  first.
- Do not add pagination, filtering, searching, client-selected ordering, or
  query parameters in Phase 11.
- This endpoint is intended for authenticated administrators, but enforcement
  is deferred. Implement it without fake authentication until the real auth
  phase supplies the shared dependency.

### Admin Contact Submission Detail

#### `GET /admin/contact-submissions/{id}`

- Resolve the submission using its database UUID.
- Return one admin Contact Submission response object.
- Return HTTP `404 Not Found` with the standard FastAPI `{"detail": "..."}`
  shape when the UUID does not identify a submission.
- Let FastAPI return its standard HTTP `422` validation response when the path
  value is not a valid UUID.
- Authentication and authorization are deferred; do not add fake
  authentication.

### Admin Contact Submission Deletion

#### `DELETE /admin/contact-submissions/{id}`

- This operation has admin-only intent; authentication and authorization are
  deferred without a temporary substitute.
- Perform a hard delete.
- Return HTTP `204 No Content` with an empty response body after success.
- Return HTTP `404 Not Found` when the UUID does not identify a submission.
- Let FastAPI return HTTP `422` for an invalid UUID path value.
- There is no public Contact Submission delete endpoint.
- Do not introduce soft deletion.

### Validation

- Validate `email` using the existing Pydantic email type.
- Trim surrounding whitespace from required string fields and reject empty or
  whitespace-only `name`, `subject`, `message`, and `source_page` values.
- `company` remains optional and nullable. Do not make it required.
- `source_page` is a non-empty page reference such as `/` or `/contact`.
  Do not require a fully qualified URL or invent a complex URL/path policy.
- Reject unknown request fields through the existing strict request-schema
  configuration.
- Do not introduce maximum lengths because neither the approved contract nor
  the PostgreSQL `text` columns establish them.
- Invalid request data uses FastAPI's standard HTTP `422` validation response.

### Backend-Managed Fields

The backend owns the following values and the public request cannot set or
override them:

- `status` is created as `new`, matching the existing database default.
- `submitted_at` is generated when the row is inserted, using the existing
  timezone-aware database default.
- `id` is generated by PostgreSQL.
- `notes`, `resolved_at`, and `resolved_by` remain nullable internal fields.

Phase 11 does not define additional status values or behavior for notes,
resolution timestamps, or resolver identities.

### Public and Admin Access Boundary

Public:

- `POST /contact-us`

Administrative intent, with authentication/authorization deferred:

- `GET /admin/contact-submissions`
- `GET /admin/contact-submissions/{id}`
- `DELETE /admin/contact-submissions/{id}`

Do not require authentication for `POST /contact-us`. Do not add fake auth to
the admin routes.

### Repository and Service Architecture

Use the established layering:

```text
FastAPI route
  -> Contact Submission service
    -> Contact Submission repository
      -> AsyncSession
```

- Routes own HTTP input/output and dependency injection.
- The repository owns SQLAlchemy queries and staging persistence operations.
- The repository must not commit transactions.
- The service owns commit and rollback boundaries for creation and deletion.
- Use the existing asynchronous engine, session factory, request-scoped
  `AsyncSession`, and database lifecycle.
- Supabase SQL migrations remain the only migration source of truth. The
  existing model and migration already support this contract; Phase 11 does not
  require a new migration.

### Audit Logging

- Public `POST /contact-us` does not create an audit log. It is a visitor
  submission, and the existing contract does not require a public-submission
  audit event.
- Successful admin deletion creates an audit event in the same transaction as
  the hard delete.
- Use action `delete` and `resource_type=contact_submission`.
- The actor remains nullable until authentication is implemented.
- Audit context may contain only safe operational metadata such as the stored
  status.
- Audit context must not contain the visitor's name, email, company, subject,
  message, source page, internal notes, credentials, tokens, or other private
  or sensitive data.
- If audit persistence fails, the delete transaction must roll back.

### Email Automation

Email automation is outside Phase 11:

- no internal notification email;
- no visitor confirmation or reply email;
- no SMTP, Resend, Brevo, or other email-provider integration;
- no email retry or delivery-status workflow.

The persisted Contact Submission record is the Phase 11 source of truth. A
future approved email phase may send an internal notification to the Vyntics
team and a confirmation/reply email to the visitor.

### Phase 11 Testing Requirements

Automated tests must cover:

Public submission:

- `POST /contact-us` returns `201` and the exact public receipt contract;
- successful persistence of every client-provided field;
- database-generated UUID, `status=new`, and `submitted_at` values;
- missing required fields;
- invalid email addresses;
- empty and whitespace-only required strings;
- valid non-empty `source_page` references and rejection of empty values;
- optional/nullable `company` behavior;
- rejection of unknown and backend-managed request fields;
- no public authentication requirement;
- no public submission audit record.

Administrative operations:

- admin list returns all stored submissions in `submitted_at DESC` order;
- admin list and detail match the exact admin response contract;
- admin detail returns a submission by UUID;
- admin detail and delete return `404` for missing submissions;
- invalid UUID path values return `422`;
- successful hard deletion returns `204` with no response body;
- deletion actually removes the database record;
- deletion creates the required safe audit record;
- audit failure rolls back the deletion;
- no fake authentication dependency is introduced.

Database/integration coverage:

- provide an opt-in PostgreSQL/Supabase integration test using the configured
  database;
- verify creation, generated backend fields, admin list/detail visibility,
  deletion, audit persistence, and cleanup;
- do not substitute SQLite for PostgreSQL integration behavior;
- do not claim real database verification unless it was executed successfully.

### Manual Swagger and Supabase Verification

After implementation and automated tests pass:

1. Submit a Contact Us request through Swagger using `POST /contact-us`.
2. Confirm the request succeeds with HTTP `201` and the documented receipt.
3. Confirm the record exists in Supabase PostgreSQL.
4. Confirm its status is `new`.
5. Confirm `submitted_at` was generated.
6. Confirm it appears in `GET /admin/contact-submissions`.
7. Confirm `GET /admin/contact-submissions/{id}` returns the expected record.
8. Delete it through `DELETE /admin/contact-submissions/{id}`.
9. Confirm the record is removed from Supabase and the safe delete audit row
   exists.
10. Confirm `POST /contact-us` works without authentication.

Do not add Swagger-only or testing-only bypass behavior. Do not claim this
manual verification is complete until it has actually been performed.

### Phase 11 Scope Boundaries

Phase 11 does not include:

- email notifications or visitor confirmation emails;
- SMTP, Resend, Brevo, or other email infrastructure;
- authentication or authorization;
- fake authentication;
- Admin Panel UI implementation;
- pagination, search, filtering, or configurable sorting;
- contact status management beyond the initial backend-created `new` status;
- notes management;
- resolved/replied workflows;
- analytics;
- soft deletion;
- additional Contact Submission endpoints;
- unrelated APIs or later phases.

------------------------------------------------------------------------

## Phase 12 --- Supabase Auth

-   [ ] Define token/session input.
-   [ ] Implement Supabase token verification.
-   [ ] Extract authenticated user identity.
-   [ ] Resolve the identity to the matching active `admin_users` record.
-   [ ] Reject missing/invalid/expired credentials.
-   [ ] Create reusable auth dependency.
-   [ ] Keep public endpoints public where intended.
-   [ ] Define authorization dependency.
-   [ ] Apply roles/permissions to protected routes.
-   [ ] Protect admin mutations.
-   [ ] Protect logs/admin data.
-   [ ] Test 401 and 403 cases.

Google OAuth remains in Supabase Auth/Admin Panel. FastAPI handles
verification and authorization. Supabase Auth establishes who the user
is; `admin_users` stores Vyntics-specific role and active state; FastAPI
enforces the later-approved role/permission rules.

The `@vyntics.com` restriction must not exist only as a frontend check.

------------------------------------------------------------------------

## Phase 13 --- Supabase Storage

-   [ ] Create storage service abstraction.
-   [ ] Configure Supabase Storage client.
-   [ ] Backend-managed uploads.
-   [ ] Safe object naming.
-   [ ] File type validation.
-   [ ] File size validation.
-   [ ] Upload failure handling.
-   [ ] Orphan cleanup where needed.
-   [ ] Public vs signed/private URL handling.
-   [ ] Keep job CVs private.
-   [ ] Keep storage secrets server-side.

Expected file categories:

``` text
blog covers
case-study images
team photos
job resumes/CVs
```

The removed Media Library module does not remove Storage.

------------------------------------------------------------------------

## Phase 14 --- Audit Logs

-   [ ] Define audit event model.
-   [ ] Create persistence layer.
-   [ ] Create shared `log_action()` helper/service.
-   [ ] Record important admin mutations.
-   [ ] Record authenticated actor.
-   [ ] Record resource/action.
-   [ ] Record timestamp.
-   [ ] Avoid secrets and sensitive file contents.
-   [ ] Add protected log retrieval if required.
-   [ ] Tests.

------------------------------------------------------------------------

## Phase 15 --- Security Validation

-   [ ] Authentication boundaries.
-   [ ] Authorization on every protected route.
-   [ ] CORS.
-   [ ] File upload security.
-   [ ] SQL injection protection.
-   [ ] Input/request size limits.
-   [ ] Response data exposure.
-   [ ] Secret handling.
-   [ ] Sensitive-data logging review.
-   [ ] Private CV access.
-   [ ] Rate-limiting requirements.
-   [ ] Error-message review.
-   [ ] Dependency vulnerability review.
-   [ ] Production debug settings.
-   [ ] OpenAPI exposure review.

------------------------------------------------------------------------

## Phase 16 --- Testing

### Unit

Test:

-   validators
-   services
-   authorization
-   content validation
-   file validation
-   helpers

### Integration

Test:

-   FastAPI routes
-   DB interaction
-   authentication dependencies
-   storage behavior
-   transaction behavior

### API contract tests

Verify:

``` text
GET  /blogs
GET  /blogs/{slug}

GET  /case-studies
GET  /case-studies/{slug}

GET  /careers
GET  /careers/{slug}
POST /careers/{slug}/apply

GET  /our-team

POST /contact-us
```

### Negative cases

Include:

-   invalid slug
-   missing fields
-   invalid email
-   401
-   403
-   404
-   closed job
-   invalid resume
-   oversized resume
-   malformed content
-   duplicate slug
-   DB failure
-   storage failure

------------------------------------------------------------------------

## Phase 17 --- OpenAPI / Swagger

-   [ ] Document routes.
-   [ ] Document request/response schemas.
-   [ ] Document authentication requirements.
-   [ ] Document multipart uploads.
-   [ ] Document status codes.
-   [ ] Prevent internal fields appearing accidentally.
-   [ ] Verify `/docs`.
-   [ ] Verify generated OpenAPI.
-   [ ] Compare OpenAPI to the API contract.

Swagger is the primary local backend testing interface.

------------------------------------------------------------------------

## Phase 18 --- CORS / Client Readiness

Configure CORS for actual frontend origins.

Development can include the local Next.js origins.

Production must explicitly allow approved Vyntics website/admin origins.

Do not use unrestricted:

``` python
allow_origins=["*"]
```

for authenticated production APIs.

------------------------------------------------------------------------

## Phase 19 --- Error Contract

Finalize a consistent error shape for:

``` text
validation
authentication
authorization
not found
conflict
file validation
database/service failure
unexpected server error
```

The final JSON error contract must be documented before frontend
integration.

Do not invent the final shape without approval.

------------------------------------------------------------------------

## Phase 20 --- Performance / Reliability

-   [ ] Review indexes.
-   [ ] Avoid N+1 queries.
-   [ ] Connection pooling.
-   [ ] Pagination where required.
-   [ ] Request-size limits.
-   [ ] Upload-size limits.
-   [ ] Health/readiness behavior.
-   [ ] Structured logs.
-   [ ] Graceful startup/shutdown.
-   [ ] Timeout behavior.
-   [ ] External-service retry behavior.
-   [ ] Transaction boundaries.

------------------------------------------------------------------------

## Phase 21 --- Docker

-   [ ] Production Dockerfile.
-   [ ] Production ASGI configuration.
-   [ ] No secrets in image.
-   [ ] `.dockerignore`.
-   [ ] Local image build.
-   [ ] Local container run.
-   [ ] `/health` verification.
-   [ ] `/docs` verification.
-   [ ] Environment-based DB/auth/storage configuration.

------------------------------------------------------------------------

## Phase 22 --- AWS Deployment

Do not provision production infrastructure without team approval.

Tasks after the AWS hosting option is selected:

-   [ ] Deployment environment.
-   [ ] Secrets/environment variables.
-   [ ] Networking.
-   [ ] HTTPS/domain.
-   [ ] Health checks.
-   [ ] Logs.
-   [ ] Scaling.
-   [ ] Staging deployment.
-   [ ] Smoke tests.
-   [ ] Production deployment after approval.

------------------------------------------------------------------------

## Phase 23 --- Next.js Integration

The new website consumes the public FastAPI API:

``` text
Next.js
  |
  +--> GET /blogs
  +--> GET /blogs/{slug}
  +--> GET /case-studies
  +--> GET /case-studies/{slug}
  +--> GET /careers
  +--> GET /careers/{slug}
  +--> POST /careers/{slug}/apply
  +--> GET /our-team
  +--> POST /contact-us
  |
  v
FastAPI
```

Frontend must consume the documented public API contracts, not internal
ORM models or database tables.

------------------------------------------------------------------------

## Phase 24 --- Admin Panel Integration

``` text
Google OAuth
     ↓
Supabase Auth
     ↓
Admin Panel
     ↓ authenticated request
FastAPI
     ↓
authorization
     ↓
database/storage
```

Tasks:

-   [ ] Connect admin session/token flow.
-   [ ] Verify protected requests.
-   [ ] Apply authorization.
-   [ ] Implement approved admin CRUD endpoints.
-   [ ] Implement content upload flows.
-   [ ] Integrate audit/log views where required.
-   [ ] Test unauthorized/forbidden behavior.

Do not invent additional admin CRUD endpoints until their contract is
approved.

------------------------------------------------------------------------

# 10. Out of Current Scope

Do not implement these as current backend modules unless explicitly
re-approved:

-   Clients
-   Testimonials
-   Newsletter
-   Standalone Media Library
-   Analytics
-   Large standalone SEO manager
-   Announcement banner
-   AI writing assistant integration
-   Merging the content-generation system into the website API

SEO metadata fields required by Blogs and Case Studies remain in scope.

------------------------------------------------------------------------

# 11. Recommended Order

``` text
1.  FastAPI bootstrap
2.  Configuration
3.  Database + SQLAlchemy
4.  Pydantic schemas
5.  Database connectivity foundation
6.  Blogs
7.  Case Studies
8.  Careers
9.  Job Applications
10. Our Team
11. Contact Us
12. Supabase Auth
13. Supabase Storage
14. Audit Logs
15. Security validation
16. Tests
17. OpenAPI validation
18. CORS/client readiness
19. Error contract
20. Performance/reliability
21. Docker
22. AWS
23. Next.js integration
24. Admin Panel integration
```

------------------------------------------------------------------------

# 12. Definition of Done

The backend is ready for frontend integration when:

-   [ ] FastAPI runs locally.
-   [ ] Swagger/OpenAPI works.
-   [ ] Database models are implemented.
-   [ ] Migrations are reviewed and reproducible.
-   [ ] Request/response schemas are implemented.
-   [ ] Public endpoints match the approved contracts.
-   [ ] Validation is implemented.
-   [ ] Authentication works for protected endpoints.
-   [ ] Authorization works.
-   [ ] Supabase Storage works.
-   [ ] Job CV upload is secure.
-   [ ] Audit logging is implemented.
-   [ ] Tests cover happy and important failure paths.
-   [ ] CORS is configured for actual frontend origins.
-   [ ] Secrets are externalized.
-   [ ] Production error handling is in place.
-   [ ] Docker image builds/runs.
-   [ ] Backend can be deployed to the approved AWS environment.
-   [ ] Next.js can consume the public API.
-   [ ] Admin Panel can authenticate and consume protected APIs.

------------------------------------------------------------------------

# 13. Ambiguity Rule

If something is not defined in this document, Codex must not silently
make a product decision.

Examples:

-   new endpoint
-   new database table
-   new public response field
-   new auth rule
-   new role
-   new status
-   new storage bucket
-   new business workflow
-   new email behavior

Instead:

1.  Identify the ambiguity.
2.  Explain the decision needed.
3.  Ask the developer.
4.  Continue after confirmation.

Technical implementation details may be chosen when they do not change
approved external behavior.
