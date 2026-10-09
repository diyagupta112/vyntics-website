import type { MetadataRoute } from "next";
import { serviceSitemap } from "@/content/service-sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/about", "/services", "/case-studies", "/blog", "/careers", "/team", "/technologies", "/recognitions",
    ...serviceSitemap.flatMap(pillar => [`/services/${pillar.slug}`, ...pillar.services.map(service => `/services/${pillar.slug}/${service.slug}`)]),
  ];
  return paths.map(path => ({ url: `https://vyntics.com${path}` }));
}
