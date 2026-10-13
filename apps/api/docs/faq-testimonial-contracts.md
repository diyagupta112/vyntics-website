# FAQs and Testimonials backend contracts

Implemented 13 October 2026. Apply
`supabase/migrations/20261013120000_create_faqs_and_testimonials.sql` before deploying
the updated backend. This phase includes no Admin Panel or public UI integration.

## FAQ page keys

`page` is required text, 1–255 characters, trimmed at the request boundary. It
uses lowercase ASCII letters/digits with internal single hyphens; `/` separates
segments. Do not include a leading/trailing slash, hostname, protocol, query, or
fragment. Single-segment keys (`careers`, `about`, `technologies`) and future paths
(`company/example-page`, `technologies/data-platform`) are supported. Page existence
is intentionally not validated against today's routes, so new pages require no
schema migration. There is no page enum, page table, or page foreign key.

Current canonical service examples:

- `services/cloud-foundations`
- `services/data-engineering`
- `services/analytics-bi`
- `services/ai-solutions`
- `services/crm-revenue-ops`

`all` is not a special FAQ value. It has no wildcard or service-targeting behavior;
if supplied as an ordinary literal key, only an exact `page=all` query matches it.
An FAQ is assigned to one page at a time. There is no connection to Blog/Case Study
`related_service` targeting.

## Endpoints

| Resource | Public read | Protected reads | Protected mutations |
| --- | --- | --- | --- |
| FAQs | `GET /faqs?page=<key>`; page may be omitted | `GET /admin/faqs?page=<key>`; `GET /admin/faqs/{resource_id}` | `POST /faqs`; `PATCH /faqs/{resource_id}`; `DELETE /faqs/{resource_id}` |
| Testimonials | `GET /testimonials` | `GET /admin/testimonials`; `GET /admin/testimonials/{resource_id}` | `POST /testimonials`; `PATCH /testimonials/{resource_id}`; `DELETE /testimonials/{resource_id}` |

Public lists use `{ "data": [...] }`; empty results use `{ "data": [] }`.
Admin lists are arrays following the existing Admin API convention. Public lists
include active records only; Admin lists include active and inactive records.
FAQ page filters are exact SQL matches for both clients. Unfiltered FAQ lists sort
by page, then display_order, created_at, and id, all ascending. Testimonials sort
by display_order, created_at, and id, ascending. Ties do not cause nondeterminism.
No automatic renumbering or unique display-order constraint is used.

Protected routes require a verified Supabase access token mapped to an active
Vyntics admin, using the existing shared dependencies; normal admins and
superadmins may manage these resources. No frontend-provided actor identity is
accepted. Missing/invalid tokens, missing admin mappings, and inactive accounts
return 401. Invalid parameters/body/UUIDs return 422. Missing detail/update/delete
records return 404. Persistence failures use generic 500 detail messages.

## Request fields

FAQ create example:

```json
{
  "page": "services/cloud-foundations",
  "question": "What are cloud consulting services?",
  "answer": "Cloud consulting services help assess, design, migrate, and improve your cloud environment.",
  "display_order": 1,
  "is_active": true
}
```

FAQ question and answer are required nonblank strings. Responses include id, page,
question, answer, and display_order. Admin responses additionally include is_active,
created_at, and updated_at.

Testimonial create example:

```json
{
  "quote": "The team helped us deliver a dependable platform.",
  "author_name": "Example Author",
  "author_role": "Engineering Lead",
  "company_name": "Example Company",
  "company_logo_url": "https://example.com/logo.png",
  "display_order": 1,
  "is_active": true
}
```

Quote and author_name are required nonblank strings. Role, company name, and company
logo URL are optional/nullable. Logos must be absolute HTTP(S) references. Normal
POST/PATCH continues to accept external URLs; the backend never fetches them.
Public responses contain
id and the editorial fields plus display_order; Admin responses also include
is_active and timestamps.

