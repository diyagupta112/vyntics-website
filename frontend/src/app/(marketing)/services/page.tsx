import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/service-page";
import { services } from "@/content/services";
import { servicePillars } from "@/content/service-architecture";
export const metadata: Metadata = { title: "Services" };
export default function Page() { return <ServicePage service={{ ...services.cloud, slug: "services", eyebrow: "Services", title: "Services", introduction: "Explore our services across cloud foundations, data engineering, analytics and BI, AI solutions, and CRM and revenue operations.", promise: "Explore the capability your business needs.", outcomes: [...new Set(servicePillars.flatMap(pillar => pillar.content.outcomes))], technologies: [...new Set(servicePillars.flatMap(pillar => pillar.content.technologies))], offerings: servicePillars.map(pillar => ({ title: pillar.name, description: pillar.content.introduction, href: `/services/${pillar.slug}` })) }} />; }
