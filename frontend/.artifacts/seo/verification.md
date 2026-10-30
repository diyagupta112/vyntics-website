# Sitemap and robots verification

Update: the hourly behavior described in this original report has been replaced
with explicit trigger-based revalidation. See `frontend/docs/sitemap-trigger.md`.
The updated production build and targeted lint passed. A production HTTP test
confirmed that ordinary requests retain cached content, unauthorized triggers
return 401, and an authorized trigger fetches fresh data from all three sources
on the next sitemap request. The publishing-system connection remains a TODO.

Implemented in `frontend` on October 28, 2026. No changes to apps/admin, apps/api, supabase, or shared packages.

## Results

| Check | Result |
| --- | --- |
| Production build | Passed, including Next.js TypeScript validation |
| Separate typecheck | `npx tsc --noEmit --incremental false` passed |
| Metadata lint | `npx eslint next.config.ts src/lib/site.ts src/lib/sitemap-routes.ts src/app/sitemap.ts src/app/robots.ts` passed |
| Wider source lint | `npm run lint -- src next.config.ts` returned 6 existing errors and 6 warnings, listed below |
| Default production HTTP endpoints | Both returned HTTP 200; XML parsed successfully; 29 public URLs |
| Domain and exclusions | All sitemap origins matched SITE_URL; no admin/api URLs; robots Sitemap line matched |
| Priorities | Home 1.0, every other entry 0.8 |
| Domain switch | Built and served with NEXT_PUBLIC_SITE_URL=https://example.com; every sitemap origin and robots Sitemap line switched; route paths stayed identical |
| Restoration | Rebuilt without the temporary override; fetched both endpoints and confirmed the original fallback domain |
| Revalidation | Build route output reports sitemap.xml revalidation as 1h; API fetches also use revalidate: 3600 |
| Focused behavior checks | Passed automatic page additions, route groups, private folders, parallel slots, redirects, inline and inherited noindex, published slugs, real updated_at when supplied, omitted missing dates, draft exclusion, API failure, malformed response fallback, and shared robots exclusions |

The initial unscoped lint command was interrupted because it scanned old browser profiles in `.qa`. The source-scoped result above covers the application and Next configuration.

## Captured outputs

- [Restored sitemap.xml](./sitemap.xml)
- [Restored robots.txt](./robots.txt)
- [example.com sitemap.xml](./sitemap-example.xml)
- [example.com robots.txt](./robots-example.txt)

These are verification captures under `.artifacts`, not public static files. The only served implementations are `src/app/sitemap.ts` and `src/app/robots.ts`.

## Content limitation

The public `/blogs`, `/case-studies`, and `/careers` API contracts do not expose updated_at. The sitemap uses that real field whenever supplied and otherwise omits lastModified. A TODO in sitemap.ts records the required API field. No publication time or build time is substituted. No API or database files were changed.

The captured production sitemap contains local page URLs. Published-content inclusion and failure behavior were also checked with isolated mocked API responses; those fixtures are not website content. The one-hour interval was checked in configuration and build output, without waiting an hour.

## Every source/configuration file changed

All paths below are relative to frontend.

| File | Change |
| --- | --- |
| `.env.example` | Document the website URL override and existing public content API configuration |
| `src/lib/site.ts` | Sole fallback origin, trailing-slash removal, shared private-path rules |
| `src/app/layout.tsx` | Use SITE_URL for metadataBase |
| `src/content/articles.ts` | Use SITE_URL for existing article links |
| `src/content/cloud-sub-services/seo.ts` | Use SITE_URL for service metadata and structured data |
| `src/app/(marketing)/case-studies/page.tsx` | Use SITE_URL for canonical URL and breadcrumbs |
| `src/app/(marketing)/privacy-policy/page.tsx` | Use SITE_URL for canonical and Open Graph URLs |
| `src/app/(marketing)/recognitions/page.tsx` | Use SITE_URL for canonical URLs, organization identity, and breadcrumbs |
| `src/app/(marketing)/services/analytics-bi/page.tsx` | Use SITE_URL for the canonical URL |
| `src/app/(marketing)/services/crm-revenue-ops/crm-revenue-ops-content.ts` | Use SITE_URL for the canonical URL |
| `src/app/(marketing)/services/data/[slug]/page.tsx` | Use SITE_URL for dynamic canonical URLs |
| `src/app/(marketing)/services/data/page.tsx` | Use SITE_URL for the canonical URL |
| `src/app/(marketing)/terms-and-conditions/page.tsx` | Use SITE_URL for canonical and Open Graph URLs |
| `next.config.ts` | Discover routes at build time and embed their inventory for runtime revalidation |
| `src/lib/sitemap-routes.ts` | Discover page files, remove URL route-group segments, skip private and parallel folders, identify redirects and noindex metadata, and record dynamic templates separately from static URLs |
| `src/app/sitemap.ts` | Replace the manual hardcoded sitemap with automatic static discovery, canonical service content, public API slugs, priorities, hourly refresh, timestamp handling, and failure fallback |
| `src/app/robots.ts` | Generate robots with the shared domain and identical private-path exclusions |

Five local verification artifacts were also created: this report and the four output captures linked above. They are left uncommitted. The pre-existing homepage hero edit was excluded from these commits.

## Commits

- `525eedb` Centralize public website origin and crawl exclusions
- `c9ec3e5` Generate sitemap from discovered routes and published content
- `73058fc` Generate robots from shared website configuration

## Existing wider lint issues

Errors:

- `src/app/(marketing)/services/ai-solutions/intelligent-automation/use-case-explorer.tsx:27`: no-html-link-for-pages
- `src/app/(marketing)/services/analytics-bi/bi-consulting/bi-tool-comparison.tsx:38`: no-html-link-for-pages
- `src/app/(marketing)/services/analytics-bi/dashboards-executive-reporting/dashboards-by-team.tsx:25`: no-html-link-for-pages
- `src/app/(marketing)/services/crm-revenue-ops/crm-implementation-integration/crm-platform-comparison.tsx:38`: no-html-link-for-pages
- `src/components/legal/legal-toc.tsx:31`: react-hooks/set-state-in-effect
- `src/components/service-sub/rag-architecture-diagram.tsx:78`: react-hooks/immutability

Warnings:

- `src/components/layout/site-footer.tsx:92`: unused eslint-disable directive
- `src/components/sections/home/testimonials.tsx:79`: react-hooks/exhaustive-deps
- `src/components/sections/recognitions/recognitions-hero.tsx:1`: unused ShinyButton
- `src/components/service-sub/agent-flow.tsx:4`: unused Fragment
- `src/components/service-sub/automation-flow.tsx:140`: unused height
- `src/components/service-sub/crm-integration.tsx:54`: unused hub

Reference: [Next.js sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap), [robots convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots).
