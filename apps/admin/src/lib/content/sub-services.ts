import type { RelatedService } from "./related-services";

/**
 * Sub-service targeting options. The backend accepts any lowercase snake_case key, so this list
 * is a frontend convenience only. Entries mirror the public website's sub-service routes
 * (`/services/<service>/<sub-service>`), with the hyphenated route slug written as snake_case.
 * Replace this list with a dynamic source when one exists.
 */
export const subServiceOptions: ReadonlyArray<{ value: string; label: string; service: RelatedService }> = [
  { value: "cloud_architecture_migration", label: "Cloud Architecture & Migration", service: "cloud_foundations" },
  { value: "cloud_cost_optimization", label: "Cloud Cost Optimization", service: "cloud_foundations" },
  { value: "devops_reliability", label: "DevOps & Reliability", service: "cloud_foundations" },
  { value: "data_pipelines_integration", label: "Data Pipelines & Integration", service: "data_engineering" },
  { value: "data_quality_governance", label: "Data Quality & Governance", service: "data_engineering" },
  { value: "data_warehousing_lakehouse", label: "Data Warehousing & Lakehouse", service: "data_engineering" },
  { value: "bi_consulting", label: "BI Consulting", service: "analytics_bi" },
  { value: "dashboards_executive_reporting", label: "Dashboards & Executive Reporting", service: "analytics_bi" },
  { value: "ai_agents", label: "AI Agents", service: "ai_solutions" },
  { value: "intelligent_automation", label: "Intelligent Automation", service: "ai_solutions" },
  { value: "rag_knowledge_assistants", label: "RAG & Knowledge Assistants", service: "ai_solutions" },
  { value: "crm_implementation_integration", label: "CRM Implementation & Integration", service: "crm_revenue_ops" },
  { value: "sales_automation_revenue_analytics", label: "Sales Automation & Revenue Analytics", service: "crm_revenue_ops" },
];

/** Known label, or a readable form of an unknown key so existing values are never hidden. */
export function subServiceLabel(value: string) {
  const known = subServiceOptions.find((option) => option.value === value)?.label;
  return known ?? value.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
