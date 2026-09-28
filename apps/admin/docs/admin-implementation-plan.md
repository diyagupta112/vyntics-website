# Vyntics Admin Panel — Implementation Plan

**Status:** Planning / source of truth for Admin Panel implementation  
**Application:** `apps/admin`  
**Backend:** FastAPI (`apps/api`)  
**Auth:** Supabase Auth  
**Database / Storage:** Supabase  
**Audience:** Developers and Codex implementation agents

---

## 1. Purpose

This document is the implementation source of truth for the Vyntics Admin Panel.

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

## 3. Current `apps/admin` starting point

The current Admin Panel is an empty TypeScript workspace.

There is currently:

- no selected frontend framework;
- no router;
- no UI system;
- no API client;
- no Supabase browser client;
- no authentication UI;
- no screens;
- no tests;
- no production build system.

Existing structural directories include:

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

The implementation may establish the actual application architecture inside this scaffold.

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

Implement:

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

Create one reusable API layer.

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

```http
GET /admin/contact-submissions
GET /admin/contact-submissions/{id}
DELETE /admin/contact-submissions/{id}
```

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

The Admin Panel currently has no tests.

The final implementation should establish:

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

Expected categories:

```text
Supabase public URL
Supabase anon/publishable key
FastAPI base URL
```

The exact environment variable names must be established during Phase A and documented.

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

# 23. Implementation order

## Phase A — Admin Foundation

Establish:

- framework;
- routing;
- build/dev tooling;
- styling;
- DM Sans;
- design tokens;
- environment configuration;
- testing stack;
- application structure.

## Phase B — Authentication

Implement:

- Supabase browser auth;
- login;
- session persistence;
- protected routes;
- logout;
- unauthorized behavior.

## Phase C — Admin Shell

Implement:

- sidebar;
- header/account area;
- page layout;
- dashboard;
- reusable UI primitives.

## Phase D — API Client

Implement:

- typed API client;
- auth headers;
- errors;
- multipart;
- request/response models.

## Phase E — Blogs

## Phase F — Case Studies

## Phase G — Careers

## Phase H — Job Applications

## Phase I — Our Team

## Phase J — Contact Submissions

## Phase K — Hardening

Implement:

- full test coverage;
- accessibility;
- responsive checks;
- production build;
- lint;
- typecheck;
- E2E critical paths.

---

# 24. Implementation discipline

Codex must not:

- commit;
- push;
- switch branches;
- merge;
- rebase.

Each implementation phase should follow:

```text
Implement
→ run tests
→ run typecheck/lint/build where available
→ manual verification
→ report results
→ user commits
→ user pushes
→ PR
```

Do not silently expand a phase into unrelated backend changes.

If an API contract is insufficient for a requested UI feature, stop and identify the missing backend contract rather than inventing one.

