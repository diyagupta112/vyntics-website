# Vyntics Admin Panel

The Admin Panel is a separate Next.js application for internal Vyntics
workflows. It uses the App Router, strict TypeScript, self-hosted DM Sans, and a
feature-oriented source layout.

## Current routes

- `/` enters the protected application flow through `/dashboard`.
- `/login` supports real Supabase Google OAuth and email/password sign-in.
- `/auth/callback` exchanges the Supabase OAuth authorization code and verifies
  Admin Panel access with FastAPI.
- `/dashboard` is protected by the Supabase session and FastAPI admin
  authorization. It contains no fake metrics or backend feature data.

## Local configuration

Copy `.env.example` to an ignored `.env.local` and provide the browser-safe
Supabase URL, anon/publishable key, and FastAPI base URL. Browser configuration
must never contain Supabase service-role/server credentials.

## Commands

Run commands from the repository root:

```text
corepack pnpm --dir apps/admin dev
corepack pnpm --dir apps/admin test
corepack pnpm --dir apps/admin typecheck
corepack pnpm --dir apps/admin lint
corepack pnpm --dir apps/admin build
corepack pnpm --dir apps/admin start
```


## Blog and Case Study editorial fields

New Blog and Case Study forms generate slugs from titles using one shared utility.
Editing the slug opts out of automatic updates. Existing records keep their API
slugs when titles change; slug uniqueness remains a backend check.

Both forms use the shared Related Service select: No Related Service (null), one
of the five services, or All Services (`all`). Values are loaded from the API and
included in POST/PATCH; the existing content-then-cover create flow is unchanged.
The updated backend requires migration `20261013090000_content_related_service.sql`
before deployment. Labels/identifiers are shared with the public frontend through
`packages/types/src/related-services.json`.


## Testimonials and FAQs

Manage customer quotes at `/testimonials` and page-specific questions at `/faqs`.
Both sections use the existing authenticated API client, protected layout, shared
forms/dialogs, and plain-array Admin list contracts. FAQ page labels and keys are
configured once in `src/features/faqs/lib/page-options.ts`; page filtering is sent
to the backend. Backend-returned future page keys remain editable.

The existing backend migration `20261013120000_create_faqs_and_testimonials.sql`
must be applied separately before live use. This frontend implementation does not
change database/backend/public-site code. See [implementation and file manifest](docs/testimonials-faqs.md).
