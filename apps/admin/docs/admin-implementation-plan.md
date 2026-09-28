# Vyntics Admin Panel — Implementation Plan

**Status:** Active implementation roadmap and technical source of truth — Phases A–D complete; Phase E planned
**Application:** `apps/admin`  
**Backend:** FastAPI (`apps/api`)  
**Auth:** Supabase Auth  
**Database / Storage:** Supabase  
**Audience:** Developers and Codex implementation agents

---

## 1. Purpose

This document is the implementation source of truth for the Vyntics Admin Panel.

It serves three purposes at the same time:

1. the phase-based delivery roadmap;
2. the implementation plan for each Admin Panel feature;
3. the technical contract reference connecting the Admin UI to the current FastAPI APIs.

The Admin Panel is a separate application from `apps/web`. It is an internal CMS/admin interface used by authorized Vyntics administrators to manage the content and operational records exposed by the existing FastAPI backend.

The frontend must follow the existing backend contracts. It must **not invent fields, endpoints, statuses, persistence behavior, or backend capabilities** that do not exist.

The implementation should prioritize:

- simple, conventional admin-panel UX;
- clear navigation;
- predictable forms and tables;
- strict alignment with FastAPI request/response contracts;
- Supabase Auth for browser authentication;
- FastAPI as the application/API layer;
- Supabase Storage access through FastAPI;
- reusable UI and API infrastructure;
- strong loading, empty, error, and confirmation states;
- accessibility and responsive behavior.

The current FastAPI implementation and the concrete contracts recorded in this document are authoritative. `apps/admin/docs/admin-panel-design-doc.md` is historical and must not be used to restore obsolete architecture, modules, or requirements.

---

## 2. Architecture

### 2.1 System flow

```text
Admin Browser
    |
    | Supabase Auth
    v
Supabase Auth
    |
    | access token
    v
Admin Browser
    |
    | Authorization: Bearer <access_token>
    v
FastAPI
    |
    +--> Supabase Auth verification
    |
    +--> admin_users authorization
    |
    +--> PostgreSQL
    |
    +--> Supabase Storage
```

### 2.2 Responsibilities

#### Admin Panel

Responsible for:

- rendering the admin UI;
- authentication UX;
- maintaining the browser session through the Supabase client;
- sending the Supabase access token to FastAPI;
- client-side validation;
- displaying backend validation errors;
- rendering tables, forms, dialogs, uploads, and status indicators;
- managing navigation and protected routes.

#### FastAPI

Responsible for:

- verifying Supabase access tokens;
- resolving the authenticated admin;
- checking active admin status and roles;
- authorization;
- database operations;
- Storage operations;
- generating short-lived signed resume URLs;
- backend validation and business rules.

#### Supabase

Responsible for:

- Auth;
- PostgreSQL;
- Storage.

The Admin Panel must never use the Supabase service/secret key.

---

## 3. Current implementation status and principles

The Admin Panel is a Next.js 16 App Router application using strict TypeScript, React, CSS Modules, DM Sans, Vitest, Testing Library, and ESLint.

The completed foundation includes:

- application and route-group structure;
- responsive authentication and dashboard shells;
- shared UI primitives and design tokens;
- real Supabase browser authentication;
- cookie-backed session persistence and restoration;
- protected routes and FastAPI-backed admin authorization;
- one shared authenticated FastAPI client;
- typed API errors and response handling;
- automated tests, typechecking, linting, and production builds.

The Admin Panel remains feature-incomplete. Blogs are complete; Case Studies, Careers, Job Applications, Our Team, and Contact Submissions follow in that order, followed by final hardening and production readiness.

### 3.1 Current structure

```text
apps/admin/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── styles/
├── package.json
├── README.md
└── tsconfig.json
```

### 3.2 Phase status summary

| Phase | Name | Status |
|---|---|---|
| A | Admin Panel Foundation | Complete |
| B | Authentication & Route Protection | Complete |
| C | Authenticated API Foundation | Complete |
| D | Blogs | Complete |
| E | Case Studies | Planned |
| F | Careers | Planned |
| G | Job Applications | Planned |
| H | Our Team | Planned |
| I | Contact Submissions | Planned |
| J | Hardening & Production Readiness | Planned |

### 3.3 Implementation principles and constraints

- FastAPI is the application and authorization boundary.
- Supabase Auth provides identity and browser sessions; authentication alone does not grant Admin Panel access.
- The shared `apiClient` is the only general FastAPI client. Feature phases may add typed feature modules that use it, but must not create competing HTTP or authentication layers.
- The browser must never contain a Supabase service-role/server secret, database credential, or private Storage credential.
- The Admin Panel must not access Supabase database tables or mutate Supabase Storage directly.
- Existing JSON CRUD contracts remain separate from dedicated multipart file endpoints.
- Backend validation and lifecycle rules remain authoritative.
- New UI behavior must be documented before implementation when it introduces a meaningful design or interaction decision.
- A phase must satisfy its definition of done before the next phase begins.

---

## 4. Product UI direction

The Admin Panel should use a conventional CMS/admin-dashboard structure.

