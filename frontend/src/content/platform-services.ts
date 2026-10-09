import type { InnerServiceDetailContent } from "@/components/pages/inner-service-detail";

export type PlatformServiceGroup = "cloud" | "data" | "analytics" | "ai" | "crm";

type ServiceDefinition = Omit<InnerServiceDetailContent, "process" | "metadataDescription"> & {
  group: PlatformServiceGroup;
};

const approaches: Record<PlatformServiceGroup, InnerServiceDetailContent["process"]> = {
  cloud: [
    { title: "Assess the workload", description: "Understand architecture, dependencies, risk, cost, security, and operational ownership." },
    { title: "Design the target state", description: "Choose patterns that meet the real reliability, scale, compliance, and budget constraints." },
    { title: "Automate and validate", description: "Implement repeatable infrastructure and delivery controls, then test recovery and failure scenarios." },
    { title: "Operate and improve", description: "Measure reliability, performance, and spend in production and refine from evidence." },
  ],
  data: [
    { title: "Map sources and decisions", description: "Identify systems, owners, consumers, freshness needs, definitions, and failure impact." },
    { title: "Design the data product", description: "Define contracts, models, quality rules, lineage, access, and operating responsibilities." },
    { title: "Build and reconcile", description: "Implement incrementally and validate outputs against trusted source totals and business rules." },
    { title: "Monitor and evolve", description: "Track freshness, failures, quality, cost, and usage as sources and requirements change." },
  ],
  analytics: [
    { title: "Define the decisions", description: "Identify the questions, audiences, KPIs, and actions the reporting experience must support." },
    { title: "Audit the data", description: "Check quality, ownership, timing, definitions, security, and gaps before designing visuals." },
    { title: "Build and reconcile", description: "Create the model and reports, then reconcile every important measure against trusted results." },
    { title: "Release and improve", description: "Enable users, monitor refreshes and adoption, and refine the experience from real usage." },
  ],
  ai: [
    { title: "Define the job", description: "Choose a valuable workflow, its users, boundaries, source knowledge, and measurable success criteria." },
    { title: "Design the controls", description: "Set access, grounding, evaluation, tool permissions, escalation, and human review requirements." },
    { title: "Build and evaluate", description: "Implement the smallest useful system and test it against representative and adversarial cases." },
    { title: "Release and learn", description: "Monitor quality, cost, latency, failures, and user feedback before expanding capability." },
  ],
  crm: [
    { title: "Map the customer journey", description: "Document stages, handoffs, owners, exceptions, and the information each team needs." },
    { title: "Design the operating model", description: "Define records, fields, permissions, workflows, measures, and governance around the process." },
    { title: "Configure and connect", description: "Build the system, migrate clean data, integrate essential tools, and test complete journeys." },
    { title: "Launch and optimize", description: "Train users, monitor adoption and data quality, and improve automation from evidence." },
  ],
};

function defineService(definition: ServiceDefinition): InnerServiceDetailContent {
  const { group, ...service } = definition;
  return { ...service, process: approaches[group], metadataDescription: service.introduction };
}

