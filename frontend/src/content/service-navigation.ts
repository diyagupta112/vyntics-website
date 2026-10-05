import type { NavigationChild } from "@/types/navigation";

export const serviceNavigation: readonly NavigationChild[] = [
  { label: "Custom AI Solutions", href: "/services/ai/rag-assistants", headingOnly: true, description: "AI assistants, agents, and automation grounded in your data.", children: [
    { label: "RAG Assistants", href: "/services/ai/rag-assistants", description: "Answers grounded in approved content with verifiable sources." },
    { label: "AI Agents", href: "/services/ai/ai-agents", description: "Connected tools and controlled workflow actions." },
    { label: "Document Automation", href: "/services/ai/document-automation", description: "Document processing and review workflows." },
    { label: "Workflow Automation", href: "/services/ai/workflow-automation", description: "Automate repeated steps with human oversight." },
    { label: "LLM Integrations", href: "/services/ai/llm-integrations", description: "Connect language models to existing business tools." },
  ] },
  { label: "Data Engineering", href: "/services/data", headingOnly: true, description: "Reliable pipelines, transformations, and trusted data.", children: [
    { label: "Data Pipelines", href: "/services/data/data-pipelines", description: "Automated ingestion and dependable data movement." },
    { label: "ETL & ELT", href: "/services/data/etl-elt", description: "Transform source data into usable models." },
    { label: "Data Warehousing", href: "/services/data/data-warehousing", description: "A shared foundation for analytics and reporting." },
    { label: "Data Integration", href: "/services/data/data-integration", description: "Connect APIs, databases, and business systems." },
    { label: "Data Quality", href: "/services/data/data-quality", description: "Consistent metrics, refresh checks, and validation." },
  ] },
  { label: "Analytics & BI", href: "/services/data#offering-4", headingOnly: true, description: "Dashboards and reporting built around business decisions.", children: [
    { label: "Power BI", href: "/services/analytics/power-bi", description: "Reporting and interactive business dashboards." },
    { label: "Tableau", href: "/services/analytics/tableau", description: "Visual analytics for exploring business data." },
    { label: "Amazon QuickSight", href: "/services/analytics/amazon-quicksight", description: "Cloud analytics and shared reporting." },
    { label: "KPI Dashboards", href: "/services/analytics/kpi-dashboards", description: "Shared metrics and decision-ready views." },
    { label: "Executive Reporting", href: "/services/analytics/executive-reporting", description: "Clear performance summaries for leadership." },
  ] },
  { label: "CRM", href: "/services/crm", headingOnly: true, description: "CRM setup, automation, integrations, and reporting.", children: [
    { label: "CRM Implementation", href: "/services/crm/crm-implementation", description: "Configure a CRM around your sales and service process." },
    { label: "Sales Automation", href: "/services/crm/sales-automation", description: "Automate lead routing, follow-ups, and pipeline updates." },
    { label: "CRM Integrations", href: "/services/crm/crm-integrations", description: "Connect CRM data with business systems and APIs." },
    { label: "CRM Analytics", href: "/services/crm/crm-analytics", description: "Track pipeline health, conversion, and customer activity." },
  ] },
  { label: "Cloud Solutions", href: "/services/cloud", headingOnly: true, description: "Cloud architecture, delivery, cost, and reliability.", children: [
    { label: "Cloud Architecture", href: "/services/cloud/cloud-architecture", description: "Systems designed for scale and operational simplicity." },
    { label: "Cloud Migration", href: "/services/cloud/cloud-migration", description: "Planned transitions with controlled risk." },
    { label: "Cost Optimization", href: "/services/cloud/cost-optimization", description: "Cost visibility and practical right-sizing." },
    { label: "DevOps & Infrastructure", href: "/services/cloud/devops-infrastructure", description: "Repeatable environments and automated deployments." },
    { label: "Reliability Monitoring", href: "/services/cloud/reliability-monitoring", description: "Observe production services and improve reliability." },
  ] },
];
