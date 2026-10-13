import targets from "../../../packages/types/src/related-services.json" with { type: "json" };

export type RelatedService = keyof typeof targets;
export type ServiceIdentifier = Exclude<RelatedService, "all">;

export function serviceContentPath(path: "/blogs" | "/case-studies", service?: ServiceIdentifier) {
  return service ? `${path}?related_service=${encodeURIComponent(service)}` : path;
}