export const platformServices = {
  cloud: {
    "cloud-architecture-migration": defineService({
      group: "cloud", slug: "cloud-architecture-migration", name: "Cloud Architecture & Migration", eyebrow: "Cloud foundations · Architecture & migration",
      title: "Design the right cloud foundation, then move with control.",
      introduction: "We design secure, observable target architectures and migrate applications, databases, and workloads with tested cutovers and recovery paths.",
      promise: "Move to an environment your team can understand, operate, and afford.",
      promiseDetail: "Architecture and migration are one connected decision. We tie service choices to workload behavior, reliability, security, team capability, and budget before production cutover.",
      deliverables: [
        { title: "Target architecture", description: "Service boundaries, data flows, network design, environments, dependencies, security, and documented tradeoffs." },
        { title: "Migration plan and execution", description: "Workload inventory, migration waves, data transfer, testing, cutover, rollback, and risk ownership." },
        { title: "Operational handover", description: "Monitoring, access, backups, runbooks, cost baselines, documentation, and team enablement." },
      ],
      technologies: ["AWS", "Microsoft Azure", "Google Cloud", "Terraform", "Kubernetes", "Docker", "PostgreSQL", "Cloudflare"],
    }),
    "devops-reliability": defineService({
      group: "cloud", slug: "devops-reliability", name: "DevOps & Reliability", eyebrow: "Cloud foundations · DevOps & reliability",
      title: "Repeatable delivery and production systems you can trust.",
      introduction: "We build infrastructure as code, delivery pipelines, observability, service objectives, and incident practices that reduce manual production risk.",
      promise: "Make every change reviewable, observable, and recoverable.",
      promiseDetail: "A toolchain alone does not create reliability. We connect deployment controls and production signals to ownership, response procedures, and recurring improvement work.",
      deliverables: [
        { title: "Infrastructure and CI/CD", description: "Versioned infrastructure, automated validation, controlled deployments, approvals, and rollback paths." },
        { title: "Observability", description: "Meaningful metrics, structured logs, traces, dashboards, and alerts tied to user impact." },
        { title: "Reliability practice", description: "Service objectives, runbooks, incident review, capacity signals, and improvement priorities." },
      ],
      technologies: ["Terraform", "GitHub Actions", "Docker", "Kubernetes", "OpenTelemetry", "Grafana", "Prometheus", "Datadog"],
    }),
    "cloud-cost-optimization": defineService({
      group: "cloud", slug: "cloud-cost-optimization", name: "Cloud Cost Optimization", eyebrow: "Cloud foundations · Cost optimization",
      title: "Reduce cloud waste without weakening the workload.",
      introduction: "We connect cloud spend to services, usage, ownership, and business value, then implement practical changes with measurable impact.",
      promise: "Make cloud cost understandable and controllable, not a surprise at month end.",
      promiseDetail: "Cost optimisation is continuous engineering. We combine allocation, rightsizing, architecture changes, commitments, and guardrails without trading away reliability.",
      deliverables: [
        { title: "Cost baseline", description: "Allocation by service, environment, team, and workload with trends, anomalies, and unit-cost measures." },
        { title: "Optimisation backlog", description: "Prioritized rightsizing, scheduling, storage, transfer, architecture, and commitment opportunities." },
        { title: "FinOps controls", description: "Budgets, alerts, tagging, ownership, review cadence, dashboards, and policies that sustain savings." },
      ],
      technologies: ["AWS Cost Explorer", "Azure Cost Management", "Google Cloud Billing", "FinOps", "Terraform", "Kubecost", "Grafana"],
    }),
  },
  data: {
    "data-pipelines-integration": defineService({
      group: "data", slug: "data-pipelines-integration", name: "Data Pipelines & Integration", eyebrow: "Data engineering · Pipelines & integration",
      title: "Move business data reliably between the systems that need it.",
      introduction: "We build observable batch and streaming pipelines that connect APIs, databases, files, SaaS tools, and internal platforms.",
      promise: "Replace fragile exports and hidden scripts with dependable, owned data movement.",
      promiseDetail: "Reliable pipelines need clear contracts, incremental processing, retries, idempotency, reconciliation, and visible ownership. We design those controls before scaling volume.",
      deliverables: [
        { title: "Source integration", description: "Secure connectors, extraction strategies, schema handling, incremental loads, and source-system safeguards." },
        { title: "Transformation pipelines", description: "Tested business logic, orchestration, dependencies, backfills, retries, and documented data contracts." },
        { title: "Operational monitoring", description: "Freshness, volume, failure, lineage, and reconciliation checks with accountable alerts." },
      ],
      technologies: ["Python", "SQL", "Apache Airflow", "dbt", "Kafka", "Fivetran", "AWS Glue", "Azure Data Factory"],
    }),
    "data-warehousing-lakehouse": defineService({
      group: "data", slug: "data-warehousing-lakehouse", name: "Data Warehousing & Lakehouse", eyebrow: "Data engineering · Warehouse & lakehouse",
      title: "Create one governed foundation for analytics and AI.",
      introduction: "We design and implement cloud warehouses and lakehouses that organize raw operational data into secure, reusable analytical models.",
      promise: "Give teams query-ready data without creating another unowned data swamp.",
      promiseDetail: "The platform choice matters less than the model, workload, governance, and operating discipline around it. We design storage and compute around actual access patterns and growth.",
      deliverables: [
        { title: "Platform architecture", description: "Storage, compute, ingestion, environments, security boundaries, workload isolation, and cost model." },
        { title: "Analytical models", description: "Documented dimensions, facts, semantic definitions, incremental transformations, and reusable datasets." },
        { title: "Platform operations", description: "Access, monitoring, performance, backup, retention, deployment, and ownership practices." },
      ],
      technologies: ["Snowflake", "Databricks", "BigQuery", "Amazon Redshift", "Microsoft Fabric", "dbt", "Apache Spark", "SQL"],
    }),
    "data-quality-governance": defineService({
      group: "data", slug: "data-quality-governance", name: "Data Quality & Governance", eyebrow: "Data engineering · Quality & governance",
      title: "Make trusted data a managed system, not an assumption.",
      introduction: "We establish definitions, ownership, validation, lineage, access, and issue workflows that keep important data dependable and explainable.",
      promise: "Expose data problems early and give the right people a clear way to resolve them.",
      promiseDetail: "Governance fails when it becomes paperwork detached from delivery. We focus controls on critical data, automate checks where possible, and assign real operational ownership.",
      deliverables: [
        { title: "Critical data framework", description: "Priority domains, business definitions, owners, consumers, sensitivity, and expected service levels." },
        { title: "Automated quality controls", description: "Freshness, completeness, validity, uniqueness, relationship, and reconciliation tests in pipelines." },
        { title: "Governance workflow", description: "Catalog, lineage, access requests, issue triage, change control, and accountable resolution." },
      ],
      technologies: ["dbt", "Great Expectations", "Soda", "Microsoft Purview", "AWS Glue", "Databricks Unity Catalog", "Collibra", "SQL"],
    }),
  },
  analytics: {
    "dashboards-executive-reporting": defineService({
      group: "analytics", slug: "dashboards-executive-reporting", name: "Dashboards & Executive Reporting", eyebrow: "Analytics & BI · Dashboards & reporting",
      title: "Reporting built around decisions, not data volume.",
      introduction: "We turn agreed business definitions into focused dashboards and leadership reporting that show performance, exceptions, trends, and context.",
      promise: "Give every audience a reliable view of what changed and where action is required.",
      promiseDetail: "The hard part is agreeing on meaning, ownership, timing, targets, and exceptions. We settle those questions before designing the reporting experience.",
      deliverables: [
        { title: "KPI framework", description: "Definitions, formulas, owners, targets, dimensions, refresh expectations, and source lineage." },
        { title: "Role-based reporting", description: "Executive scorecards, operational drill-downs, exception views, and clear information hierarchy." },
        { title: "Reporting operations", description: "Repeatable refresh, review, commentary, approval, distribution, alerting, and archive workflows." },
      ],
      technologies: ["Power BI", "Tableau", "Amazon QuickSight", "Microsoft Fabric", "SQL", "dbt", "Snowflake"],
    }),
    "bi-consulting": defineService({
      group: "analytics", slug: "bi-consulting", name: "BI Consulting", eyebrow: "Analytics & BI · BI consulting",
      title: "Build a BI platform your teams can use and maintain.",
      introduction: "We advise, implement, and improve Power BI, Tableau, and Amazon QuickSight environments from semantic models through governance and adoption.",
      promise: "Turn scattered reports into a consistent decision layer without unnecessary platform weight.",
      promiseDetail: "Good BI combines trusted models, sensible permissions, usable design, predictable refresh, and clear publishing ownership. We address the full operating model, not only the charts.",
      deliverables: [
        { title: "BI strategy and architecture", description: "Platform fit, workspace design, semantic models, security, capacity, integration, and delivery roadmap." },
        { title: "Report delivery", description: "Validated models and dashboards with useful filtering, drill-through, performance, and accessibility." },
        { title: "Governance and enablement", description: "Publishing standards, certification, refresh ownership, documentation, training, and adoption measurement." },
      ],
      technologies: ["Power BI", "Tableau", "Amazon QuickSight", "DAX", "Power Query", "SPICE", "Snowflake", "SQL"],
    }),
  },
  ai: {
    "rag-knowledge-assistants": defineService({
      group: "ai", slug: "rag-knowledge-assistants", name: "RAG & Knowledge Assistants", eyebrow: "AI solutions · RAG & knowledge assistants",
      title: "Answers grounded in your knowledge, with sources users can verify.",
      introduction: "We build private knowledge assistants that retrieve approved content, respect access controls, and cite the evidence behind each response.",
      promise: "Make organizational knowledge easier to use without asking people to trust unsupported answers.",
      promiseDetail: "A reliable assistant depends on content quality, retrieval, permissions, evaluation, and user experience. We engineer and measure the full system rather than treating the model as the product.",
      deliverables: [
        { title: "Knowledge pipeline", description: "Content ingestion, parsing, chunking, metadata, indexing, refresh, deletion, and permission synchronization." },
        { title: "Grounded assistant", description: "Retrieval, reranking, prompting, citations, conversation design, refusal behavior, and access-aware answers." },
        { title: "Evaluation and operations", description: "Representative test sets, quality measures, feedback, tracing, monitoring, cost controls, and review workflow." },
      ],
      technologies: ["OpenAI", "Azure OpenAI", "Pinecone", "pgvector", "LangChain", "LlamaIndex", "FastAPI", "PostgreSQL"],
    }),
    "ai-agents": defineService({
      group: "ai", slug: "ai-agents", name: "AI Agents", eyebrow: "AI solutions · AI agents",
      title: "AI agents that act inside clear operational boundaries.",
      introduction: "We build agents that reason over business context, use approved tools, and complete controlled workflow steps with traceable decisions.",
      promise: "Automate multi-step work without handing unchecked authority to a model.",
      promiseDetail: "Useful agents require deterministic controls around probabilistic reasoning. We constrain tools, validate inputs and outputs, preserve audit trails, and escalate exceptions to people.",
      deliverables: [
        { title: "Agent workflow", description: "Goals, state, tool contracts, decision points, permissions, stopping conditions, and human handoffs." },
        { title: "Tool integrations", description: "Secure connections to business systems with validation, idempotency, rate limits, and recovery." },
        { title: "Safety and evaluation", description: "Scenario tests, approval gates, audit logs, observability, cost limits, and production monitoring." },
      ],
      technologies: ["OpenAI", "Azure AI", "LangGraph", "Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
    }),
    "intelligent-automation": defineService({
      group: "ai", slug: "intelligent-automation", name: "Intelligent Automation", eyebrow: "AI solutions · Intelligent automation",
      title: "Automate document and workflow work without losing control.",
      introduction: "We combine deterministic workflow automation with AI for extraction, classification, drafting, routing, and exception handling.",
      promise: "Remove repetitive work while keeping judgment, accountability, and recovery visible.",
      promiseDetail: "Not every step needs AI. We use models where interpretation adds value, conventional rules where certainty matters, and human review where risk demands it.",
      deliverables: [
        { title: "Workflow design", description: "Current-state analysis, decision rules, AI tasks, exception paths, ownership, and measurable targets." },
        { title: "Automation system", description: "Document processing, system actions, queues, approvals, notifications, and integration with existing tools." },
        { title: "Operational controls", description: "Validation, confidence thresholds, human review, audit history, retries, monitoring, and reporting." },
      ],
      technologies: ["OpenAI", "Azure AI Document Intelligence", "Power Automate", "n8n", "Python", "FastAPI", "AWS Lambda", "PostgreSQL"],
    }),
  },
  crm: {
    "crm-implementation-integration": defineService({
      group: "crm", slug: "crm-implementation-integration", name: "CRM Implementation & Integration", eyebrow: "CRM & revenue ops · Implementation & integration",
      title: "A connected CRM configured around how your team works.",
      introduction: "We design and implement CRM foundations, migrate clean data, and connect websites, marketing, support, finance, and internal systems.",
      promise: "Launch a CRM that supports the customer journey instead of creating more administration.",
      promiseDetail: "CRM implementation is an operating-design project. We align teams on the process, define system ownership, and engineer reliable integrations with visible failure handling.",
      deliverables: [
        { title: "Process and data design", description: "Lifecycle stages, record structure, required data, permissions, ownership, and governance." },
        { title: "Configuration and migration", description: "Pipelines, layouts, validation, workflows, templates, clean migration, testing, and training." },
        { title: "System integrations", description: "Source-of-truth rules, field mappings, identity matching, retries, monitoring, and reconciliation." },
      ],
      technologies: ["Salesforce", "HubSpot", "Microsoft Dynamics 365", "Zoho CRM", "REST APIs", "MuleSoft", "Power Automate", "n8n"],
    }),
    "sales-automation-revenue-analytics": defineService({
      group: "crm", slug: "sales-automation-revenue-analytics", name: "Sales Automation & Revenue Analytics", eyebrow: "CRM & revenue ops · Automation & analytics",
      title: "Automate sales follow-through and expose honest revenue signals.",
      introduction: "We automate routing, follow-ups, stages, approvals, and handoffs, then build trusted reporting for pipeline, conversion, forecasting, and customer activity.",
      promise: "Reduce repetitive CRM work while giving leaders a clearer view of commercial performance.",
      promiseDetail: "Automation and analytics share the same foundation: consistent stages, clean data, clear ownership, and durable history. We repair that model before adding workflows or dashboards.",
      deliverables: [
        { title: "Sales workflows", description: "Lead scoring and assignment, response timers, follow-ups, stage controls, approvals, and cross-team handoffs." },
        { title: "Revenue measurement", description: "Conversion, velocity, aging, coverage, win rate, forecast movement, retention, and performance definitions." },
        { title: "Decision-ready reporting", description: "Operational views, leadership dashboards, data-quality signals, alerts, and repeatable reporting cycles." },
      ],
      technologies: ["Salesforce Flow", "HubSpot Workflows", "Dynamics 365", "Power Automate", "Power BI", "Tableau", "SQL", "dbt"],
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
