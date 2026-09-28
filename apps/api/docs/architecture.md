# Vyntics Website Backend & Admin Architecture

## Architecture Decisions & API Scope

**Version:** 1.0\
**Date:** 2026-09-21\
**Status:** Proposed for Team Review

------------------------------------------------------------------------

## 1. Overview

This document summarizes the current backend and admin-panel decisions
discussed with the Vyntics team.

The goal is to define a clear application architecture, the main backend
APIs required by the Vyntics website and Admin Panel, the
responsibilities of each layer, and the functionality that is
intentionally excluded or deferred at this stage.

The architecture is designed around a **FastAPI backend**, with **AWS
used for application hosting**, while **Supabase is used for storage and
authentication-related services**.

The public website and the Admin Panel are treated as separate clients
of the backend rather than applications that directly communicate with
the database.

------------------------------------------------------------------------

## 2. High-Level Architecture

The system will consist of three primary application layers:

1.  **Public Website**
2.  **Admin Panel**
3.  **FastAPI Backend**

Both the Public Website and Admin Panel consume backend APIs. The
backend is responsible for handling business logic, validation,
authorization, data access, and communication with supporting services.

### High-Level Flow

``` text
                         ┌──────────────────────┐
                         │      AWS Hosting     │
                         │                      │
                         │    FastAPI Backend   │
                         └──────────┬───────────┘
                                    │
                       ┌────────────┼────────────┐
                       │            │            │
                       ▼            ▼            ▼
                ┌────────────┐ ┌───────────┐ ┌──────────────┐
                │  Supabase │ │  Supabase │ │ Other        │
                │  Storage  │ │   Auth    │ │ Services     │
                └────────────┘ └───────────┘ └──────────────┘
                       ▲
                       │
              ┌────────┴─────────┐
              │                  │
              │                  │
       ┌──────┴──────┐    ┌──────┴───────┐
       │   Website   │    │ Admin Panel  │
       │   Client    │    │    Client    │
       └─────────────┘    └──────────────┘
```

### Core Principle

The **Public Website and Admin Panel are clients of the FastAPI
backend**.

They should not directly access the application's underlying database or
storage as part of the normal application workflow.

Instead:

``` text
Website / Admin Panel
        ↓
     FastAPI
        ↓
Application logic / validation / authorization
        ↓
Supabase and other services
```

This keeps business logic and access control inside the backend and
gives us a single application layer through which website and admin
operations are handled.

------------------------------------------------------------------------

## 3. Application Components

### 3.1 Public Website

The public website is responsible for presenting Vyntics content to
visitors.

It will consume the required backend APIs to retrieve publicly available
information such as:

-   Blogs
-   Case Studies
-   Careers / Job Listings
-   Team information
-   Other publicly exposed website content

The website will not be responsible for implementing the backend
business logic for these resources.

------------------------------------------------------------------------

### 3.2 Admin Panel

The Admin Panel is a **separate application** from the public website.

It is intended for authorized Vyntics team members to manage website
content and operational submissions.

The Admin Panel will consume the same FastAPI backend APIs, with
authenticated and authorized access for administrative operations.

The Admin Panel will provide management interfaces for the resources
that require internal administration, including:

-   Blogs
-   Case Studies
-   Careers / Jobs
-   Job Applications
-   Our Team
-   Contact Submissions
-   Admin logs
-   Settings

The Admin Panel should not be implemented as an `/admin` section inside
the public website application.

------------------------------------------------------------------------

### 3.3 FastAPI Backend

FastAPI will act as the primary backend/application layer.

Its responsibilities include:

-   API routing
-   Request validation
-   Business logic
-   Authentication handling
-   Authorization
-   Data access
-   File/storage operations
-   Admin-specific operations
-   Logging
-   Integration with Supabase services
-   Integration with other services where required

The backend provides a controlled interface between the client
applications and the underlying services.

------------------------------------------------------------------------

## 4. Backend API Scope

The initial API scope is centered around the following resources:

``` text
/blogs
/case-studies
/careers
/job-applications
/our-team
/contact-us
/logs
```

These are the primary backend resources required for the current Vyntics
website and Admin Panel.

The exact HTTP methods, request/response schemas, pagination, filtering,
and authorization requirements will be defined during API
implementation.

------------------------------------------------------------------------

## 5. API Resource Responsibilities

### 5.1 `/blogs`

Responsible for website blog content.

Expected operations include:

