# Trigger sitemap updates

The sitemap has no scheduled refresh. It is generated at build time and remains
cached until invalidated by this trigger or a redeploy. After a trigger, the next
request to `/sitemap.xml` regenerates it and fetches fresh public content.

Set the server-only `SITEMAP_REVALIDATION_SECRET` environment variable to a long,
random secret. Call `POST /api/revalidate-sitemap` on the website with the header
`Authorization: Bearer <secret>`. Missing or incorrect credentials are rejected.
Do not expose the secret in browser code or prefix it with `NEXT_PUBLIC_`.

TODO: Configure the content publishing system to call this endpoint after a
successful publish, update, unpublish, or delete. The publishing system is outside
the authorized frontend scope; this change does not connect its events.

New page files are discovered on the next build. The trigger refreshes content
URLs using the existing page inventory; it cannot deploy new source files.

Verified with a production build and isolated content API: repeated sitemap
requests retained the cached version after the source changed, unauthorized
triggers returned 401, and an authorized trigger caused the next request to
fetch updated content from all three sources. Targeted lint also passed.
