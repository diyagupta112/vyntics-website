import type { InnerServiceDetailContent } from "@/components/pages/inner-service-detail";

export type PlatformServiceGroup = "analytics" | "crm" | "cloud";

type ServiceDefinition = Omit<InnerServiceDetailContent, "process" | "metadataDescription"> & {
  process?: InnerServiceDetailContent["process"];
  group: PlatformServiceGroup;
};

const approaches: Record<PlatformServiceGroup, InnerServiceDetailContent["process"]> = {
  analytics: [
    { title: "Define the decisions", description: "Identify the questions, audiences, KPIs, and actions the reporting experience must support." },
    { title: "Audit the data", description: "Check source quality, ownership, refresh timing, definitions, security, and gaps before designing visuals." },
    { title: "Build and reconcile", description: "Create the model and reports, then reconcile every important measure against trusted source results." },
    { title: "Release and improve", description: "Enable users, measure adoption, monitor refreshes, and refine the experience from real usage." },
  ],
  crm: [
    { title: "Map the customer journey", description: "Document stages, handoffs, owners, exceptions, and the information each team needs to act." },
    { title: "Design the CRM model", description: "Define records, fields, permissions, workflows, and governance around the agreed operating process." },
    { title: "Configure and connect", description: "Build the system, migrate clean data, integrate essential tools, and test complete customer journeys." },
    { title: "Launch and optimize", description: "Train users, monitor adoption and data quality, and improve automation from operating evidence." },
  ],
  cloud: [
    { title: "Assess the workload", description: "Understand architecture, traffic, dependencies, risk, cost, security, and operational ownership." },
    { title: "Design the target state", description: "Choose services and patterns that meet the real reliability, scale, compliance, and budget constraints." },
    { title: "Automate and validate", description: "Implement repeatable infrastructure and delivery controls, then test recovery and failure scenarios." },
    { title: "Operate and improve", description: "Measure reliability, performance, and spend in production and refine the system from evidence." },
  ],
};

function defineService(definition: ServiceDefinition): InnerServiceDetailContent {
  const { group, ...service } = definition;
  return { ...service, process: service.process ?? approaches[group], metadataDescription: service.introduction };
}