-   Retrieve published blogs for the public website
-   Retrieve individual blog posts
-   Create blog posts
-   Edit blog posts
-   Save drafts
-   Publish/unpublish posts
-   Manage blog content and associated images

The Admin Panel will provide the interface for managing these
operations.

Images associated with a blog should be managed as part of the blog
workflow rather than through a separate Media Library.

------------------------------------------------------------------------

### 5.2 `/case-studies`

Responsible for Vyntics case-study content.

Expected operations include:

-   Retrieve published case studies
-   Retrieve individual case studies
-   Create case studies
-   Edit case studies
-   Save drafts
-   Publish/unpublish case studies
-   Manage associated images/content

Case-study assets should be handled within the case-study management
workflow.

------------------------------------------------------------------------

### 5.3 `/careers`

Responsible for job listings shown on the Vyntics website.

Expected operations include:

-   Retrieve all currently available jobs
-   Retrieve individual job listings
-   Create job listings
-   Edit job listings
-   Delete job listings that are no longer available
-   Manage job descriptions and relevant job information

The public website will consume the public-facing career data, while
authorized Admin Panel users will manage the listings.

A Career record's existence represents that the job is open and available.
There is no separate open, closed, active, visible, archived, or soft-delete
state, and `published_at` is not a lifecycle flag. Removing availability is a
hard delete. A Career can be deleted even when Job Applications exist. The
nullable `job_applications.career_id` relationship uses `ON DELETE SET NULL`,
so applications are never cascade-deleted and remain available as historical
records with their Career title and slug snapshots.

------------------------------------------------------------------------

### 5.4 `/job-applications`

Responsible for applications submitted for Vyntics job listings.

Expected operations include:

-   Submit a job application
-   Associate an application with a job
-   Store applicant information
-   Handle CV/resume uploads
-   View applications from the Admin Panel
-   Update application status
-   Add internal notes where required

Administrative reads include both a global application list and a
Career-scoped list for existing Careers. Historical applications remain
available after Career deletion: their `career_id` becomes `null`, while
`career_title_snapshot` and `career_slug_snapshot` retain the original Career
identity. New applications cannot be submitted for a deleted Career because
public submission still resolves an existing Career by slug.

Job applications contain private information and therefore require
appropriate authentication and authorization.

------------------------------------------------------------------------

### 5.5 `/our-team`

Responsible for team member information displayed on the website.

Expected operations include:

-   Retrieve visible team members
-   Add team members
-   Edit team members
-   Remove/deactivate team members
-   Manage team member profile information
-   Manage team member photos

Team photos will be stored using Supabase Storage.

------------------------------------------------------------------------

### 5.6 `/contact-us`

Responsible for contact form submissions.

Expected operations include:

-   Accept contact form submissions from the public website
-   Validate submitted information
-   Store submissions
-   Allow authorized Admin Panel users to view submissions
-   Track the status of submissions where required

Contact submissions are internal/private data and should not be exposed
through public endpoints.

------------------------------------------------------------------------

### 5.7 `/logs`

Responsible for administrative activity logging.

The purpose of this resource is to provide visibility into important
actions performed through the Admin Panel.

Examples may include:

-   Content creation
-   Content updates
-   Publishing/unpublishing
-   Job listing changes
-   Application status changes
-   Team member changes
-   Administrative setting changes
-   Authentication-related administrative events

Logs should be accessible only to appropriately authorized Admin Panel
users.

The exact event structure and retention policy can be finalized during
implementation.

------------------------------------------------------------------------

## 6. Authentication & Authorization

Authentication for the future Admin Panel will use **Supabase Auth with Google
OAuth**. There is currently no Admin Panel application, URL, or browser login
flow. Phase 12 establishes both backend authentication and the approved
authorization/API-protection boundary for the existing routes.

### Authentication Flow

For the future Admin Panel, authentication will happen before access to
protected FastAPI APIs:

```text
Admin User
    │
    ▼
Google OAuth
    │
    ▼
Supabase Auth
    │
    │ Authenticated
    ▼
Admin Panel
    │
    │ Authenticated API Requests
    ▼
FastAPI APIs
    │
    ▼
Supabase / Other Services
```

The complete intended request path is Google OAuth â†’ Supabase Auth â†’ Supabase
access token â†’ future Admin Panel â†’ `Authorization: Bearer <access_token>` â†’
FastAPI authentication dependency â†’ verified Supabase identity â†’ matching
`admin_users.auth_user_id` â†’ `is_active=true` â†’ authenticated Vyntics admin
context.