### 4.1 Global layout

Desktop:

```text
┌───────────────────────────────────────────────────────────────┐
│ Header / account area                                         │
├────────────────┬──────────────────────────────────────────────┤
│                │                                              │
│ Sticky         │ Page content                                 │
│ sidebar        │                                              │
│                │                                              │
│ Dashboard      │                                              │
│ Blogs          │                                              │
│ Case Studies   │                                              │
│ Careers        │                                              │
│ Applications   │                                              │
│ Team Members   │                                              │
│ Contact        │                                              │
│                │                                              │
│                │                                              │
│ Logout         │                                              │
└────────────────┴──────────────────────────────────────────────┘
```

### 4.2 Sidebar

The sidebar is persistent/sticky on desktop.

Primary navigation:

1. Dashboard
2. Blogs
3. Case Studies
4. Careers
5. Job Applications
6. Team Members
7. Contact Submissions

The sidebar must not include modules that are explicitly out of scope.

A Settings section should not be added unless a real supported setting exists.

The sidebar should provide:

- active-route indication;
- clear labels;
- optional icons;
- keyboard accessibility;
- mobile collapse/drawer behavior.

### 4.3 Dashboard

The dashboard is the default authenticated landing screen.

It should contain a normal admin dashboard structure with 3–4 important KPI cards **only where the values can be derived from existing backend contracts or a separately approved backend contract**.

There is currently no dashboard metrics API.

Therefore:

- do not invent a `/dashboard` API;
- do not invent backend metrics;
- do not fake KPI values;
- do not add analytics claims;
- if KPIs are implemented from existing list APIs, document the exact derivation;
- otherwise keep the dashboard useful with navigation/recent operational information that can be supported by existing APIs.

Dashboard metrics are not a backend requirement at this stage.

---

# 5. Authentication

## 5.1 Authentication contract

The browser authenticates with Supabase Auth.

FastAPI then verifies the access token through Supabase `/auth/v1/user`.

Backend requirements:

1. access token must be valid;
2. email must use the exact case-insensitive `vyntics.com` domain;
3. matching `admin_users` row must exist;
4. `admin_users.is_active` must be true;
5. route-specific role requirements must be satisfied.

Roles:

- `admin`
- `superadmin`

## 5.2 Frontend responsibilities

Implemented foundation:

- Supabase browser client;
- login;
- session restoration;
- session persistence;
- access-token retrieval;
- logout;
- protected routes;
- redirect unauthenticated users to login;
- redirect authenticated users away from login where appropriate;
- authenticated API requests.

The frontend must never contain:

- `SUPABASE_SERVICE_ROLE_KEY`;
- `sb_secret_...`;
- any server-side Storage credential.

Only public Supabase configuration belongs in browser environment variables.

## 5.3 Authentication error handling

| Backend response | Frontend behavior |
|---|---|
| 401 | Treat as unauthenticated/unauthorized; clear stale auth state where appropriate and redirect to login or show unauthorized state |
| 403 | Show permission-denied state |
| 503 | Show service/configuration error without exposing internal details |

Do not attempt to distinguish missing-admin from inactive-admin based on the sanitized backend response.

There is no backend pending-admin state.

---

# 6. API client

One reusable authenticated API layer is implemented under `src/lib/api` and must be used by all future feature integrations.

Responsibilities:

- base URL from environment;
- JSON requests;
- multipart requests;
- access-token attachment;
- response parsing;
- normalized API errors;
- handling `{ "detail": ... }`;
- handling structured FastAPI 422 validation errors;
- handling 401/403/409/422/503;
- typed request/response models.

The shared client currently supports:

- `GET`, `POST`, `PATCH`, `PUT`, and `DELETE`;
- current Supabase session/access-token retrieval without separate token storage;
- `Authorization: Bearer <access_token>`;
- JSON and raw body requests, including future multipart usage;
- JSON, empty `204`, and non-JSON responses;
- typed authentication, permission, validation, not-found, conflict, service-unavailable, network, and unexpected errors;
- safe FastAPI `422` validation details without retaining submitted input values.

The low-level client does not redirect or make feature-specific UI decisions. Existing authentication and protected-route boundaries remain responsible for recovery and navigation.

FastAPI has no global `/api` prefix.

Examples:

```text
/admin/blogs
/blogs/{id}
/case-studies/{id}
/our-team/{id}
/admin/job-applications
/admin/contact-submissions
```

Do not add `/api` unless the backend contract changes.

## 6.1 Error model

The client should preserve enough information to render:

- human-readable message;
- status code;
- field-level validation information where available;
- generic fallback message.

Never expose:

- access tokens;
- Storage credentials;
- backend stack traces;
- raw infrastructure details.

---

# 7. Shared UI patterns

All feature screens should use common patterns.

## 7.1 Page header

A standard page header should support:

- page title;
- short description where useful;
- primary action;
- optional secondary actions.

Example:

```text
Blogs                                      [Create Blog]
Manage published and draft blog posts.
```

## 7.2 Tables

Use tables for:

- Blogs;
- Case Studies;
- Careers;
- Job Applications;
- Team Members;
- Contact Submissions.

