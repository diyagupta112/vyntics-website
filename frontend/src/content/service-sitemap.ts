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
        "description": "Systems designed for scale and operational simplicity.",
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
        "description": "Repeatable environments and automated deployments.",
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
        "description": "Cost visibility and practical right-sizing.",
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
        "description": "A shared foundation for analytics and reporting.",
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
        "description": "Consistent metrics, refresh checks, and validation.",
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
        "description": "Dashboards and reporting built around business decisions.",
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
        "description": "Configure a CRM around your sales and service process.",
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
        "description": "Track pipeline health, conversion, and customer activity.",
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
