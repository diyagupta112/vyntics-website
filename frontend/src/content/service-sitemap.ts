export const serviceSitemap = [
  {
    "slug": "cloud-foundations",
    "name": "Cloud Foundations",
    "description": "Cloud architecture, delivery, cost, and reliability.",
    "base": "cloud",
    "services": [
      {
        "slug": "cloud-architecture-migration",
        "name": "Cloud Architecture & Migration",
        "description": "Target architecture and controlled workload migration.",
        "sources": [
          {
            "group": "cloud",
            "slug": "cloud-architecture"
          },
          {
            "group": "cloud",
            "slug": "cloud-migration"
          }
        ]
      },
      {
        "slug": "devops-reliability",
        "name": "DevOps & Reliability",
        "description": "Automated delivery, observability, and resilient operations.",
        "sources": [
          {
            "group": "cloud",
            "slug": "devops-infrastructure"
          },
          {
            "group": "cloud",
            "slug": "reliability-monitoring"
          }
        ]
      },
      {
        "slug": "cloud-cost-optimization",
        "name": "Cloud Cost Optimization",
        "description": "Cost visibility, right-sizing, and sustainable FinOps controls.",
        "sources": [
          {
            "group": "cloud",
            "slug": "cost-optimization"
          }
        ]
      }
    ]
  },
  {
    "slug": "data-engineering",
    "name": "Data Engineering",
    "description": "Reliable pipelines, integration, and trusted data.",
    "base": "data",
    "services": [
      {
        "slug": "data-pipelines-integration",
        "name": "Data Pipelines & Integration",
        "description": "Automated ingestion and dependable data movement.",
        "sources": [
          {
            "group": "data",
            "slug": "data-pipelines"
          },
          {
            "group": "data",
            "slug": "data-integration"
          },
          {
            "group": "data",
            "slug": "etl-elt"
          }
        ]
      },
      {
        "slug": "data-warehousing-lakehouse",
        "name": "Data Warehousing & Lakehouse",
        "description": "A governed analytical foundation for reporting and AI.",
        "sources": [
          {
            "group": "data",
            "slug": "data-warehousing"
          }
        ]
      },
      {
        "slug": "data-quality-governance",
        "name": "Data Quality & Governance",
        "description": "Definitions, ownership, validation, lineage, and access controls.",
        "sources": [
          {
            "group": "data",
            "slug": "data-quality"
          }
        ]
      }
    ]
  },
  {
    "slug": "analytics-bi",
    "name": "Analytics & BI",
    "description": "Dashboards and reporting built around business decisions.",
    "base": "data",
    "services": [
      {
        "slug": "dashboards-executive-reporting",
        "name": "Dashboards & Executive Reporting",
        "description": "Shared metrics and decision-ready views.",
        "sources": [
          {
            "group": "analytics",
            "slug": "kpi-dashboards"
          },
          {
            "group": "analytics",
            "slug": "executive-reporting"
          },
          {
            "group": "analytics",
            "slug": "power-bi"
          },
          {
            "group": "analytics",
            "slug": "tableau"
          },
          {
            "group": "analytics",
            "slug": "amazon-quicksight"
          }
        ]
      },
      {
        "slug": "bi-consulting",
        "name": "BI Consulting",
        "description": "BI strategy, platform design, governance, and adoption.",
        "sources": []
      }
    ]
  },
  {
    "slug": "ai-solutions",
    "name": "AI Solutions",
    "description": "AI assistants, agents, and automation grounded in your data.",
    "base": "ai",
    "services": [
      {
        "slug": "rag-knowledge-assistants",
        "name": "RAG & Knowledge Assistants",
        "description": "Answers grounded in approved content with verifiable sources.",
        "sources": [
          {
            "group": "ai",
            "slug": "rag-assistants"
          }
        ]
      },
      {
        "slug": "ai-agents",
        "name": "AI Agents",
        "description": "Connected tools and controlled workflow actions.",
        "sources": [
          {
            "group": "ai",
            "slug": "ai-agents"
          }
        ]
      },
      {
        "slug": "intelligent-automation",
        "name": "Intelligent Automation",
        "description": "Automate repeated steps with human oversight.",
        "sources": [
          {
            "group": "ai",
            "slug": "document-automation"
          },
          {
            "group": "ai",
            "slug": "workflow-automation"
          }
        ]
      }
    ]
  },
  {
    "slug": "crm-revenue-ops",
    "name": "CRM & Revenue Ops",
    "description": "CRM setup, integrations, sales automation, and reporting.",
    "base": "crm",
    "services": [
      {
        "slug": "crm-implementation-integration",
        "name": "CRM Implementation & Integration",
        "description": "Configure CRM processes and connect dependable customer data.",
        "sources": [
          {
            "group": "crm",
            "slug": "crm-implementation"
          },
          {
            "group": "crm",
            "slug": "crm-integrations"
          }
        ]
      },
      {
        "slug": "sales-automation-revenue-analytics",
        "name": "Sales Automation & Revenue Analytics",
        "description": "Automate sales workflows and measure pipeline and revenue performance.",
        "sources": [
          {
            "group": "crm",
            "slug": "sales-automation"
          },
          {
            "group": "crm",
            "slug": "crm-analytics"
          }
        ]
      }
    ]
  }
] as const;