Tables should support:

- clear column headings;
- row-level actions;
- loading state;
- empty state;
- error state;
- accessible action labels.

Do not implement frontend pagination/search/filter controls that imply backend support unless the data is actually loaded and filtered client-side intentionally.

The current backend list contracts have no pagination, search, or filtering parameters.

## 7.3 Forms

Forms should:

- use labels;
- show required fields;
- validate before submit;
- preserve backend validation messages;
- disable submit during mutation;
- show mutation failure;
- show success feedback;
- prevent accidental duplicate submission.

## 7.4 Destructive actions

Deletes require confirmation.

Confirmation must identify the resource.

Example:

> Delete this blog?  
> This action permanently removes the blog.

The UI must not claim soft deletion when the backend performs hard deletion.

---

# 8. Blogs

## 8.1 Routes / screens

Implement:

- Blog list;
- Create Blog;
- Edit Blog;
- Delete confirmation;
- Cover image upload;
- Cover image deletion.

Suggested frontend routes:

```text
/blogs
/blogs/new
/blogs/[id]/edit
```

Exact route syntax depends on the selected framework/router.

## 8.2 Backend endpoints

Protected administrative reads:

```http
GET /admin/blogs
GET /admin/blogs/{id}
```

Mutations:

```http
POST /blogs
PATCH /blogs/{id}
DELETE /blogs/{id}
```

Cover:

```http
PUT /blogs/{id}/cover-image
DELETE /blogs/{id}/cover-image
```

Upload uses multipart field:

```text
file
```

## 8.3 Fields

The Blog UI should expose the backend-supported fields:

| Field | UI control | Required |
|---|---|---|
| title | text input | according to backend schema |
| slug | text input | according to backend schema |
| seo_title | text input | optional |
| meta_description | textarea | optional |
| author | text input | according to backend schema |
| category | text input/select only if approved taxonomy exists | according to backend schema |
| excerpt | textarea | according to backend schema |
| cover_image_url | managed image upload | backend-managed through upload workflow |
| read_time | number input | according to backend schema |
| content | structured content editor | according to backend schema |
| status | select | `draft`, `published`, `unpublished` |

The frontend must not send backend-managed fields such as:

- `published_at`;
- `created_by`;
- `updated_by`;
- `created_at`;
- `updated_at`.

## 8.4 Status

Available statuses:

```text
draft
published
unpublished
```

Published behavior:

- published blogs require a cover image;
- deleting the cover of a published blog must be prevented by the UI;
- backend remains the final authority;
- if backend returns 422, display the backend message.

## 8.5 Cover image

Constraints:

- JPEG;
- PNG;
- WebP;
- maximum 5 MB.

Use:

```http
PUT /blogs/{id}/cover-image
```

and:

```http
DELETE /blogs/{id}/cover-image
```

The UI should provide:

- current image preview;
- upload/change control;
- remove control when allowed;
- upload progress/loading state;
- validation;
- success/error feedback.

Do not provide a free-form URL input unless explicitly required by the final backend/UI decision. The managed Storage workflow is the preferred UI.

---

# 9. Case Studies

## 9.1 Screens

Implement:

- Case Study list;
- Create;
- Edit;
- Delete confirmation;
- Cover upload;
- Cover deletion.

## 9.2 Endpoints

```http
GET /admin/case-studies
GET /admin/case-studies/{id}

POST /case-studies
PATCH /case-studies/{id}
DELETE /case-studies/{id}

PUT /case-studies/{id}/cover-image
DELETE /case-studies/{id}/cover-image
```

## 9.3 Fields

Expose:

| Field | UI control |
|---|---|
| slug | text input |
| title | text input |
| seo_title | text input |
| meta_description | textarea |
| client_name | text input |
| excerpt | textarea |
| cover_image_url | managed upload |
| tech_stack | array/tag-style control |
| tags | array/tag-style control |
| content | structured content editor |
| status | select |

Statuses:

```text
draft
published
unpublished
```

Published Case Studies require a cover.

## 9.4 Storage

Same image constraints as Blogs:

- JPEG/PNG/WebP;
- maximum 5 MB;
- managed through FastAPI.

---

# 10. Careers

## 10.1 Important backend behavior

Careers do **not** have:

- draft status;
- published/unpublished status;
- is_open;
- is_active;
- soft deletion.

An existing Career record represents an available/current Career.

Deletion is hard deletion.

`published_at` is backend-generated on creation and is not an availability control.

## 10.2 Endpoints

Public reads:

```http
GET /careers
GET /careers/{slug}
```

Administrative mutations:

```http
POST /careers
PATCH /careers/{id}
DELETE /careers/{id}
```

There is no separate admin Career list/detail API.

## 10.3 UI

Suggested routes:

```text
/careers
/careers/new
/careers/[id]/edit
```

The list may use the public Career GET endpoint because there is no separate admin list endpoint.

## 10.4 Fields

Expose backend-supported fields:

- slug
- title
- location
- employment_type
- department
- experience
- short_description
- description
- responsibilities
- requirements
- nice_to_have
- benefits