The bearer access token is the source of authenticated identity. FastAPI must
independently verify it and must not trust an email address, `admin_user_id`,
hardcoded user, hardcoded token, fake JWT, or another client-supplied identity
value as proof of authentication.

### Authentication vs Authorization

**Authentication** answers:

> "Who is this user?"

FastAPI establishes this by verifying the Supabase access token, extracting the
verified Supabase user UUID, and resolving it to a matching active
`admin_users` record. Missing, malformed, invalid, or expired credentials are
authentication failures. A verified identity with no matching active
`admin_users` record also does not authenticate as a Vyntics administrator.
These failures return HTTP `401 Unauthorized`.

**Authorization** answers:

> "What is this authenticated user allowed to do?"

This is enforced at the backend/application layer using approved role and
permission rules. HTTP `403 Forbidden` means the caller is authenticated but
is not authorized for the requested operation. The current minimal rule allows
both active `admin` and `superadmin` records to use protected operations; no
current operation is documented as superadmin-only.

FastAPI is therefore **not the authentication provider**. Supabase Auth issues
the identity token; FastAPI verifies it, resolves the application administrator,
and performs authorization checks. Intentionally public endpoints remain
public without a token.

### Application Administrator Identity

Supabase Auth is the authentication identity/source of truth. A Vyntics
`admin_users` database table separately stores application-level
administrator identity and authorization data:

-   a unique `auth_user_id` maps to the Supabase Auth user UUID;
-   initial roles are `superadmin` and `admin`;
-   `is_active` controls whether the administrator may continue using
    the Admin Panel;
-   disabled administrators remain stored to preserve administrative
    history.

Phase 12 resolves an authenticated Supabase user to the matching active
`admin_users` record through `auth_user_id` and uses its stored role. There is no generic
public `users` table and no separate roles table. Access tokens are not stored
in application/database tables, and Supabase service-role credentials must
never be exposed to clients.

FastAPI verifies user access tokens by calling the configured project's
`/auth/v1/user` endpoint with `SUPABASE_ANON_KEY` in the `apikey` header and the
user access token in `Authorization: Bearer <access_token>`. The privileged
`SUPABASE_SERVICE_ROLE_KEY` is not used for user-token verification and remains
reserved for privileged server-side operations such as private Storage access.
Both settings are backend configuration in this project and must not be placed
in frontend source code; any future Admin Panel client configuration must be
defined separately.

### Current Google Provider Setup

The manual provider configuration is complete:

- Supabase Authentication â†’ Sign In / Providers â†’ Google is enabled.
- A Google Cloud project and OAuth Web Application client were created for
  future Vyntics admin authentication.
- The Supabase Auth callback URL is the Google client's authorized redirect URI.
- The Google Client ID and Client Secret are configured in Supabase; the secret
  is not stored in repository documentation.
- Skip nonce checks is off.
- Allow users without an email is off.

This provider setup has not been tested through an Admin Panel because that
application does not exist yet. No Admin Panel JavaScript origin is configured.
Enabling Google OAuth authenticates a Google identity but does not itself make
that identity a Vyntics administrator; FastAPI must still verify the token and
resolve an active `admin_users` record.

### Protected and Public Route Boundary

Public access remains available for health and API documentation, public Blog
and Case Study reads, Career reads, Team Member reads, Contact Us submission,
and Job Application submission.

Authentication is required for admin Blog and Case Study reads; Blog, Case
Study, Career, and Team Member mutations; Job Application administrative reads
and mutations; and Contact Submission administrative reads and deletion. Both
current roles may use these operations. The reusable role gate returns `403`
for an authenticated administrator whose role is insufficient when a future
operation is explicitly assigned a narrower role.

Protected mutations pass the authenticated database administrator ID and email
to the existing atomic audit-log flow. Tokens, OAuth secrets, resume contents,
and other sensitive request data are never written to audit context.

### Vyntics Account Restriction

Only Google accounts using the Vyntics domain should be allowed to access the Admin Panel:

```text
Allowed:
user@vyntics.com

Not allowed:
user@gmail.com
user@othercompany.com
```

The intended account policy remains limited to Vyntics administrators. An
email value alone is never sufficient proof: successful backend authentication
requires a verified Supabase identity mapped to an active `admin_users` row.

---

## 7. Admin Roles & Settings

A separate admin-users or roles API/module is **not part of the current
API scope**. The `admin_users` database table exists only as the
application-level administrator identity, role, and active-state store;
it does not introduce a new public API resource or Admin Panel product
module.

