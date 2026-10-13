import targets from "../../../packages/types/src/related-services.json" with { type: "json" };

export type RelatedService = keyof typeof targets;
export type ServiceIdentifier = Exclude<RelatedService, "all">;

/** Service sections accept only explicitly assigned or global published records. */
export function getItemsForService<T extends { id: string; slug: string; related_service?: string | null }>(items: readonly T[], service: ServiceIdentifier): T[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  return items.filter(item => {
    // `all` is the current shared/backend value; tolerate the explicit global alias.
    if (item.related_service !== service && item.related_service !== "all" && item.related_service !== "all_services") return false;
    if (seenIds.has(item.id) || seenSlugs.has(item.slug)) return false;
    seenIds.add(item.id);
    seenSlugs.add(item.slug);
    return true;
  });
}

export function serviceContentPath(path: "/blogs" | "/case-studies", service?: ServiceIdentifier) {
  return service ? `${path}?related_service=${encodeURIComponent(service)}` : path;
}