Do not expose:

- status;
- is_open;
- is_active;
- published_at as an editable field;
- ownership fields;
- timestamps as editable fields.

`nice_to_have` and `benefits` must respect the backend's object behavior and should not send explicit `null`.

## 10.5 Delete

Delete is permanent.

Show confirmation.

Do not claim the Career is archived.

Job Applications must survive Career deletion through the backend's historical snapshot behavior.

---

# 11. Job Applications

## 11.1 Screens

Implement:

- global application list;
- application detail;
- status editing;
- notes editing;
- resume access;
- delete confirmation.

Suggested routes:

```text
/job-applications
/job-applications/[id]
```

## 11.2 Endpoints

```http
GET /admin/job-applications
GET /admin/job-applications/{id}

PATCH /admin/job-applications/{id}
DELETE /admin/job-applications/{id}

GET /admin/careers/{career_id}/applications
```

PATCH accepts only:

```text
status
notes
```

Statuses:

```text
new
reviewing
shortlisted
rejected
hired
```

Do not build UI controls for changing other application fields.

## 11.3 Resume handling

`resume_url` is nullable.

Administrative responses may contain short-lived signed resume URLs.

Rules:

- never store a signed URL as permanent application state;
- never convert it into a public URL;
- never expose Storage credentials;
- use the URL only for the intended temporary viewing/downloading action;
- handle expiration gracefully.

Possible UX:

```text
Resume
[View / Download Resume]
```

If no resume exists:

```text
No resume attached.
```

## 11.4 Historical Career

A Career may be deleted while its applications remain.

The UI must handle applications whose `career_id` is null while historical career title/slug snapshots remain available.

Do not assume every application has a live Career relationship.

---

# 12. Our Team

## 12.1 Screens

Implement:

- Team Member list;
- create;
- edit;
- delete;
- photo upload;
- photo deletion.

Suggested routes:

```text
/team
/team/new
/team/[id]/edit
```

## 12.2 Endpoints

Public:

```http
GET /our-team
GET /our-team/{id}
```

Admin mutations:

```http
POST /our-team
PATCH /our-team/{id}
DELETE /our-team/{id}

PUT /our-team/{id}/photo
DELETE /our-team/{id}/photo
```

## 12.3 Fields

Expose:

- name
- role
- bio
- photo_url — managed through upload workflow
- linkedin_url
- display_order
- member_type

`member_type`:

```text
leadership
team
```

No visibility/status/archive fields should be invented.

## 12.4 Photo

Optional.

Constraints:

- JPEG;
- PNG;
- WebP;
- maximum 5 MB.

Provide preview, upload/change, and delete controls.

LinkedIn URL should use the backend's HTTP(S) validation.

---

# 13. Contact Submissions

## 13.1 Screens

Implement:

- submission list;
- submission detail;
- delete confirmation.

Suggested routes:

```text
/contact
/contact/[id]
```

## 13.2 Endpoints

Public submission creation:

```http
POST /contact-us
```

- no Admin authentication is required;
- success returns `201 Created`;
- the request body accepts only the visitor-controlled fields below;
- the public response is the minimal receipt below and does not expose administrative metadata.

Public request body:

| Field | Type | Required | Validation |
|---|---|---:|---|
| name | string | yes | trimmed, minimum length 1 |
| email | email string | yes | valid email address |
| company | string or null | no | optional |
| subject | string | yes | trimmed, minimum length 1 |
| message | string | yes | trimmed, minimum length 1 |
| source_page | string | yes | trimmed, minimum length 1 |

Public `201` receipt:

| Field | Type | Behavior |
|---|---|---|
| id | UUID | persisted submission identifier |
| status | `new` | initial backend-generated status |
| submitted_at | datetime | backend-generated submission time |

Administrative reads and deletion:

```http
GET /admin/contact-submissions
GET /admin/contact-submissions/{id}
DELETE /admin/contact-submissions/{id}
```

- all three Admin endpoints require an authenticated, authorized Admin;
- the list returns all submissions newest-first;
- `{id}` is the Contact Submission UUID;
- missing detail/delete targets return `404`;
- successful deletion is permanent and returns an empty `204 No Content` response.

There is currently no PATCH/status-resolution endpoint.

Therefore the UI must **not** include:

- mark resolved;
- change status;
- edit submission;
- assign submission;
- workflow state controls.

## 13.3 Display fields

Display:

- name
- email
- company
- subject
- message
- source_page
- status
- submitted_at
- notes/resolution metadata only if returned by the backend response

The Admin response contract contains:

| Field | Type / nullability |
|---|---|
| id | UUID |
| name | string |
| email | email string |
| company | string or null |
| subject | string |
| message | string |
| source_page | string |
| status | string |
| notes | string or null |
| submitted_at | datetime |
| resolved_at | datetime or null |
| resolved_by | UUID or null |

Do not expose or invent fields not returned by the actual response contract.

## 13.4 Delete

Hard delete.

Require confirmation.

---

# 14. Storage workflows

Storage is accessed through FastAPI.

The browser does not directly mutate Supabase Storage.

