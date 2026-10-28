import { ServicesHero } from "@/components/pages/services-hero";
import { crmContent as content } from "./crm-revenue-ops-content";

export function CrmHero() {
  const lines = content.hero.heading.match(/^(Make your CRM) (work the way) (your team does\.)$/)?.slice(1);
  return <ServicesHero
    service="crm-revenue-ops" headingId="crm-title"
    eyebrow={content.hero.eyebrow} title={content.hero.heading} titleLines={lines}
    description={content.hero.introduction}
    primaryAction={{ href: "/contact-us", label: content.hero.primaryLabel }}
    secondaryAction={{ href: "#crm-services", label: content.hero.secondaryLabel }}
    capabilities={content.services.map(service => ({ label: service.name, href: service.href }))}
  />;
}
