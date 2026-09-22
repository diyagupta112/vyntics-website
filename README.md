# Vyntics Website

Professional company website workspace for the public site, admin panel, backend/API code, Supabase database assets, shared packages, tests, scripts, and documentation.

## Repository Layout

```text
vyntics-website/
  apps/
    web/              Public marketing/company website
    admin/            Internal admin panel
    api/              Backend/API services when needed
  packages/
    ui/               Shared design system components
    config/           Shared configuration and environment helpers
    database/         Supabase clients, queries, and database helpers
    types/            Shared TypeScript/domain types
    utils/            Shared utility functions
  supabase/
    migrations/       Database migrations
    functions/        Supabase Edge Functions
  tests/
    unit/             Unit tests
    integration/      Integration tests
    e2e/              End-to-end tests
  docs/               Project documentation and team conventions
  scripts/            Automation scripts for development and deployment
```

## Getting Started

1. Enable Corepack and install the package manager:

   ```bash
   corepack enable
   corepack prepare pnpm@9.12.0 --activate
   ```

2. Copy `.env.example` to `.env.local` and fill in project-specific values.
3. Choose and install the web framework for `apps/web` and `apps/admin` before writing product code.
4. Keep reusable code in `packages/*` instead of duplicating it across apps.

## Development Standards

- Keep public website code inside `apps/web`.
- Keep authenticated/admin-only code inside `apps/admin`.
- Keep database schema changes in `supabase/migrations`.
- Keep Supabase access logic in `packages/database`.
- Keep shared UI in `packages/ui`.
- Keep shared business/domain types in `packages/types`.
- Document major architecture decisions in `docs/`.

## Recommended Next Decisions

- Frontend framework: Next.js is a strong default for a company website plus admin panel.
- UI system: Tailwind CSS plus a small internal component library works well.
- Auth/database: Supabase Auth, Postgres, Row Level Security, and migrations.
- Hosting: Vercel for web/admin and Supabase for database/functions is a common, professional setup.