Image buckets are public-read but backend-managed for mutations.

Private Job Application resumes remain private.

## 14.1 Image uploads

Supported:

- Blogs → blog cover;
- Case Studies → case-study cover;
- Team → team photo.

Constraints:

```text
JPEG / PNG / WebP
maximum 5 MB
```

The UI should validate these before upload but must still treat the backend as authoritative.

## 14.2 Replacement

The UI should treat replacement as one logical mutation:

1. select new file;
2. upload;
3. update/display returned resource;
4. refresh local resource state.

Do not manually delete Storage paths from the browser.

## 14.3 Errors

Storage/configuration failures return sanitized `503`.

Display a useful generic message such as:

> The file could not be uploaded right now. Please try again.

Do not expose provider internals.

---

# 15. Loading, empty, error, and mutation states

Every list and detail screen must define all four.

## Loading

Use consistent skeleton/spinner patterns.

## Empty

Example:

> No blog posts yet.

Provide the primary action when appropriate:

> Create your first blog

## Error

Show:

- concise user-facing message;
- retry action where retry is meaningful.

## Mutation

During create/update/delete/upload:

- disable duplicate submission;
- show progress/loading;
- prevent accidental repeated actions;
- show success/failure feedback.

---

# 16. Validation

Frontend validation should mirror backend expectations.

However:

> Backend validation is authoritative.

Never weaken frontend validation to bypass a backend rule.

Never add frontend-only business rules that contradict the backend.

Backend rejects undeclared fields, so request payloads must be deliberately constructed.

Do not blindly serialize full form state into API requests if that would include UI-only fields.

---

# 17. Responsive behavior

Desktop is the primary admin experience.

Mobile/tablet must remain usable.

Desktop:

- sticky sidebar;
- full tables where practical.

Smaller screens:

- collapsible sidebar/drawer;
- horizontally scrollable data tables where necessary;
- stacked forms;
- full-width primary actions;
- accessible dialogs.

Do not build a separate mobile product. Use the same information architecture responsively.

---

# 18. Accessibility

Required baseline:

- semantic HTML;
- labels for inputs;
- keyboard-accessible controls;
- visible focus states;
- sufficient contrast;
- dialogs with correct focus behavior;
- buttons must have meaningful accessible names;
- tables must have meaningful headers;
- status should not be conveyed by color alone.

---

# 19. Testing strategy

The Admin Panel has an established Vitest and Testing Library foundation. Completed Phase A–C behavior is covered by automated tests, and each feature phase must extend—not weaken—the suite.

The implementation strategy includes:

### Unit tests

For:

- validation helpers;
- API error normalization;
- data transformation;
- auth utilities;
- formatting utilities.

### Component tests

For:

- forms;
- tables;
- dialogs;
- upload controls;
- status controls;
- protected UI behavior.

### Integration tests

For:

- authentication/session behavior;
- API client;
- CRUD workflows;
- upload workflows;
- error handling.

Existing foundation coverage includes:

- shared UI primitives and shell behavior;
- login rendering, validation, loading, password visibility, email/password authentication, and Google OAuth initiation;
- protected-route and logout behavior;
- backend admin-authorization status handling;
- authenticated API requests, bearer headers, supported methods, response parsing, validation details, and typed error mapping.

### E2E

At minimum, cover critical paths:

1. login;
2. protected route;
3. blog create/edit/delete;
4. blog cover upload;
5. published-cover deletion protection;
6. case study CRUD;
7. career CRUD;
8. job application status/notes;
9. resume access;
10. team member/photo workflow;
11. contact submission read/delete;
12. logout.

Exact browser matrix is a tooling decision to be finalized during foundation setup.

---

# 20. Environment configuration

The Admin Panel needs browser-safe configuration only.

