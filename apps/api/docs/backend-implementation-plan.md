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
├── alembic/
├── alembic.ini
├── requirements.txt
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
blog_posts
case_studies
careers / jobs
job_applications
team_members
contact_submissions
audit/log records
```

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
-   open/public status
-   published timestamp
-   audit timestamps

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
-   resolved by

------------------------------------------------------------------------

# 8. Alembic

Use Alembic for SQLAlchemy/application database migrations **if this is
confirmed as the team's migration source of truth**.

Tasks:

-   [ ] Add Alembic.
-   [ ] Add `alembic.ini`.
-   [ ] Add `alembic/`.
-   [ ] Configure DB URL from environment.
-   [ ] Configure `env.py`.
-   [ ] Connect SQLAlchemy metadata.
-   [ ] Create/review initial migration.
-   [ ] Test upgrade from an empty development DB.
-   [ ] Test downgrade where appropriate.

Important: the repository also contains:

``` text
supabase/migrations/
```

Do **not** maintain two independent migration systems for the same
tables.

Before the first real migration is created, confirm whether Alembic or
Supabase migrations are the source of truth.

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
-   [ ] Configure Alembic.
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

## Phase 5 --- API Infrastructure

-   [ ] Router registration.
-   [ ] Standard HTTP status handling.
-   [ ] 400/422 validation handling.
-   [ ] 401 authentication handling.
-   [ ] 403 authorization handling.
-   [ ] 404 handling.
-   [ ] 409 conflict handling.
-   [ ] Safe 500 handling.
-   [ ] Structured logging.
-   [ ] Transaction handling.
-   [ ] Request ID/correlation ID if adopted.
-   [ ] Pagination infrastructure where required.

Never expose raw DB errors.

------------------------------------------------------------------------

## Phase 6 --- Blogs

-   [ ] Blog model.
-   [ ] Blog schemas.
-   [ ] Repository/data access.
-   [ ] Service layer.
-   [ ] `GET /blogs`.
-   [ ] `GET /blogs/{slug}`.
-   [ ] Published-content filtering.
-   [ ] Unique slug handling.
-   [ ] SEO validation.
-   [ ] Structured-content validation.
-   [ ] 404 behavior.
-   [ ] Unit/integration/API contract tests.

------------------------------------------------------------------------

## Phase 7 --- Case Studies

-   [ ] Case study model.
-   [ ] Schemas.
-   [ ] Repository.
-   [ ] Service.
-   [ ] `GET /case-studies`.
-   [ ] `GET /case-studies/{slug}`.
-   [ ] Tech stack/tags.
-   [ ] Structured content.
-   [ ] Image/video references.
-   [ ] Unique slug.
-   [ ] Published-content behavior.
-   [ ] Tests.

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

-   [ ] Team member model.
-   [ ] Response schema.
-   [ ] Repository/service.
-   [ ] `GET /our-team`.
-   [ ] Filter visible members.
-   [ ] Sort by `display_order`.
-   [ ] Return `member_type`.
-   [ ] Hide `is_visible`.
-   [ ] Tests.

------------------------------------------------------------------------

## Phase 11 --- Contact Us

-   [ ] Contact model.
-   [ ] Request schema.
-   [ ] `POST /contact-us`.
-   [ ] Validate email.
-   [ ] Validate required strings.
-   [ ] Validate `source_page`.
-   [ ] Set backend-managed status/timestamp.
-   [ ] Persist submission.
-   [ ] Reject client-controlled internal fields.
-   [ ] Finalize success response before implementation is considered
    complete.
-   [ ] Tests.

Email automation is a separate concern.

------------------------------------------------------------------------

## Phase 12 --- Supabase Auth

-   [ ] Define token/session input.
-   [ ] Implement Supabase token verification.
-   [ ] Extract authenticated user identity.
-   [ ] Reject missing/invalid/expired credentials.
-   [ ] Create reusable auth dependency.
-   [ ] Keep public endpoints public where intended.
-   [ ] Define authorization dependency.
-   [ ] Apply roles/permissions to protected routes.
-   [ ] Protect admin mutations.
-   [ ] Protect logs/admin data.
-   [ ] Test 401 and 403 cases.

Google OAuth remains in Supabase Auth/Admin Panel. FastAPI handles
verification and authorization.

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
5.  API infrastructure/errors
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
