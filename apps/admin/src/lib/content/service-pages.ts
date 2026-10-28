import targets from "../../../../../packages/types/src/related-services.json";
import type { RelatedService } from "./related-services";

export type SubPageConfig = { name: string; key: string };
export type ServicePageConfig = { service: RelatedService; name: string; page: string; subPages: readonly SubPageConfig[] };

/**
 * Single source of truth for the known Service and Sub-service pages. Service names and page paths
 * come from the shared related-services JSON. Sub-page keys are the public site's route slugs
 * (`/services/<service>/<sub-page>`). To add a page, add one entry here; FAQs, Blogs and Case
 * Studies all derive their options from this list. The backend accepts any valid key, so this is
 * an editorial list and not a validation list.
 */
const subPagesByService: Record<RelatedService, readonly SubPageConfig[]> = {
  cloud_foundations: [
    { name: "Cloud Architecture & Migration", key: "cloud-architecture-migration" },
    { name: "Cloud Cost Optimization", key: "cloud-cost-optimization" },
    { name: "DevOps & Reliability", key: "devops-reliability" },
  ],
  data_engineering: [
    { name: "Data Pipelines & Integration", key: "data-pipelines-integration" },
    { name: "Data Quality & Governance", key: "data-quality-governance" },
    { name: "Data Warehousing & Lakehouse", key: "data-warehousing-lakehouse" },
  ],
  analytics_bi: [
    { name: "BI Consulting", key: "bi-consulting" },
    { name: "Dashboards & Executive Reporting", key: "dashboards-executive-reporting" },
  ],
  ai_solutions: [
    { name: "AI Agents", key: "ai-agents" },
    { name: "Intelligent Automation", key: "intelligent-automation" },
    { name: "RAG & Knowledge Assistants", key: "rag-knowledge-assistants" },
  ],
  crm_revenue_ops: [
    { name: "CRM Implementation & Integration", key: "crm-implementation-integration" },
    { name: "Sales Automation & Revenue Analytics", key: "sales-automation-revenue-analytics" },
  ],
};

export const servicePages: readonly ServicePageConfig[] = (Object.keys(subPagesByService) as RelatedService[]).map((service) => ({
  service,
  name: targets[service].label,
  page: `services/${targets[service].slug}`,
  subPages: subPagesByService[service],
}));
