import type { NavigationChild } from "@/types/navigation";

export const serviceNavigation: readonly NavigationChild[] = [
  { label: "Custom AI Solutions", href: "/services/ai", description: "AI assistants, agents, and automation grounded in your data.", children: [
    { label: "RAG Assistants", href: "/services/ai#rag-title", description: "Answers grounded in approved content with verifiable sources." },
    { label: "AI Agents", href: "/services/ai#agents-title", description: "Connected tools and controlled workflow actions." },
    { label: "Document Automation", href: "/services/ai#agents-title", description: "Document processing and review workflows." },
    { label: "Workflow Automation", href: "/services/ai#agents-title", description: "Automate repeated steps with human oversight." },
    { label: "LLM Integrations", href: "/services/ai#agents-title", description: "Connect language models to existing business tools." },
  ] },
  { label: "Data Engineering", href: "/services/data", description: "Reliable pipelines, transformations, and trusted data.", children: [
    { label: "Data Pipelines", href: "/services/data#offering-1", description: "Automated ingestion and dependable data movement." },
    { label: "ETL & ELT", href: "/services/data#offering-1", description: "Transform source data into usable models." },
    { label: "Data Warehousing", href: "/services/data#offering-2", description: "A shared foundation for analytics and reporting." },
    { label: "Data Integration", href: "/services/data#offering-3", description: "Connect APIs, databases, and business systems." },
    { label: "Data Quality", href: "/services/data#data-outcomes", description: "Consistent metrics, refresh checks, and validation." },
  ] },
  { label: "Analytics & BI", href: "/services/data#offering-4", description: "Dashboards and reporting built around business decisions.", children: [
    { label: "Power BI", href: "/services/data#data-technology", description: "Reporting and interactive business dashboards." },
    { label: "Tableau", href: "/services/data#data-technology", description: "Visual analytics for exploring business data." },
    { label: "Amazon QuickSight", href: "/services/data#data-technology", description: "Cloud analytics and shared reporting." },
    { label: "KPI Dashboards", href: "/services/data#offering-4", description: "Shared metrics and decision-ready views." },
    { label: "Executive Reporting", href: "/services/data#offering-4", description: "Clear performance summaries for leadership." },
  ] },
  { label: "Cloud Solutions", href: "/services/cloud", description: "Cloud architecture, delivery, cost, and reliability.", children: [
    { label: "Cloud Architecture", href: "/services/cloud#offering-1", description: "Systems designed for scale and operational simplicity." },
    { label: "Cloud Migration", href: "/services/cloud#offering-2", description: "Planned transitions with controlled risk." },
    { label: "Cost Optimization", href: "/services/cloud#offering-4", description: "Cost visibility and practical right-sizing." },
    { label: "DevOps & Infrastructure", href: "/services/cloud#offering-3", description: "Repeatable environments and automated deployments." },
    { label: "Reliability Monitoring", href: "/services/cloud#offering-4", description: "Observe production services and improve reliability." },
  ] },
];