Admin-related configuration and role management will be handled under
the **Settings** section of the Admin Panel.

This keeps the primary API/resource structure focused on actual Vyntics
website content and operational workflows.

The initial stored roles are `superadmin` and `admin`. Their exact
permissions will be finalized as part of the Settings and authorization
implementation and enforced by FastAPI.

------------------------------------------------------------------------

## 8. File & Image Storage

Supabase will be used for application file/storage requirements.

Examples include:

-   Blog cover images
-   Case-study images
-   Team member photos
-   CV/resume files
-   Other website-related assets where required

There will **not** be a separate Media Library module in the Admin Panel
at this stage.

Instead, files will be managed within the resource to which they belong.

For example:

``` text
Blogs
  └── Create/Edit Blog
       └── Upload Cover Image

Case Studies
  └── Create/Edit Case Study
       └── Upload Image

Our Team
  └── Create/Edit Team Member
       └── Upload Photo
```

This keeps the Admin Panel focused on actual workflows rather than
introducing a standalone media-management interface that is not
currently required.

------------------------------------------------------------------------

## 9. Hosting & Infrastructure

### Backend Hosting

The FastAPI application will be hosted on **AWS**.

AWS is being used primarily as the hosting/infrastructure layer for the
backend application.

### Storage

Application file storage will use **Supabase Storage** rather than AWS
storage services.

### Authentication

Authentication for the future Admin Panel will use **Supabase Auth with Google
OAuth**. The Google provider is configured, and FastAPI token verification,
active `admin_users` resolution, authorization, and current-route protection
are implemented. Browser login remains future Admin Panel work.

### Simplified Infrastructure Model

``` text
AWS
└── FastAPI Backend

Supabase
├── Authentication
│   └── Google OAuth
│
└── Storage
    ├── Blog assets
    ├── Case-study assets
    ├── Team photos
    └── Application files
```

------------------------------------------------------------------------

## 10. Admin Panel vs Public Website

The Admin Panel and Public Website are separate applications with
different responsibilities.

### Public Website

``` text
Visitor
   ↓
Public Website
   ↓
FastAPI API
   ↓
Required public data
```

### Admin Panel

``` text
Vyntics Team Member
   ↓
Google OAuth / Supabase Auth
   ↓
Admin Panel
   ↓
FastAPI API
   ↓
Protected operations
```

The same backend can therefore serve different types of clients while
enforcing different authorization requirements. The Admin Panel portion of this
diagram describes the target client state, not a currently verified browser
flow.

------------------------------------------------------------------------

## 11. Public vs Protected API Access

Not every endpoint requires the same level of access.

For example:

``` text
Public Website
    ↓
GET /blogs
GET /case-studies
GET /careers
GET /our-team
```

may expose only publicly publishable information.

Whereas:

``` text
Admin Panel
    ↓
POST /blogs
PATCH /blogs/{id}
DELETE /blogs/{id}

POST /careers
PATCH /careers/{id}
DELETE /careers/{id}

GET /job-applications
PATCH /job-applications/{id}

GET /contact-us
GET /logs
```

will require authenticated and appropriately authorized access.

The final permission matrix will be defined alongside the API
specifications.

------------------------------------------------------------------------

## 12. Functionality Intentionally Excluded

The following functionality was discussed in the earlier design but has
been intentionally excluded from the current Admin Panel/API scope:

### 12.1 Clients

A dedicated Clients module/API is not part of the current scope.

### 12.2 Testimonials

Testimonials will not be included.

### 12.3 Newsletter

Newsletter management will not be included.

### 12.4 Media Library

A dedicated Media Library will not be included.

File management will happen inside the relevant content-management
workflow.

### 12.5 Separate Admin User / Roles API

A dedicated admin-user/roles endpoint is not part of the current API
list.

The internal `admin_users` database table maps Supabase Auth identities
to Vyntics roles and active state. Role-related behavior will be handled
through Settings and the authentication/authorization layer; this does
not add a separate public API module.

------------------------------------------------------------------------

## 13. Deferred / Later Scope

The following areas are intentionally not part of the immediate
implementation focus.

### SEO

SEO-related functionality can be considered later once the core website
content-management and backend workflows are stable.

### Analytics

Analytics and related dashboard functionality will be considered
separately at a later stage.

These areas should not block the implementation of the core API and
Admin Panel functionality.

------------------------------------------------------------------------

## 14. Content Generation System

