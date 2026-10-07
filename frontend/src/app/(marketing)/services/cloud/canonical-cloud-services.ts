import { cloudServices, type CloudService } from "./cloud-services";
export type CanonicalCloudService = Omit<CloudService, "slug" | "nextSlug"> & { slug: string; nextSlug: string };
function merge(slug: string, title: string, number: string, nextSlug: string, sources: readonly CloudService[]): CanonicalCloudService {
  return { ...sources[0], slug, title, number, nextSlug,
    problems: [...new Set(sources.flatMap(item => item.problems))],
    help: [...new Set(sources.flatMap(item => item.help))],
    workAreas: sources.flatMap(item => item.workAreas),
    technologies: [...new Set(sources.flatMap(item => item.technologies))],
  };
}
export const canonicalCloudServices = [
  merge("cloud-architecture-migration", "Cloud Architecture & Migration", "01", "devops-reliability", [cloudServices.architecture, cloudServices.migration]),
  merge("devops-reliability", "DevOps & Reliability", "02", "cloud-cost-optimization", [cloudServices["devops-infrastructure"], cloudServices["reliability-monitoring"]]),
  merge("cloud-cost-optimization", "Cloud Cost Optimization", "03", "cloud-architecture-migration", [cloudServices["cost-optimization"]]),
];
