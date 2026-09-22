# Vyntics website

Company website frontend built with Next.js, React, and TypeScript.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```text
public/
  icons/                  Static icons
  images/                 Static images
src/
  app/                    Routes, layouts, metadata, and global styles
    (marketing)/          Public company pages (the group is not in the URL)
  components/
    layout/               Shared header, footer, and page-shell components
    sections/             Page sections grouped by page or feature
    ui/                   Small reusable interface primitives
  config/                 Site-wide navigation and configuration
  hooks/                  Reusable client-side React hooks
  lib/                    Framework-independent helpers
  services/               API clients and external service integrations
  types/                  Shared TypeScript types
```

Keep page-specific components close to their page. Move a component into
`components` only when it is reused or represents a meaningful page section.

## Commands

```bash
npm run dev      # local development
npm run lint     # lint the codebase
npm run build    # production build and type check
npm run start    # run the production build
```
