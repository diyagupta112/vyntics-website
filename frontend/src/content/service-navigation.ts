import type { NavigationChild } from "@/types/navigation";

export const serviceNavigation: readonly NavigationChild[] = [
  {
    label: "Cloud Foundations",
    href: "/services/cloud",
    headingOnly: true,
    description: "The secure, reliable cloud foundation behind every data and AI system.",
    children: [
      {
        label: "Cloud Architecture",
        href: "/services/cloud/architecture",
        description: "Design secure, scalable cloud environments aligned to your business needs.",
      },
      {
        label: "Cloud Migration",
        href: "/services/cloud/migration",
        description: "Move workloads to the cloud with controlled risk and minimal disruption.",
      },
      {
        label: "DevOps & Infrastructure",
        href: "/services/cloud/devops-infrastructure",
        description: "Automate delivery and build reliable, observable production infrastructure.",
      },
      {
        label: "Cloud Cost Optimization",
        href: "/services/cloud/cost-optimization",
        description: "Connect cloud spend to usage, ownership, and business value.",
      },
      {
        label: "Reliability & Monitoring",
        href: "/services/cloud/reliability-monitoring",
        description: "Keep production systems observable, resilient, and dependable.",
      },
    ],
  },
  {
    label: "Data Engineering",
    href: "/services/data",
    headingOnly: true,
    headingLink: true,
    description: "Trusted data pipelines, platforms, quality, and governance.",
    children: [
      {
        label: "Data Pipelines & Integration",
        href: "/services/data/data-pipelines-integration",
        description: "Move and connect data reliably across business systems.",
      },
      {
        label: "Data Warehousing & Lakehouse",
        href: "/services/data/data-warehousing-lakehouse",
        description: "Create a governed, query-ready home for analytical data.",
      },
      {
        label: "Data Quality & Governance",
        href: "/services/data/data-quality-governance",
        description: "Make definitions, ownership, access, and validation explicit.",
      },
    ],
  },
  {
    label: "Analytics & BI",
    href: "/services/analytics",
    headingOnly: true,
    description: "Decision-ready dashboards and reporting built on trusted metrics.",
    children: [
      {
        label: "Dashboards & Executive Reporting",
        href: "/services/analytics/dashboards-executive-reporting",
        description: "Focused KPI views and leadership reporting built for action.",
      },
      {
        label: "BI Consulting",
        href: "/services/analytics/bi-consulting",
        description: "Power BI, Tableau, and Amazon QuickSight strategy and delivery.",
      },
    ],
  },
  {
    label: "AI Solutions",
    href: "/services/ai",
    headingOnly: true,
    headingLink: true,
    description: "Grounded assistants, capable agents, and intelligent automation.",
    children: [
      {
        label: "RAG & Knowledge Assistants",
        href: "/services/ai/rag-knowledge-assistants",
        description: "Answers grounded in approved knowledge with verifiable sources.",
      },
      {
        label: "AI Agents",
        href: "/services/ai/ai-agents",
        description: "Goal-driven systems that use tools within defined controls.",
      },
      {
        label: "Intelligent Automation",
        href: "/services/ai/intelligent-automation",
        description: "Automate document and workflow tasks with human oversight.",
      },
    ],
  },
  {
    label: "CRM & Revenue Ops",
    href: "/services/crm",
    headingOnly: true,
    description: "Connected customer operations, sales automation, and revenue visibility.",
    children: [
      {
        label: "CRM Implementation & Integration",
        href: "/services/crm/crm-implementation-integration",
        description: "Configure the CRM and connect it to the systems around it.",
      },
      {
        label: "Sales Automation & Revenue Analytics",
        href: "/services/crm/sales-automation-revenue-analytics",
        description: "Automate sales operations and expose reliable revenue signals.",
      },
    ],
  },
];