export const platformServices = {
  analytics: {
    "power-bi": defineService({
      "group": "analytics",
      "slug": "power-bi",
      "name": "Power BI",
      "eyebrow": "ANALYTICS & BI · POWER BI",
      "title": "Turn your data into trusted decisions with Power BI.",
      "introduction": "Most companies are swimming in data but starving for clarity. We build Power BI solutions that replace fragmented spreadsheets with clean, reliable insights your entire team can actually agree on.",
      "aboutEyebrow": "ABOUT THE SERVICE",
      "promise": "A single source of truth, powered by Power BI.",
      "promiseDetail": "Beautiful charts mean nothing if the underlying numbers are wrong. We clean up your data logic and build Power BI setups designed around the actual decisions you need to make every day.",
      "deliverables": [
            {
                  "title": "Unified business models",
                  "description": "We organize your data so department heads are finally looking at the same metrics, ending the debate over whose spreadsheet is right."
            },
            {
                  "title": "Clear, fast dashboards",
                  "description": "Custom Power BI report views built for how you work—letting you spot trends, drill into details, and answer questions in seconds."
            },
            {
                  "title": "Role-based access control",
                  "description": "Keep sensitive financial or performance data secure by showing people only what they need to see based on their role."
            },
            {
                  "title": "Automated updates",
                  "description": "No more manual exports or broken formulas. Your Power BI reports refresh automatically so you're always looking at current information."
            }
      ],
      "processEyebrow": "OUR APPROACH",
      "processTitle": "How we build your Power BI solution.",
      "processIntroduction": "A clear, collaborative path from messy spreadsheets to a dashboard your team will actually use.",
      "process": [
            {
                  "title": "Discover your goals",
                  "description": "We sit down with your team to understand the key questions you need answered and how Power BI can best support your decisions."
            },
            {
                  "title": "Clean and structure the data",
                  "description": "We audit your existing sources, fix hidden calculation errors, and build the solid data foundation Power BI needs to perform."
            },
            {
                  "title": "Build and test",
                  "description": "We design the Power BI views and test every calculation to ensure the numbers are fast, accurate, and easy to read."
            },
            {
                  "title": "Launch and train",
                  "description": "We roll out the dashboards, set up automatic updates, and walk your team through how to use Power BI daily without friction."
            }
      ],
      "technologyEyebrow": "TOOLS & TECHNOLOGIES",
      "technologyTitle": "The technology behind your Power BI setup.",
      "technologyIntroduction": "We work with the systems you already use, ensuring your reporting layer fits smoothly into your existing tech stack without unnecessary complexity.",
      "technologies": [
            "Power BI",
            "DAX & Power Query",
            "Microsoft Fabric",
            "Azure SQL",
            "Snowflake",
            "Data Gateways"
      ],
      "technologyDetails": [
            {
                  "name": "Power BI",
                  "role": "",
                  "description": "The core reporting platform that turns shared metrics into clear, interactive business views."
            },
            {
                  "name": "DAX & Power Query",
                  "role": "",
                  "description": "The calculation and cleanup engines that ensure your numbers are accurate behind the scenes."
            },
            {
                  "name": "Microsoft Fabric",
                  "role": "",
                  "description": "A unified data platform that brings all your company’s storage and reporting together in one place."
            },
            {
                  "name": "Azure SQL",
                  "role": "",
                  "description": "Secure cloud databases that keep your business data organized, safe, and ready to query."
            },
            {
                  "name": "Snowflake",
                  "role": "",
                  "description": "High-performance data warehousing built to handle massive amounts of company information smoothly."
            },
            {
                  "name": "Data Gateways",
                  "role": "",
                  "description": "A secure bridge that connects your internal spreadsheets or legacy software to the cloud workspace."
            }
      ],
      "contactEyebrow": "POWER BI CONSULTATION",
      "contactTitle": "Let's make Power BI work for your business.",
      "contactIntroduction": "Tell us about your current reporting bottlenecks or spreadsheets. Our data team will review where you're stuck and show you a practical way forward with Power BI."
}),
    tableau: defineService({
      "group": "analytics",
      "slug": "tableau",
      "name": "Tableau",
      "eyebrow": "ANALYTICS & BI · TABLEAU",
      "title": "Turn complex data into clear visuals with Tableau.",
      "introduction": "When your team needs deep visual exploration and interactive data storytelling, Tableau makes it happen. We build clean, responsive Tableau dashboards that help your organization spot trends, share insights, and act faster.",
      "aboutEyebrow": "ABOUT THE SERVICE",
      "promise": "Visual analytics built for how your team explores data with Tableau.",
      "promiseDetail": "A great dashboard shouldn't require a data science degree to use. We design intuitive Tableau environments that make complex datasets easy to navigate, filter, and understand.",
      "deliverables": [
            {
                  "title": "Interactive workbooks",
                  "description": "Custom views and filters built in Tableau so your team can slice, dice, and investigate performance metrics on their own."
            },
            {
                  "title": "Seamless data blending",
                  "description": "We connect and merge multiple business sources into a single Tableau view without losing performance or accuracy."
            },
            {
                  "title": "Secure workbook governance",
                  "description": "Clean permission structures and folder organizations ensuring the right people access the right reports."
            },
            {
                  "title": "Embedded analytics",
                  "description": "Integrate Tableau dashboards directly into your internal tools, web apps, or client portals for a unified workflow."
            }
      ],
      "processEyebrow": "OUR APPROACH",
      "processTitle": "How we build your Tableau solution.",
      "processIntroduction": "A structured, practical path from raw metrics to clear visual clarity.",
      "process": [
            {
                  "title": "Understand your use case",
                  "description": "We align with your team on what visual stories need to be told and who will be interacting with Tableau."
            },
            {
                  "title": "Connect and prepare data",
                  "description": "We hook up your databases or cloud storage, ensuring the data feeding Tableau is clean and dependable."
            },
            {
                  "title": "Design and test dashboards",
                  "description": "We build clean visual layouts, optimize calculations, and test responsiveness across teams."
            },
            {
                  "title": "Publish and empower",
                  "description": "We publish to Tableau Cloud or Server, set up permissions, and train your users to get the most out of it."
            }
      ],
      "technologyEyebrow": "TOOLS & TECHNOLOGIES",
      "technologyTitle": "The technology behind your Tableau ecosystem.",
      "technologyIntroduction": "We integrate Tableau smoothly with your data sources, cloud storage, and deployment workflows.",
      "technologies": [
            "Tableau Desktop & Prep",
            "Tableau Cloud / Server",
            "Snowflake & BigQuery",
            "PostgreSQL & MySQL",
            "AWS & Azure"
      ],
      "technologyDetails": [
            {
                  "name": "Tableau Desktop & Prep",
                  "role": "",
                  "description": "The core design and data-shaping tools for building responsive workbooks."
            },
            {
                  "name": "Tableau Cloud / Server",
                  "role": "",
                  "description": "Secure hosting and sharing platforms for automated workspace management."
            },
            {
                  "name": "Snowflake & BigQuery",
                  "role": "",
                  "description": "High-performance cloud data platforms powering fast, large-scale visual queries."
            },
            {
                  "name": "PostgreSQL & MySQL",
                  "role": "",
                  "description": "Reliable relational databases storing core business records and user data."
            },
            {
                  "name": "AWS & Azure",
                  "role": "",
                  "description": "Cloud infrastructure ensuring dependable uptime, security, and scalable performance."
            }
      ],
      "contactEyebrow": "TABLEAU CONSULTATION",
      "contactTitle": "Let's bring your data to life with Tableau.",
      "contactIntroduction": "Tell us what you want to visualize or explore. Our team will review your current data setup and show you how Tableau can make it actionable."
}),
    "amazon-quicksight": defineService({
      "group": "analytics",
      "slug": "amazon-quicksight",
      "name": "Amazon QuickSight",
      "eyebrow": "ANALYTICS & BI · AMAZON QUICKSIGHT",
      "title": "Scale your cloud analytics effortlessly with Amazon QuickSight.",
      "introduction": "If your data already lives in the cloud, your reporting should too. We build fast, cost-effective dashboards using Amazon QuickSight that integrate natively with your tech stack without heavy server maintenance.",
      "aboutEyebrow": "ABOUT THE SERVICE",
      "promise": "Fast cloud dashboards powered by Amazon QuickSight.",
      "promiseDetail": "Built for the cloud from day one, QuickSight lets your team explore data without slow servers or bloated license fees. We configure and design QuickSight environments tailored to your exact workflow.",
      "deliverables": [
            {
                  "title": "Native cloud integration",
                  "description": "Direct, high-speed connections to your cloud storage, databases, data lakes, and warehousing environments."
            },
            {
                  "title": "Flexible, cost-effective pricing",
                  "description": "Smart scaling options where you only pay for what your team actually uses, eliminating rigid software license waste."
            },
            {
                  "title": "Embedded analytics",
                  "description": "Seamlessly embed secure Amazon QuickSight dashboards right into your internal tools, web apps, or client portals."
            },
            {
                  "title": "High-speed calculation engine",
                  "description": "Lightning-fast filtering and data retrieval powered by advanced in-memory calculation layers."
            }
      ],
      "processEyebrow": "OUR APPROACH",
      "processTitle": "How we build your Amazon QuickSight solution.",
      "processIntroduction": "A straightforward path to cloud-native reporting that keeps your data secure, fast, and easy to maintain.",
      "process": [
            {
                  "title": "Scope your cloud data",
                  "description": "We identify your active data sources, user roles, and core business reporting requirements."
            },
            {
                  "title": "Connect and configure memory",
                  "description": "We establish secure access permissions, connect your data pipelines, and optimize performance settings."
            },
            {
                  "title": "Design and test dashboards",
                  "description": "We build clean, responsive visual layouts and verify calculations with your team."
            },
            {
                  "title": "Launch and scale",
                  "description": "We deploy dashboards, configure user access controls, and hand over a fully operational cloud workspace."
            }
      ],
      "technologyEyebrow": "TOOLS & TECHNOLOGIES",
      "technologyTitle": "The cloud ecosystem behind Amazon QuickSight.",
      "technologyIntroduction": "We integrate QuickSight smoothly with your cloud infrastructure for maximum security, speed, and reliability.",
      "technologies": [
            "Amazon QuickSight",
            "SPICE Engine",
            "Cloud Data Warehouses",
            "Serverless Query Services",
            "Security & Access Controls"
      ],
      "technologyDetails": [
            {
                  "name": "Amazon QuickSight",
                  "role": "",
                  "description": "The core cloud-native BI platform for fast dashboards and embedded reporting."
            },
            {
                  "name": "SPICE Engine",
                  "role": "",
                  "description": "High-performance in-memory calculation layer designed for ultra-fast data retrieval."
            },
            {
                  "name": "Cloud Data Warehouses",
                  "role": "",
                  "description": "Scalable storage and analytical backends built for high-throughput enterprise workloads."
            },
            {
                  "name": "Serverless Query Services",
                  "role": "",
                  "description": "Tools to analyze large datasets directly in storage using standard SQL."
            },
            {
                  "name": "Security & Access Controls",
                  "role": "",
                  "description": "Enterprise-grade encryption, role-based permissions, and private network connectivity."
            }
      ],
      "contactEyebrow": "AMAZON QUICKSIGHT CONSULTATION",
      "contactTitle": "Let's make Amazon QuickSight work for your business.",
      "contactIntroduction": "Tell us about your current cloud stack and reporting goals. Our team will show you how QuickSight can make your data faster and easier to manage."
}),
    "kpi-dashboards": defineService({
      "group": "analytics",
      "slug": "kpi-dashboards",
      "name": "KPI Dashboards",
      "eyebrow": "ANALYTICS & BI \u00b7 KPI DASHBOARDS",
      "title": "Focus on what matters with clear KPI Dashboards.",
      "introduction": "When you are tracking everything, you are tracking nothing. We build focused KPI dashboards that cut through the noise and give leadership a crystal-clear view of core business health.",
      "aboutEyebrow": "ABOUT THE SERVICE",
      "promise": "Real-time clarity, powered by KPI Dashboards.",
      "promiseDetail": "Stop digging through weekly status reports or messy spreadsheets to find out how the business is performing. We design clean KPI dashboards that track your most critical metrics in one place.",
      "processEyebrow": "OUR APPROACH",
      "processTitle": "How we build your KPI Dashboards.",
      "processIntroduction": "A straightforward path from scattered data points to a single source of operational truth.",
      "technologyEyebrow": "TOOLS & TECHNOLOGIES",
      "technologyTitle": "The technology behind your KPI Dashboards.",
      "technologyIntroduction": "We leverage modern reporting platforms and database engines to keep your performance scorecards fast, secure, and reliable.",
      "contactEyebrow": "KPI DASHBOARDS CONSULTATION",
      "contactTitle": "Let's make KPI Dashboards work for your business.",
      "contactIntroduction": "Tell us about the metrics you track today. Our team will review your reporting setup and show you how to build a clearer view of performance.",
      "deliverables": [
        {
          "title": "Core metric alignment",
          "description": "We help you identify and track the exact numbers that drive growth, profitability, and operational efficiency."
        },
        {
          "title": "Real-time tracking",
          "description": "Live updates replace manual reporting so you can spot issues and opportunities the moment they happen."
        },
        {
          "title": "Department-specific views",
          "description": "Tailored scorecards for sales, marketing, finance, and operations that keep every team aligned and accountable."
        },
        {
          "title": "Alert and anomaly monitoring",
          "description": "Automated notifications when key metrics drift off target, allowing you to fix problems before they escalate."
        }
      ],
      "process": [
        {
          "title": "Identify true priorities",
          "description": "We work with your leadership team to define the handful of metrics that actually matter for your next stage of growth."
        },
        {
          "title": "Map data sources",
          "description": "We connect your core software and databases to ensure your performance indicators pull clean, live data automatically."
        },
        {
          "title": "Design and test dashboards",
          "description": "We build clean visual scorecards and test them with your team to ensure they drive fast, confident decisions."
        },
        {
          "title": "Launch and monitor",
          "description": "We deploy your dashboards, set up performance alerts, and establish a reliable rhythm for tracking success."
        }
      ],
      "technologies": [
        "Power BI & Tableau",
        "SQL & Cloud Databases",
        "Automated Data Pipelines",
        "Custom Web Dashboards"
      ],
      "technologyDetails": [
        {
          "name": "Power BI & Tableau",
          "role": "",
          "description": "Leading visualization platforms used to build clear, interactive performance scorecards."
        },
        {
          "name": "SQL & Cloud Databases",
          "role": "",
          "description": "Reliable storage and fast query engines backing your real-time business metrics."
        },
        {
          "name": "Automated Data Pipelines",
          "role": "",
          "description": "Background connectors that keep your KPIs updated without any manual data entry."
        },
        {
          "name": "Custom Web Dashboards",
          "role": "",
          "description": "Tailored reporting interfaces built specifically for unique operational tracking needs."
        }
      ]
    }),
    "executive-reporting": defineService({
      group: "analytics", slug: "executive-reporting", name: "Executive Reporting", eyebrow: "Analytics & BI · Executive reporting",
      title: "Executive reporting built around decisions, not data volume.",
      introduction: "We create concise leadership reporting that connects strategic goals, operating performance, financial context, and material exceptions.",
      promise: "Give leaders a reliable view of what changed, why it matters, and where action is required.",
      promiseDetail: "Executive reports fail when they become a collage of departmental charts. We establish a clear information hierarchy, reconcile the measures, and build a repeatable reporting cycle with accountable commentary.",
      deliverables: [
        { title: "Leadership scorecards", description: "A focused view of strategic measures, targets, variance, trends, and accountable owners." },
        { title: "Narrative reporting", description: "Structured commentary and exception context that explains material movement behind the numbers." },
        { title: "Reporting operations", description: "Repeatable refresh, review, approval, distribution, and archive workflows for each reporting cycle." },
      ],
      technologies: ["Power BI", "Tableau", "Microsoft Fabric", "Excel", "PowerPoint", "SQL", "Snowflake", "SharePoint"],
    }),
  },
  crm: {
    "crm-implementation": defineService({
      group: "crm", slug: "crm-implementation", name: "CRM Implementation", eyebrow: "CRM · Implementation",
      title: "A CRM configured around how your team actually works.",
      introduction: "We design and implement CRM foundations for sales and service teams, including data structure, stages, permissions, workflows, migration, and adoption.",
      promise: "Launch a CRM that supports the process instead of creating more administration.",
      promiseDetail: "A successful CRM implementation is an operating-design project, not a collection of fields. We align stakeholders on the customer journey, remove unnecessary complexity, and configure the platform around clear ownership.",
      deliverables: [
        { title: "Process & data design", description: "Lifecycle stages, record structure, required data, ownership rules, permissions, and governance." },
        { title: "Platform configuration", description: "Pipelines, layouts, views, validation, workflows, templates, and role-specific experiences." },
        { title: "Migration & adoption", description: "Clean migration, testing, documentation, training, and launch support focused on real user tasks." },
      ],
      technologies: ["Salesforce", "HubSpot", "Microsoft Dynamics 365", "Zoho CRM", "SQL", "REST APIs", "Power Automate"],
    }),
    "sales-automation": defineService({
      group: "crm", slug: "sales-automation", name: "Sales Automation", eyebrow: "CRM · Sales automation",
      title: "Automate sales follow-through without automating judgment.",
      introduction: "We automate routing, reminders, stage updates, approvals, communication, and handoffs so sales teams spend less time maintaining the system.",
      promise: "Reduce repetitive CRM work while keeping ownership and exceptions visible.",
      promiseDetail: "Good sales automation makes the agreed process easier to follow. We use deterministic rules for routine work, preserve human control for judgment, and design recovery paths for incomplete data and failed actions.",
      deliverables: [
        { title: "Lead management", description: "Scoring, assignment, deduplication, response timers, and follow-up tasks aligned to territory and capacity." },
        { title: "Pipeline workflows", description: "Stage requirements, approvals, reminders, activity capture, and next-step automation across opportunities." },
        { title: "Handoffs & exceptions", description: "Controlled transitions across marketing, sales, onboarding, and service with visible exception ownership." },
      ],
      technologies: ["Salesforce Flow", "HubSpot Workflows", "Dynamics 365", "Power Automate", "Zapier", "n8n", "REST APIs"],
    }),
    "crm-integrations": defineService({
      group: "crm", slug: "crm-integrations", name: "CRM Integrations", eyebrow: "CRM · Integrations",
      title: "Keep customer context connected across your systems.",
      introduction: "We connect CRMs with websites, marketing tools, support platforms, finance systems, data warehouses, and internal applications.",
      promise: "Make customer data move reliably without fragile manual exports or duplicate entry.",
      promiseDetail: "CRM integrations need clear system ownership, field mapping, identity rules, retries, and auditability. We design the data contract and failure handling before connecting endpoints.",
      deliverables: [
        { title: "Integration architecture", description: "Source-of-truth decisions, event flows, APIs, field mappings, identity matching, and sync frequency." },
        { title: "Reliable synchronization", description: "Validated one-way or bidirectional movement with retries, idempotency, logging, and alerts." },
        { title: "Operational visibility", description: "Monitoring, reconciliation, error queues, replay controls, and documentation for ongoing ownership." },
      ],
      technologies: ["REST APIs", "GraphQL", "Webhooks", "MuleSoft", "Zapier", "n8n", "Azure Logic Apps", "AWS Lambda"],
    }),
    "crm-analytics": defineService({
      group: "crm", slug: "crm-analytics", name: "CRM Analytics", eyebrow: "CRM · Analytics",
      title: "See pipeline health without guessing at the CRM data.",
      introduction: "We build CRM reporting for conversion, velocity, activity, forecasting, retention, and customer health with definitions teams can trust.",
      promise: "Turn CRM activity into an honest view of commercial performance.",
      promiseDetail: "CRM dashboards become misleading when stages are inconsistent, dates are overwritten, or activity is incomplete. We repair the measurement model and expose data-quality gaps alongside performance.",
      deliverables: [
        { title: "Pipeline metrics", description: "Conversion, velocity, aging, coverage, win rate, loss reasons, and performance by segment or owner." },
        { title: "Forecasting views", description: "Transparent forecast categories, movement tracking, risk signals, and scenario views for leadership." },
        { title: "Customer analytics", description: "Lifecycle, retention, expansion, engagement, and service signals connected across relevant systems." },
      ],
      technologies: ["Salesforce CRM Analytics", "HubSpot Reporting", "Power BI", "Tableau", "Microsoft Fabric", "SQL", "dbt"],
    }),
  },
  cloud: {
    "cloud-architecture": defineService({
      group: "cloud", slug: "cloud-architecture", name: "Cloud Architecture", eyebrow: "Cloud solutions · Architecture",
      title: "Cloud architecture sized for the work you actually run.",
      introduction: "We design secure, observable cloud systems that balance reliability, performance, scale, operating effort, and cost.",
      promise: "Create a target architecture your team can understand, build, and operate.",
      promiseDetail: "Architecture is a set of tradeoffs, not a provider diagram. We tie service choices to workload behavior, failure tolerance, security boundaries, team capability, and budget before implementation begins.",
      deliverables: [
        { title: "Target architecture", description: "Service boundaries, data flows, network design, environments, dependencies, and documented decisions." },
        { title: "Security & reliability", description: "Identity, secrets, encryption, backups, recovery objectives, observability, and failure isolation." },
        { title: "Delivery roadmap", description: "Sequenced implementation work, risks, estimates, validation gates, and clear ownership." },
      ],
      technologies: ["AWS", "Microsoft Azure", "Google Cloud", "Terraform", "Kubernetes", "Docker", "PostgreSQL", "Cloudflare"],
    }),
    "cloud-migration": defineService({
      group: "cloud", slug: "cloud-migration", name: "Cloud Migration", eyebrow: "Cloud solutions · Migration",
      title: "Move workloads with controlled risk and a clear recovery path.",
      introduction: "We plan and execute application, database, and infrastructure migrations with tested cutovers, rollback plans, and operational handover.",
      promise: "Reach the target environment without treating production as the test plan.",
      promiseDetail: "Migration risk comes from hidden dependencies, incompatible assumptions, data movement, and weak rollback planning. We discover those constraints early and rehearse the transition before the final cutover.",
      deliverables: [
        { title: "Discovery & wave plan", description: "Inventory, dependencies, migration patterns, sequencing, downtime constraints, risks, and owners." },
        { title: "Migration execution", description: "Target environments, data transfer, application changes, testing, cutover, and rollback controls." },
        { title: "Operational handover", description: "Monitoring, runbooks, access, backups, cost baselines, documentation, and team enablement." },
      ],
      technologies: ["AWS Migration Hub", "Azure Migrate", "Google Cloud Migration Center", "Terraform", "Docker", "PostgreSQL", "Kubernetes"],
    }),
    "cost-optimization": defineService({
      group: "cloud", slug: "cost-optimization", name: "Cloud Cost Optimization", eyebrow: "Cloud solutions · Cost optimization",
      title: "Reduce cloud waste without weakening the workload.",
      introduction: "We connect cloud spend to services, usage, ownership, and business value, then implement practical changes with measurable savings.",
      promise: "Make cloud cost understandable and controllable—not a surprise at month end.",
      promiseDetail: "Cost optimization is continuous engineering, not a one-time discount exercise. We combine allocation, rightsizing, architecture changes, commitments, and operating guardrails without trading away reliability.",
      deliverables: [
        { title: "Cost baseline", description: "Allocation by service, environment, team, and workload with trends, anomalies, and unit-cost measures." },
        { title: "Optimization backlog", description: "Prioritized rightsizing, scheduling, storage, data-transfer, architecture, and commitment opportunities." },
        { title: "FinOps controls", description: "Budgets, alerts, tagging, ownership, review cadence, dashboards, and policies that keep savings in place." },
      ],
      technologies: ["AWS Cost Explorer", "Azure Cost Management", "Google Cloud Billing", "FinOps", "Terraform", "Kubecost", "Grafana"],
    }),
    "devops-infrastructure": defineService({
      group: "cloud", slug: "devops-infrastructure", name: "DevOps & Infrastructure", eyebrow: "Cloud solutions · DevOps",
      title: "Repeatable infrastructure and safer software delivery.",
      introduction: "We build infrastructure as code, delivery pipelines, environment controls, and platform foundations that reduce manual production risk.",
      promise: "Make changes repeatable, reviewable, and recoverable across every environment.",
      promiseDetail: "DevOps is not a toolchain installed around an unstable process. We standardize how infrastructure and applications move from change to production, with testing, approvals, visibility, and rollback built in.",
      deliverables: [
        { title: "Infrastructure as code", description: "Versioned modules, environment patterns, state controls, review workflows, and automated validation." },
        { title: "CI/CD pipelines", description: "Build, test, security checks, deployment strategies, approvals, release evidence, and rollback paths." },
        { title: "Platform operations", description: "Secrets, configuration, observability, access, runbooks, and reusable developer workflows." },
      ],
      technologies: ["Terraform", "GitHub Actions", "GitLab CI", "Azure DevOps", "Docker", "Kubernetes", "Helm", "Argo CD"],
    }),
    "reliability-monitoring": defineService({
      group: "cloud", slug: "reliability-monitoring", name: "Reliability Monitoring", eyebrow: "Cloud solutions · Reliability",
      title: "Know what is failing before your customers explain it.",
      introduction: "We implement metrics, logs, traces, service objectives, alerting, and incident practices that make production behavior visible and actionable.",
      promise: "Turn raw telemetry into faster detection, diagnosis, and recovery.",
      promiseDetail: "More dashboards do not automatically create reliability. We start with critical user journeys and failure modes, then connect meaningful signals to ownership, response procedures, and improvement work.",
      deliverables: [
        { title: "Observability foundation", description: "Consistent metrics, structured logs, distributed traces, correlation, retention, and service dashboards." },
        { title: "Actionable alerting", description: "Symptoms tied to user impact, sensible thresholds, routing, escalation, and reduced alert noise." },
        { title: "Reliability practice", description: "Service objectives, runbooks, incident review, capacity signals, and recurring improvement priorities." },
      ],
      technologies: ["OpenTelemetry", "Grafana", "Prometheus", "Datadog", "Azure Monitor", "Amazon CloudWatch", "Google Cloud Operations"],
    }),
  },
} as const;

export function getPlatformService(group: PlatformServiceGroup, slug: string): InnerServiceDetailContent | undefined {
  const services = platformServices[group] as Record<string, InnerServiceDetailContent>;
  return services[slug];
}

export function getPlatformServiceSlugs(group: PlatformServiceGroup) {
  return Object.keys(platformServices[group]);
}
