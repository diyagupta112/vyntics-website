import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/rewards", destination: "/recognition", permanent: true },
      { source: "/services/cloud", destination: "/#services", permanent: true },
      { source: "/services/analytics", destination: "/#services", permanent: true },
      { source: "/services/crm", destination: "/#services", permanent: true },
      { source: "/services/other", destination: "/#services", permanent: true },
      { source: "/services/ai/rag-assistants", destination: "/services/ai/rag-knowledge-assistants", permanent: true },
      { source: "/services/ai/document-automation", destination: "/services/ai/intelligent-automation", permanent: true },
      { source: "/services/ai/workflow-automation", destination: "/services/ai/intelligent-automation", permanent: true },
      { source: "/services/ai/llm-integrations", destination: "/services/ai/intelligent-automation", permanent: true },
      { source: "/services/data/data-pipelines", destination: "/services/data/data-pipelines-integration", permanent: true },
      { source: "/services/data/data-integration", destination: "/services/data/data-pipelines-integration", permanent: true },
      { source: "/services/data/etl-elt", destination: "/services/data/data-pipelines-integration", permanent: true },
      { source: "/services/data/data-warehousing", destination: "/services/data/data-warehousing-lakehouse", permanent: true },
      { source: "/services/data/data-quality", destination: "/services/data/data-quality-governance", permanent: true },
      { source: "/services/analytics/power-bi", destination: "/services/analytics/bi-consulting", permanent: true },
      { source: "/services/analytics/tableau", destination: "/services/analytics/bi-consulting", permanent: true },
      { source: "/services/analytics/amazon-quicksight", destination: "/services/analytics/bi-consulting", permanent: true },
      { source: "/services/analytics/kpi-dashboards", destination: "/services/analytics/dashboards-executive-reporting", permanent: true },
      { source: "/services/analytics/executive-reporting", destination: "/services/analytics/dashboards-executive-reporting", permanent: true },
      { source: "/services/crm/crm-implementation", destination: "/services/crm/crm-implementation-integration", permanent: true },
      { source: "/services/crm/crm-integrations", destination: "/services/crm/crm-implementation-integration", permanent: true },
      { source: "/services/crm/sales-automation", destination: "/services/crm/sales-automation-revenue-analytics", permanent: true },
      { source: "/services/crm/crm-analytics", destination: "/services/crm/sales-automation-revenue-analytics", permanent: true },
      { source: "/services/cloud/cloud-architecture", destination: "/services/cloud/cloud-architecture-migration", permanent: true },
      { source: "/services/cloud/cloud-migration", destination: "/services/cloud/cloud-architecture-migration", permanent: true },
      { source: "/services/cloud/devops-infrastructure", destination: "/services/cloud/devops-reliability", permanent: true },
      { source: "/services/cloud/reliability-monitoring", destination: "/services/cloud/devops-reliability", permanent: true },
      { source: "/services/cloud/cost-optimization", destination: "/services/cloud/cloud-cost-optimisation", permanent: true },
    ];
  },
};

export default nextConfig;
