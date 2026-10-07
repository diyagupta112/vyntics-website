export const legacyServiceRoutes: Readonly<Record<string, string>> = {
  "/services/cloud": "/services/cloud-foundations",
  "/services/data": "/services/data-engineering",
  "/services/crm": "/services/crm-revenue-ops",
  "/services/cloud/cloud-architecture": "/services/cloud-foundations/cloud-architecture-migration",
  "/services/cloud/cloud-migration": "/services/cloud-foundations/cloud-architecture-migration",
  "/services/cloud/devops-infrastructure": "/services/cloud-foundations/devops-reliability",
  "/services/cloud/reliability-monitoring": "/services/cloud-foundations/devops-reliability",
  "/services/cloud/cost-optimization": "/services/cloud-foundations/cloud-cost-optimization",
  "/services/data/data-pipelines": "/services/data-engineering/data-pipelines-integration",
  "/services/data/data-integration": "/services/data-engineering/data-pipelines-integration",
  "/services/data/etl-elt": "/services/data-engineering/data-pipelines-integration",
  "/services/data/data-warehousing": "/services/data-engineering/data-warehousing-lakehouse",
  "/services/data/data-quality": "/services/data-engineering/data-quality-governance",
  "/services/analytics/kpi-dashboards": "/services/analytics-bi/dashboards-executive-reporting",
  "/services/analytics/executive-reporting": "/services/analytics-bi/dashboards-executive-reporting",
  "/services/analytics/power-bi": "/services/analytics-bi/dashboards-executive-reporting",
  "/services/analytics/tableau": "/services/analytics-bi/dashboards-executive-reporting",
  "/services/analytics/amazon-quicksight": "/services/analytics-bi/dashboards-executive-reporting",
  "/services/ai/rag-assistants": "/services/ai-solutions/rag-knowledge-assistants",
  "/services/ai/ai-agents": "/services/ai-solutions/ai-agents",
  "/services/ai/document-automation": "/services/ai-solutions/intelligent-automation",
  "/services/ai/workflow-automation": "/services/ai-solutions/intelligent-automation",
  "/services/crm/crm-implementation": "/services/crm-revenue-ops/crm-implementation-integration",
  "/services/crm/crm-integrations": "/services/crm-revenue-ops/crm-implementation-integration",
  "/services/crm/sales-automation": "/services/crm-revenue-ops/sales-automation-revenue-analytics",
  "/services/crm/crm-analytics": "/services/crm-revenue-ops/sales-automation-revenue-analytics",
  "/services/cloud/architecture": "/services/cloud-foundations/cloud-architecture-migration",
  "/services/cloud/migration": "/services/cloud-foundations/cloud-architecture-migration",
  "/services/ai": "/services/ai-solutions",
  "/services/analytics": "/services/analytics-bi"
};

export function canonicalServiceHref(href: string) {
  if (href === "/services/data#offering-4") return "/services/analytics-bi";
  const [path, hash] = href.split("#");
  return (legacyServiceRoutes[path] ?? path) + (hash ? `#${hash}` : "");
}