Required browser-safe variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE_URL
```

Local values may be supplied through an ignored `apps/admin/.env` or `.env.local`. The application must be restarted after changing `NEXT_PUBLIC_*` variables.

Never add:

```text
SUPABASE_SERVICE_ROLE_KEY
sb_secret_...
```

to the Admin Panel.

---

# 21. Explicitly out of scope

Do not implement:

- Clients;
- Media Library;
- generic media APIs;
- Testimonials;
- Newsletters;
- analytics/dashboard metrics without a backend contract;
- separate admin-user/roles management UI;
- maintenance mode;
- scheduled publishing;
- backend workflow states that do not exist;
- direct browser access to Supabase database for application CRUD;
- direct browser Storage mutations;
- any other removed backend modules.

---

# 22. Historical design document

Any older Admin Panel design document that assumes:

- direct Supabase database access;
- RLS-based browser CRUD;
- Clients;
- Media Library;
- Testimonials;
- Newsletters;
- old dashboard analytics;
- admin-user management UI;
- other removed modules;

must be treated as historical/obsolete for this implementation.

The current backend contracts and this document are the source of truth.

---

# 23. Phase roadmap

Sections 5–20 retain the shared technical, UI, authentication, API, feature-contract, Storage, validation, testing, and environment requirements. The phase descriptions below define delivery scope and point back to those detailed contracts; they do not replace or weaken them.

The authoritative implementation order is:

| Phase | Delivery | Status |
|---|---|---|
| A | Admin Panel Foundation | Complete |
| B | Authentication & Route Protection | Complete |
| C | Authenticated API Foundation | Complete |
| D | Blogs | Complete |
| E | Case Studies | Planned |
| F | Careers | Planned |
| G | Job Applications | Planned |
| H | Our Team | Planned |
| I | Contact Submissions | Planned |
| J | Hardening & Production Readiness | Planned |

## 23.1 Phase A — Admin Panel Foundation

**Status:** Complete

### Goal

Establish a production-capable frontend foundation without implementing real authentication or feature CRUD.

### Scope delivered

- Next.js 16 and React Admin application using the App Router;
- strict TypeScript and path aliases;
- route groups for public authentication and protected application areas;
- DM Sans, global design tokens, CSS Modules, and the monochrome visual system;
- responsive login shell, Admin shell, sidebar, header, and dashboard shell;
- shared `Button`, `Input`, `Card`, `FormField`, `PageHeader`, and layout primitives;
- Vitest, Testing Library, ESLint, typecheck, and production-build tooling;
- browser-safe environment-variable conventions;
- intentionally non-functional login shell, with real authentication deferred to Phase B;
- no fake metrics, mock authenticated user, or feature data.

### Verification

- foundation component tests;
- TypeScript strict-mode check;
- lint;
- production build;
- manual route and responsive-shell review.

### Definition of done

The Admin application builds and runs with stable routing, styling, reusable primitives, responsive shells, and an automated quality-check foundation, while making no claim that authentication or CRUD is implemented.

## 23.2 Phase B — Authentication & Route Protection

**Status:** Complete

### Goal

Provide real browser authentication and prevent unauthenticated or unauthorized access to the Admin workspace.

### Scope delivered

- shared browser-safe Supabase client using only the public URL and anon/publishable key;
- email/password sign-in;
- Google OAuth with the Next.js callback route;
- cookie-backed session persistence, restoration, refresh, and auth-state handling;
- protected `/dashboard` and future application routes;
- FastAPI admin-authorization check after Supabase authentication;
- enforcement of the backend `vyntics.com`, active `admin_users`, and role contract by FastAPI;
- logout and post-logout route protection;
- safe authentication, permission-denied, and service-unavailable states for `401`, `403`, and `503` behavior;
- documented responsive 55/45 login layout and accessible login controls;
- no public signup, invitation, password-reset, or admin-user management UI.

Detailed authentication and authorization requirements remain in Section 5.

### Verification

- login rendering, validation, loading, duplicate-submission, visibility-toggle, password sign-in, and OAuth tests;
- protected-route, session-state, authorization-status, and logout tests;
- full test suite, typecheck, lint, and production build;
- local verification that `/login` loads and logged-out `/dashboard` redirects to `/login`;
- real provider flows require valid local browser-safe Supabase configuration and provider setup.

### Definition of done

A real Supabase session can be created and restored, FastAPI remains the authorization authority, unauthorized users cannot enter the application area, and logout removes access without exposing server credentials.

## 23.3 Phase C — Authenticated API Foundation

**Status:** Complete

### Goal

Create the one reusable, feature-agnostic FastAPI client used by all later Admin features.

### Scope delivered

- shared `src/lib/api` client, types, and typed error model;
- `NEXT_PUBLIC_API_BASE_URL` and safe relative-path URL construction;
- current Supabase session/access-token retrieval for every request;
- bearer authorization without separate token storage or browser JWT decoding;
- `GET`, `POST`, `PATCH`, `PUT`, and `DELETE` support;
- JSON headers and serialization when a JSON body is supplied;
- raw body support for multipart workflows used by feature-specific file endpoints;
- JSON, empty `204`, and non-JSON response handling;
- typed handling for `401`, `403`, `422`, `404`, `409`, `503`, network failures, and unexpected responses;
- preservation of useful sanitized FastAPI validation details;
- no redirects in the low-level client; feature-specific API modules are added only by later feature phases and consume this shared client.

The detailed shared client contract remains in Section 6.

### Verification

- focused tests for authenticated requests, bearer headers, absent sessions, all supported methods, body handling, response forms, validation details, HTTP error mapping, network failures, and unsafe paths;
- Phase B regression tests;
- full test suite, typecheck, lint, and production build;
- configured FastAPI health endpoint verified locally.

### Definition of done

Future features can communicate with FastAPI through one strictly typed authenticated client, with predictable response parsing and safe error classification, without introducing another auth or HTTP abstraction.

## 23.4 Phase D — Blogs

**Status:** Complete

### Goal

Deliver the first complete authenticated content-management workflow using the shared API foundation.

### Scope delivered

- Blog list using the protected administrative list contract;
- Blog detail/edit loading through the protected administrative detail contract;
- create, update, and permanent-delete workflows;
- explicit handling of `draft`, `published`, and `unpublished` lifecycle values;
- supported title, slug, author, category, excerpt, read-time, structured content, SEO title, and meta-description fields;
- deliberate request construction that excludes backend-managed ownership, publication, and timestamp fields;
- backend-authoritative slug and validation behavior, including conflict and validation feedback;
- managed cover preview, upload, replacement, and deletion through the dedicated multipart endpoints;
- JPEG/PNG/WebP and 5 MB client validation, while retaining backend authority;
- prevention of cover deletion from a published Blog and clear backend `422` feedback;
- destructive confirmation and correct post-delete navigation/state refresh;
- loading, empty, error, mutation, and success states;
- responsive and keyboard-accessible list, form, actions, and upload UI;
- a typed Blogs feature module that consumes the shared `apiClient`, not a separate client.

The detailed Blog endpoint, field, status, Storage, and backend-managed-field contract remains in Section 8. Shared table, form, delete, upload, validation, and error requirements remain in Sections 7 and 14–18.

### Verification

- unit tests for Blog transformations and validation helpers;
- component tests for list, form, lifecycle controls, delete confirmation, and cover controls;
- integration tests for list/detail/create/update/delete and cover upload/replacement/deletion;
- regressions for published-cover deletion protection, `401`, `403`, `404`, `409`, `422`, and `503` states;
- typecheck, lint, full tests, production build, responsive/accessibility review, and manual verification against FastAPI.

### Definition of done

An authorized administrator can manage the complete existing Blog contract—including lifecycle, SEO, slug, deletion, and cover workflows—without invented fields, endpoints, or direct Supabase data/Storage access.

## 23.5 Phase E — Case Studies

**Status:** Planned

### Goal

Deliver Case Study management using the established content and upload patterns.

### Scope

- list, detail/edit, create, update, and permanent-delete workflows;
- all currently documented fields, including slug, SEO metadata, client name, excerpt, technology stack, tags, structured content, and status;
- `draft`, `published`, and `unpublished` lifecycle handling;
- managed cover upload, replacement, preview, and deletion;
- published-cover requirements and deletion protection;
- loading, empty, error, confirmation, mutation, responsive, and accessible states;
- typed Case Study integration through the shared `apiClient`.

The exact Case Study endpoints, methods, fields, status lifecycle, and cover behavior remain in Section 9. Shared Storage and error rules remain in Sections 14–16.

### Verification

- focused unit, component, and integration tests for CRUD, arrays/tags, lifecycle behavior, and cover workflows;
- relevant authentication, authorization, validation, conflict, not-found, and service-error regressions;
- typecheck, lint, full tests, production build, and real-backend manual verification.

### Definition of done

The complete existing Case Study contract is manageable through a consistent Admin UI without adding fields, states, or endpoints.

## 23.6 Phase F — Careers

**Status:** Planned

### Goal

Provide Career management that accurately reflects the current hard-delete availability model.

### Scope

- list using the existing public Career read endpoint because no separate Admin list/detail API exists;
- create, detail/edit, update, and permanent-delete workflows;
- all documented Career fields and object behavior for responsibilities, requirements, `nice_to_have`, and benefits;
- omission behavior where the backend contract does not accept explicit `null`;
- backend-generated `published_at` displayed only where useful and never treated as editable or as an availability switch;
- no `status`, `is_open`, `is_active`, draft, archive, or soft-delete controls;
- clear UI communication that an existing record is available and deletion makes it unavailable;
- deletion confirmation while preserving historical Job Applications according to the backend relationship contract;
- typed integration through the shared `apiClient` with complete loading/error states.

The exact Career endpoints, fields, lifecycle exclusions, `published_at`, and deletion contract remain in Section 10.

### Verification

- tests for list/create/edit/delete, object-field omission, absence of invented availability controls, and historical-application expectations;
- authorization and standard API-error regressions;
- typecheck, lint, full tests, production build, and real-backend manual verification.

### Definition of done

Administrators can manage the exact existing Career contract, with permanent deletion and backend-generated publication metadata represented accurately.

## 23.7 Phase G — Job Applications

**Status:** Planned

### Goal

Provide authorized review and limited management of submitted Job Applications.

### Scope

- global application list and application detail;
- career-specific application list using the documented Admin endpoint;
- status transitions limited to `new`, `reviewing`, `shortlisted`, `rejected`, and `hired`;
- notes editing, including the documented nullable/clear behavior;
- PATCH payloads limited to `status` and `notes`;
- permanent-delete confirmation using the existing delete endpoint;
- nullable resume handling and a clear “No resume attached” state;
- temporary viewing/downloading using only backend-issued short-lived signed URLs;
- no permanent public resume URL and no raw Storage path display;
- handling of expired signed URLs;
- correct display of historical Career title/slug snapshots when `career_id` is null after Career deletion;
- typed integration through the shared `apiClient` and safe handling of sensitive applicant data.

The exact global and career-specific endpoints, PATCH limitations, statuses, resume behavior, and historical Career relationship remain in Section 11. Private Storage rules remain in Sections 14 and 24 of the style guide.

### Verification

- tests for global/career lists, detail, status/notes patching, explicit notes clearing, deletion, missing resume, signed URL use/expiration, and deleted-Career history;
- authentication, authorization, validation, not-found, conflict, and service-error regressions;
- typecheck, lint, full tests, production build, and authorized real-backend manual verification.

### Definition of done

Authorized administrators can review and update only the allowed Job Application fields, access private resumes safely, and handle applications independently of a live Career record.

## 23.8 Phase H — Our Team

**Status:** Planned

### Goal

Deliver Team Member management with deterministic ordering and managed optional photos.

### Scope

- list/detail using the existing public read endpoints;
- protected create, update, and permanent-delete workflows;
- name, role, bio, LinkedIn URL, display order, and `member_type` fields;
- `leadership` and `team` member types only;
- ordering behavior based on the documented `display_order` contract;
- optional managed photo preview, upload, replacement, and deletion;
- JPEG/PNG/WebP and 5 MB client validation with backend authority;
- no invented visibility, status, archive, or publish controls;
- typed integration through the shared `apiClient`.

The exact Team endpoints, fields, member types, display order, LinkedIn validation, and photo behavior remain in Section 12.

### Verification

- tests for CRUD, member types, display order, LinkedIn validation presentation, and optional photo workflows;
- authentication, authorization, upload-validation, not-found, and service-error regressions;
- typecheck, lint, full tests, production build, responsive review, and real-backend manual verification.

### Definition of done

Administrators can manage the complete current Team contract and optional photos without invented lifecycle fields or direct Storage access.

## 23.9 Phase I — Contact Submissions

**Status:** Planned

### Goal

Provide a focused administrative inbox for reading and permanently deleting Contact Submissions.

### Scope

- Admin list and detail screens using the protected endpoints;
- display only fields returned by the current response contract, including submission identity, contact information, company, subject, message, source page, status, submission time, and returned notes/resolution metadata where present;
- permanent-delete confirmation;
- loading, empty, error, and responsive long-message states;
- no edit, assignment, mark-resolved, or status-transition controls because no PATCH/status-resolution endpoint exists;
- awareness that public submission creation remains a public website/backend workflow and is not recreated as an Admin mutation;
- typed integration through the shared `apiClient`.

The exact public create/receipt contract, Admin list/detail/delete contract, and explicit absence of a PATCH workflow remain in Section 13. The Admin UI must not redefine or duplicate the public website's submission workflow.

### Verification

- tests for list, detail, empty/error states, permanent-delete confirmation, and absence of unsupported workflow controls;
- authentication, authorization, not-found, and service-error regressions;
- typecheck, lint, full tests, production build, and real-backend manual verification.

### Definition of done

Authorized administrators can safely read and delete submissions while the UI makes no unsupported promise of editing or resolution workflow.

## 23.10 Phase J — Hardening & Production Readiness

**Status:** Planned

### Goal

Harden the complete Admin Panel and produce a verified release candidate.

### Scope

- final desktop, tablet, and mobile review across every route;
- keyboard, focus, form-label, semantic HTML, dialog, table, contrast, and status-meaning accessibility review;
- shared component, spacing, typography, action, table, form, dialog, and notification consistency review;
- loading, empty, error, mutation, retry, and destructive-confirmation review;
- Supabase session restoration, refresh, expiration, logout, OAuth callback, unauthenticated, unauthorized, and service-unavailable edge cases;
- API error mapping and user-message review across `401`, `403`, `404`, `409`, `422`, `503`, network, and unexpected failures;
- production build and runtime verification;
- browser-safe environment configuration review;
- review that no access tokens, private applicant data, service-role/server secrets, raw Storage paths, stack traces, or infrastructure details are exposed;
- final critical-path manual smoke testing against the real backend and Supabase services;
- production-readiness checklist and documented remaining operational prerequisites.

### Verification

- full unit, component, integration, and approved E2E suite;
- typecheck, lint, and production build;
- supported-browser and responsive checks;
- accessibility review;
- authenticated real-backend smoke tests for all implemented modules;
- configuration and browser-exposure review.

### Definition of done

All implemented modules satisfy their contracts and quality gates, no critical accessibility/security/configuration issue remains, and the Admin Panel is ready for deployment approval.

---

# 24. Phase workflow and implementation discipline

Every future phase follows this sequence:

1. Define the phase's UI/UX requirements where applicable.
2. Update or review documentation when the phase introduces meaningful UI/UX or architectural decisions.
3. Use the detailed backend/API contract in this document and the current FastAPI implementation as the source of truth.
4. Implement only the approved phase scope.
5. Run focused and complete automated tests.
6. Run TypeScript typechecking.
7. Run lint.
8. Run the production build.
9. Perform manual verification against the real backend and providers where applicable.
10. Review the complete phase changes for scope, security, contracts, and unintended regressions.
11. The user manually commits, pushes, and creates a pull request.
12. Start the next phase only after the current phase satisfies its definition of done.

Implementation agents must not:

- commit;
- push;
- switch branches;
- merge;
- rebase;
- silently expand a phase into unrelated application or backend work;
- invent missing fields, endpoints, states, permissions, or persistence behavior.

If an API contract is insufficient for a requested UI feature, stop and identify the missing contract rather than inventing one.