Both resources default display_order to 0 and is_active to true on create. PATCH
includes only supplied fields; omission preserves existing values. Explicit null
for required fields, order, or activity is rejected. Testimonial optional role,
company, and logo fields can be explicitly cleared. An empty/no-op PATCH returns
the existing record without an update audit. Creates return 201, updates 200, and
deletes 204. The existing audit system records meaningful create/update/delete
mutations with the verified actor and the same database transaction.

## Database and verification

`faqs.page` is PostgreSQL text with a format CHECK constraint. Both tables have
UUID primary keys, required activity/order fields, generated timestamps, and
nonblank editorial-field checks. Timestamp triggers reuse `public.set_updated_at()`.
Indexes are `ix_faqs_page_active_display_order`
(page, is_active, display_order, created_at, id) and
`ix_testimonials_active_display_order` (is_active, display_order, created_at, id).

Verification passed: focused contract/model tests, full default backend suite,
real PostgreSQL migration and HTTP lifecycle in a disposable schema, compile,
startup/health, and OpenAPI checks. Production migration/application deployment
remain separate actions.

## Managed testimonial company logos

- `PUT /testimonials/{testimonial_id}/company-logo`: multipart `file`; returns
  the unchanged `TestimonialAdminResponse` schema with the public company_logo_url
  (200). Missing testimonial is 404; missing file/invalid UUID/image is 422.
- `DELETE /testimonials/{testimonial_id}/company-logo`: clears company_logo_url
  and returns 204. An absent logo is an idempotent 204 without an audit mutation.
  Missing testimonial is 404.
- Both routes use the existing testimonial mutation authentication dependency:
  active normal admins and superadmins are allowed; missing/invalid/expired tokens,
  missing admin mappings, or inactive accounts return 401. Actor identity comes
  from the verified backend flow.
- Reuses SupabasePublicImageStorage and the application-lifetime Storage gateway.
  The public `testimonial-logos` bucket must already exist; no application bucket
  creation/configuration occurs. `STORAGE_TESTIMONIAL_LOGOS_BUCKET` defaults to
  `testimonial-logos` and only accepts that exact existing bucket name.
- JPEG (.jpg/.jpeg), PNG, and WebP are validated using the shared extension/MIME/
  image-signature checks. Bounded reads enforce 5 MiB (5,242,880 bytes), or the
  smaller configured STORAGE_IMAGE_MAX_BYTES limit. Stored paths are
  `{testimonial_id}/{sha256(content)}.{validated_extension}`; JPEG canonicalizes
  to .jpg. Client filenames cannot select object paths.
- Upload succeeds before the URL changes. The URL and existing update audit
  commit together, then the previous managed logo is deleted. Failed DB updates
  roll back and compensate the newly uploaded object. Identical stored URLs are
  excluded from cleanup/compensation to preserve the active content-addressed
  object; the shared provider continues to use non-upsert uploads.
- Delete commits the cleared URL and update audit before provider cleanup.
  Normal PATCH replacement/clearing and testimonial deletion also clean up the
  previous managed logo after commit; their request/response contracts remain
  unchanged. Cleanup only accepts this Supabase project's exact public bucket
  URL under the same testimonial ID. External/other-bucket/other-owner URLs are
  never deleted. Public GET still returns company_logo_url unchanged.
- Audit context uses changed_fields=[company_logo_url] and logo_operation
  upload/replace/delete, retaining the verified actor and safe activity/order
  context. No credentials or image bytes are copied into the audit record.
- Storage/configuration failures before commit use generic 503; persistence
  failures use generic 500. Post-commit cleanup and failed compensation are
  best-effort with safe warnings, following the existing image service pattern.
- No schema migration is needed for this extension. The existing Testimonials
  table migration is still a prerequisite wherever that table is absent. Live
  provider verification requires the existing privileged Storage configuration.
- Verification: 143 focused checks passed; the real disposable PostgreSQL
  lifecycle plus logo checks passed (45 tests in that run). Final default suite:
  989 passed, 28 opt-in DB checks skipped. Compile, startup/health, and protected
  multipart OpenAPI checks passed. Only the existing test-client deprecation
  warning remains; live provider upload/delete was not exercised.