The Vyntics content-generation system will remain a **separate
application/system** from the Admin Panel.

It will have its own backend implementation and will not be treated as
another module inside the Admin Panel.

At a high level, the future architecture will allow the
content-generation system to communicate with the Vyntics backend
through a controlled integration.

The detailed integration flow, authentication between systems, and
content approval workflow will be defined separately.

------------------------------------------------------------------------

## 15. Current Admin Panel Structure

Based on the decisions made so far, the proposed Admin Panel structure
is:

``` text
Vyntics Admin
│
├── Dashboard
│
├── Blogs
│
├── Case Studies
│
├── Careers
│   └── Job Applications
│
├── Our Team
│
├── Contact Submissions
│
├── Logs
│
└── Settings
```

The following are intentionally not included:

``` text
❌ Clients
❌ Testimonials
❌ Newsletter
❌ Media Library
❌ Separate Admin Users / Roles module
```

And the following are deferred:

``` text
⏳ SEO
⏳ Analytics
```

------------------------------------------------------------------------

## 16. Current Architecture Summary

The current architecture can be summarized as:

```text
                 ┌───────────────────────┐
                 │    Public Website     │
                 │       Client          │
                 └───────────┬───────────┘
                             │
                             │ API requests
                             ▼
                 ┌───────────────────────┐
                 │   AWS-hosted FastAPI  │
                 │      Backend/API      │
                 │                       │
                 │ • Routing             │
                 │ • Validation          │
                 │ • Business Logic      │
                 │ • Authorization       │
                 │ • Data Access         │
                 └───────────┬───────────┘
                             │
                 ┌───────────┼────────────┐
                 │           │            │
                 ▼           ▼            ▼
          ┌────────────┐ ┌───────────┐ ┌──────────────┐
          │  Supabase │ │ Supabase  │ │    Other     │
          │   Auth    │ │  Storage  │ │   Services   │
          │ Google    │ │   Files   │ │              │
          │  OAuth    │ │           │ │              │
          └────────────┘ └───────────┘ └──────────────┘
                 ▲           ▲
                 │           │
                 └─────┬─────┘
                       │
                 through backend
                       │
                 ┌─────┴─────────────┐
                 │   Admin Panel     │
                 │      Client       │
                 └───────────────────┘
```

Both the Public Website and Admin Panel communicate with the FastAPI backend.

The FastAPI backend then communicates with Supabase Auth, Supabase Storage, and other supporting services as required.

The client applications are **not intended to directly access the underlying application data or storage services** as part of the normal application workflow.

### Architectural Principles

1. **The Admin Panel is a separate application from the public website.**
2. **FastAPI is the primary backend/application and API layer.**
3. **AWS is used for backend hosting/infrastructure.**
4. **Supabase Storage is used for application file storage.**
5. **Supabase Auth with Google OAuth will provide authentication for the future Admin Panel; provider configuration is complete, but end-to-end login is not yet verified.**
6. **The `admin_users` table stores Vyntics-specific administrator identity, role, and active state, mapped to Supabase Auth through `auth_user_id`.**
7. **A verified Google/Supabase identity must map to an active `admin_users` record before it is authenticated as a Vyntics administrator; email or domain alone is not identity proof.**
8. **The Public Website and Admin Panel communicate with the FastAPI backend rather than directly accessing the underlying application data or storage services.**
9. **Phase 12 makes FastAPI verify the Supabase bearer token and resolve an active application administrator; FastAPI is not the authentication provider.**
10. **Public and protected operations are separated through backend authentication and authorization.**
11. **File management happens within the relevant content workflow rather than through a separate Media Library.**
12. **SEO and Analytics are deferred.**
13. **The content-generation system remains separate from the Admin Panel and will be integrated through a controlled backend interface later.**

---

## 17. Next Implementation Decisions

The architecture and high-level scope are now defined. The next stage
should focus on turning these decisions into implementation
specifications:

1.  Define the database/data model.
2.  Define each API endpoint and HTTP method.
3.  Define request and response schemas.
4.  Define public vs protected endpoints.
5.  Define authentication and authorization flow.
6.  Define Admin Panel roles and permissions under Settings.
7.  Define Supabase Storage buckets and file-access policies.
8.  Define logging structure.
9.  Define error handling and API response conventions.
10. Define deployment/environment structure for development and
    production.
11. Define the integration boundary for the separate content-generation
    system.

These decisions can then be converted into the detailed backend and API
implementation plan.
