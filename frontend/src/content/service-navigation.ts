import type { NavigationChild } from "@/types/navigation";
import { serviceSitemap } from "./service-sitemap";

export const serviceNavigation: readonly NavigationChild[] = serviceSitemap.map(pillar => ({
  label: pillar.name, href: `/services/${pillar.slug}`, description: pillar.description,
  children: pillar.services.map(service => ({ label: service.name, href: `/services/${pillar.slug}/${service.slug}`, description: service.description })),
}));
