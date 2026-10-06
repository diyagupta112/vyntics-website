import type { InnerServiceDetailContent } from "@/components/pages/inner-service-detail";

export type PlatformServiceGroup = "analytics" | "crm" | "cloud";

type ServiceDefinition = Omit<InnerServiceDetailContent, "process" | "metadataDescription"> & {
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
  return { ...service, process: approaches[group], metadataDescription: service.introduction };
}

export const platformServices = {
  analytics: {
    "power-bi": defineService({
      group: "analytics", slug: "power-bi", name: "Power BI", eyebrow: "Analytics & BI · Power BI",
      title: "Power BI that answers business questions clearly.",
      introduction: "We design governed Power BI models, dashboards, and reporting workflows that give teams consistent metrics and practical drill-downs.",
      promise: "Turn scattered reporting into a dependable Power BI decision layer.",
      promiseDetail: "Useful Power BI work starts with trusted definitions and a maintainable semantic model. We connect the right sources, shape the data, secure access, and design reports around the decisions users actually make.",
      deliverables: [
        { title: "Semantic models", description: "Reusable measures, relationships, hierarchies, and business definitions built for consistent reporting." },
        { title: "Interactive dashboards", description: "Focused report experiences with useful filtering, drill-through, and role-specific views." },
        { title: "Governance & performance", description: "Access controls, refresh monitoring, workspace structure, and model tuning for reliable use." },
      ],
      technologies: ["Power BI", "DAX", "Power Query", "Microsoft Fabric", "Azure", "SQL Server", "Snowflake", "PostgreSQL"],
    }),
    tableau: defineService({
      group: "analytics", slug: "tableau", name: "Tableau", eyebrow: "Analytics & BI · Tableau",
      title: "Tableau experiences built for exploration and action.",
      introduction: "We build Tableau data sources and dashboards that make complex performance patterns easier to explore, explain, and act on.",
      promise: "Give analysts and business teams visual answers without sacrificing metric consistency.",
      promiseDetail: "A polished dashboard is useless when calculations conflict or performance collapses. We pair visual design with governed sources, validated calculations, sensible permissions, and a clear publishing model.",
      deliverables: [
        { title: "Published data sources", description: "Curated, documented sources that keep calculations and dimensions consistent across workbooks." },
        { title: "Visual analytics", description: "Dashboards designed around comparison, trends, exceptions, and the next decision—not decoration." },
        { title: "Tableau governance", description: "Projects, permissions, certification, refresh ownership, and performance practices for scale." },
      ],
      technologies: ["Tableau", "Tableau Prep", "Tableau Cloud", "Tableau Server", "SQL", "Snowflake", "BigQuery", "PostgreSQL"],
    }),
    "amazon-quicksight": defineService({
      group: "analytics", slug: "amazon-quicksight", name: "Amazon QuickSight", eyebrow: "Analytics & BI · Amazon QuickSight",
      title: "Cloud-native reporting that fits your AWS environment.",
      introduction: "We implement Amazon QuickSight datasets, dashboards, embedded analytics, and access controls for teams already operating on AWS.",
      promise: "Deliver governed analytics without adding unnecessary platform weight.",
      promiseDetail: "QuickSight works best when datasets, SPICE capacity, row-level security, refresh schedules, and AWS permissions are designed together. We build those foundations before scaling dashboard delivery.",
      deliverables: [
        { title: "Datasets & calculations", description: "Reusable datasets, joins, calculated fields, parameters, and refresh schedules built around trusted sources." },
        { title: "Dashboards & embedding", description: "Interactive reporting for internal teams or analytics embedded directly inside customer products." },
        { title: "AWS-native governance", description: "Row-level security, IAM-aware access, capacity planning, monitoring, and controlled publishing." },
      ],
      technologies: ["Amazon QuickSight", "SPICE", "AWS IAM", "Amazon Redshift", "Amazon Athena", "Amazon S3", "RDS", "SQL"],
    }),
    "kpi-dashboards": defineService({
      group: "analytics", slug: "kpi-dashboards", name: "KPI Dashboards", eyebrow: "Analytics & BI · KPI dashboards",
      title: "KPI dashboards that keep everyone on the same numbers.",
      introduction: "We turn agreed business definitions into focused dashboards that show performance, exceptions, trends, and the context behind each metric.",
      promise: "Replace metric debates with clear definitions and decision-ready views.",
      promiseDetail: "The difficult part of a KPI dashboard is not the chart. It is agreeing on meaning, ownership, grain, timing, targets, and exceptions. We settle those questions and make them visible in the reporting product.",
      deliverables: [
        { title: "KPI framework", description: "Definitions, formulas, owners, targets, dimensions, and refresh expectations documented before build." },
        { title: "Role-based views", description: "Executive summaries and operational drill-downs tailored to the decisions each audience owns." },
        { title: "Alerts & distribution", description: "Scheduled reporting, threshold notifications, and exception views that bring attention to what changed." },
      ],
      technologies: ["Power BI", "Tableau", "Amazon QuickSight", "Looker", "SQL", "dbt", "Snowflake", "PostgreSQL"],
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
