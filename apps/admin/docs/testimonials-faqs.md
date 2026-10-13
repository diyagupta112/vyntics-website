# Testimonials and FAQs Admin Panel implementation

Implemented 13 October 2026 using only `apps/admin` source and documentation.

## User flows and contracts

The sidebar places Testimonials and FAQs after Badges in content management.
Each resource has list, create, and edit routes under the existing protected
`(dashboard)` layout. Customer-quote and page-specific FAQ cards show attribution
or page label, content previews, activity, display order, and explicit Edit/Delete
actions. Inactive records stay visible. Forms reuse the existing inputs, textareas,
selects, buttons, field validation, inline save/error feedback, and shared
DeleteConfirmationDialog. Quotes/answers are not rich-text editors or uploads.

The existing shared authenticated API client is the only HTTP client. Admin list
responses are plain arrays and detail responses are objects; there is no envelope
normalization or compatibility wrapper. Public `{data:[...]}` endpoints are not
used or changed by this feature.

- FAQ reads: `GET /admin/faqs` and `GET /admin/faqs/{id}`.
- FAQ filtering: `GET /admin/faqs?page=<stable key>`; All Pages omits the parameter.
- FAQ writes: `POST /faqs`, `PATCH /faqs/{id}`, `DELETE /faqs/{id}`.
- Testimonial reads: `GET /admin/testimonials`, `GET /admin/testimonials/{id}`.
- Testimonial writes: `POST /testimonials`, `PATCH /testimonials/{id}`,
  `DELETE /testimonials/{id}`.

FAQ options live in `src/features/faqs/lib/page-options.ts`, shared by the list
filter and form. Friendly labels map to the five service page paths. They are
editorial choices, not a TypeScript enum or a backend whitelist. Add future choices
there. Valid unconfigured keys returned by the backend are preserved as additional
select options when editing and learned by the list filter. Filtering is requested
from the server; no client-side FAQ page filtering is performed. Requests are
cancelled and stale responses ignored when switching pages.

Create forms default order to 0 and activity to true, matching the backend. Empty
optional testimonial fields submit null; existing optional values are preserved
unless explicitly changed. Logos are HTTP(S) URL references only, with no upload
or managed-asset deletion. FAQ order hints explicitly scope ordering to its page.
The existing backend determines actual ordering; the UI does not sort or renumber.

401/403/404/422/503/network errors follow the shared client's existing categories.
Validation issues map to form fields. Other failures use safe messages, and loading,
empty, error/retry, save, and deletion states remain visible and accessible.

## Verification

- Focused tests cover API URLs/plain arrays, every page filter, friendly labels,
  arbitrary valid existing pages, stale requests, list states, required/optional
  fields, create/edit/delete, cancellation, safe errors, and sidebar links.
- 55 focused tests and all 370 Admin tests passed. TypeScript, ESLint, and
  production build passed.
- Browser verification exercised real components and the actual shared API client
  using temporary in-memory fixtures and test session/navigation substitutes.
  All five filters and both CRUD flows passed; 390px mobile layouts and desktop
  cards had no horizontal overflow. Long previews truncate and card actions align.
  No mock API, fake session, or preview route was added to production source.

## Remaining backend prerequisite

A read-only check found that the configured database lacks `faqs` and
`testimonials`, and migration `20261013120000_create_faqs_and_testimonials.sql` is
not recorded. The local API consequently returned generic 500 responses. Apply
that already-created migration separately before live verification/use. This
frontend task did not apply it, modify backend/public frontend files, change
contracts, perform Git operations, or deploy anything.

## Exact source/documentation file manifest

All paths below are relative to `apps/admin`; generated build/cache files are
excluded.

```text
README.md
docs/testimonials-faqs.md
src/app/(dashboard)/faqs/[id]/edit/page.tsx
src/app/(dashboard)/faqs/new/page.tsx
src/app/(dashboard)/faqs/page.tsx
src/app/(dashboard)/testimonials/[id]/edit/page.tsx
src/app/(dashboard)/testimonials/new/page.tsx
src/app/(dashboard)/testimonials/page.tsx
src/components/content-management/content-management.module.css
src/components/content-management/errors.ts
src/components/layout/sidebar.test.tsx
src/components/layout/sidebar.tsx
src/features/faqs/api/faqs.test.ts
src/features/faqs/api/faqs.ts
src/features/faqs/components/faq-editor.tsx
src/features/faqs/components/faq-form.tsx
src/features/faqs/components/faq-list.tsx
src/features/faqs/components/faq-management.test.tsx
src/features/faqs/lib/faq-form.test.ts
src/features/faqs/lib/faq-form.ts
src/features/faqs/lib/page-options.ts
src/features/faqs/test-fixtures.ts
src/features/faqs/types.ts
src/features/testimonials/api/testimonials.test.ts
src/features/testimonials/api/testimonials.ts
src/features/testimonials/components/testimonial-editor.tsx
src/features/testimonials/components/testimonial-form.tsx
src/features/testimonials/components/testimonial-list.tsx
src/features/testimonials/components/testimonial-management.test.tsx
src/features/testimonials/lib/testimonial-form.test.ts
src/features/testimonials/lib/testimonial-form.ts
src/features/testimonials/test-fixtures.ts
src/features/testimonials/types.ts
```
