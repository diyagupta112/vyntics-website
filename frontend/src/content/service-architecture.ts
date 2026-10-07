import { aiServices } from "./ai-services";
import { dataServices } from "./data-services";
import { serviceSitemap } from "./service-sitemap";
import { getPlatformService, type PlatformServiceGroup } from "./platform-services";
import { services, type ServiceContent } from "./services";
import type { InnerServiceDetailContent } from "@/components/pages/inner-service-detail";

export type ServicePillar = { slug: string; name: string; content: ServiceContent; services: readonly InnerServiceDetailContent[] };

function combine(name: string, slug: string, pillar: string, sources: readonly InnerServiceDetailContent[]): InnerServiceDetailContent {
  const first = sources[0];
  return { ...first, name, slug, eyebrow: `${pillar} · ${name}`,
    title: sources.length > 1 ? name : first.title,
    contactEyebrow: `${name} consultation`, contactTitle: `Let's make ${name} work for your business.`,
    contactIntroduction: undefined,
    deliverables: [...new Map(sources.flatMap(item => item.deliverables).map(item => [item.title, item])).values()],
    technologies: [...new Set(sources.flatMap(item => item.technologies))],
    technologyDetails: [...new Map(sources.flatMap(item => item.technologyDetails ?? []).map(item => [item.name, item])).values()],
    processTitle: first.processTitle ? `How we build your ${name}.` : undefined,
    technologyTitle: undefined, technologyIntroduction: undefined,
  };
}

function sourceContent(group: string, slug: string): InnerServiceDetailContent {
  if (group === "ai") return aiServices[slug as keyof typeof aiServices];
  if (group === "data") return dataServices[slug as keyof typeof dataServices];
  const content = getPlatformService(group as PlatformServiceGroup, slug);
  if (!content) throw new Error(`Missing service source: ${group}/${slug}`);
  return content;
}

export const servicePillars: readonly ServicePillar[] = serviceSitemap.map(pillar => {
  const children = pillar.services.map(service => {
    const sources = service.sources.map(source => sourceContent(source.group, source.slug));
    // No legacy consulting page exists: reuse the existing BI approach and data foundations.
    if (!sources.length) sources.push({ ...sourceContent("analytics", "executive-reporting"), title: service.name,
      introduction: services.data.promise, promise: services.data.promise, promiseDetail: services.data.introduction });
    return combine(service.name, service.slug, pillar.name, sources);
  });
  const base = services[pillar.base];
  return { slug: pillar.slug, name: pillar.name, services: children, content: {
    ...base, slug: pillar.slug, eyebrow: pillar.name,
    title: pillar.slug === "analytics-bi" ? pillar.name : base.title,
    offerings: children.map(item => ({ title: item.name, description: item.introduction, href: `/services/${pillar.slug}/${item.slug}` })),
  } };
});

export function getServicePillar(slug: string) { return servicePillars.find(pillar => pillar.slug === slug); }
