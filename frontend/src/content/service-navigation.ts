import type { NavigationChild } from "@/types/navigation";
import { serviceSitemap } from "./service-sitemap";

// All destinations are implemented canonical routes in the existing service architecture.
export const serviceNavigation: readonly NavigationChild[] = serviceSitemap.map(pillar => ({
  label: pillar.name,
  href: `/services/${pillar.slug}`,
  headingOnly: true,
  headingLink: true,
  description: pillar.description,
  children: pillar.services.map(service => ({
    label: service.name,
    href: `/services/${pillar.slug}/${service.slug}`,
    description: service.description,
  })),
}));
