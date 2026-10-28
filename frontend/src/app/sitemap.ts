import type { MetadataRoute } from "next";
import { serviceSitemap } from "@/content/service-sitemap";
import { SITE_URL, isPrivatePath } from "@/lib/site";
import type { SitemapPage } from "@/lib/sitemap-routes";

// Cached until the protected revalidation endpoint is triggered or a redeploy.
export const revalidate = false;

type PublicItem = { slug: string; updated_at?: string; status?: string; noindex?: boolean };

async function getPublishedItems(endpoint: string): Promise<PublicItem[]> {
  const base = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
  const response = await fetch(`${base}/${endpoint}`, {
    cache: "force-cache",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Sitemap content unavailable: ${endpoint}`);
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("data" in payload) || !Array.isArray(payload.data)) {
    throw new Error(`Invalid sitemap content: ${endpoint}`);
  }
  return payload.data.filter((item): item is PublicItem => (
    item !== null && typeof item === "object" && typeof item.slug === "string" &&
    item.slug.length > 0 && !/[\s/\\?#]/.test(item.slug) && item.slug !== "." && item.slug !== ".." &&
    (item.status === undefined || item.status === "published") && item.noindex !== true
  ));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: SitemapPage[] = JSON.parse(process.env.SITEMAP_PAGES ?? "[]");
  const indexable = new Set(pages.filter((page) => !page.noindex).map((page) => page.path));
  const paths = new Map<string, MetadataRoute.Sitemap[number]>();
  function add(path: string, updatedAt?: string) {
    if (isPrivatePath(path) || pages.some((page) => page.path === path && page.noindex)) return;
    paths.set(path, {
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      priority: path === "/" ? 1.0 : 0.8,
      ...(typeof updatedAt === "string" && Number.isFinite(Date.parse(updatedAt)) ? { lastModified: new Date(updatedAt) } : {}),
    });
  }
  for (const path of indexable) if (!path.includes("[")) add(path);

  // Local service definitions are the source for canonical dynamic services.
  for (const pillar of serviceSitemap) {
    if (!indexable.has(`/services/${pillar.slug}/[slug]`)) continue;
    for (const service of pillar.services) {
      const path = `/services/${pillar.slug}/${service.slug}`;
      add(path);
    }
  }

  try {
    const sources = [
      { endpoint: "blogs", route: "/blog" },
      { endpoint: "case-studies", route: "/case-studies" },
      { endpoint: "careers", route: "/careers" },
    ].filter(({ route }) => indexable.has(`${route}/[slug]`));
    const content = await Promise.all(sources.map(async ({ endpoint, route }) => ({
      route, items: await getPublishedItems(endpoint),
    })));
    for (const { route, items } of content) {
      for (const item of items) {
        // TODO: Public blogs, case-studies, and careers API responses must expose
        // their real updated_at. Until then, omit lastModified rather than invent it.
        add(`${route}/${encodeURIComponent(item.slug)}`, item.updated_at);
      }
    }
  } catch {
    // An unavailable content API must never break the sitemap or the build.
  }
  return [...paths.values()].sort((a, b) => a.url.localeCompare(b.url));
}
