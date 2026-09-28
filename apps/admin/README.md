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
