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
      keywords: ["data pipeline services", "ETL services", "ELT development", "data integration services", "ETL pipeline development", "real-time data streaming", "API data integration"],
      promise: "Replace fragile exports and hidden scripts with dependable, owned data movement.",
      promiseDetail: "Reliable pipelines need clear contracts, incremental processing, retries, idempotency, reconciliation, and visible ownership. We design those controls before scaling volume.",
      deliverables: [
        { title: "Source integration", description: "Secure connectors, extraction strategies, schema handling, incremental loads, and source-system safeguards." },
        { title: "Transformation pipelines", description: "Tested business logic, orchestration, dependencies, backfills, retries, and documented data contracts." },
        { title: "Operational monitoring", description: "Freshness, volume, failure, lineage, and reconciliation checks with accountable alerts." },
      ],
      dataPage: {
        kind: "pipelines",
        serviceGroups: [
          {
            title: "Our data pipeline services.",
            introduction: "We engineer dependable movement and transformation for both scheduled and low-latency workloads.",
            items: [
              { title: "ETL and ELT pipelines", description: "Extract, load, clean, standardize, and model data using a pattern suited to the source and target platform." },
              { title: "Batch and real-time streaming", description: "Choose scheduled, micro-batch, event-driven, or streaming delivery around the decision's actual latency requirement." },
              { title: "Orchestration and scheduling", description: "Coordinate dependencies, checkpoints, retries, backfills, alerts, and safe recovery across complete workflows." },
            ],
          },
          {
            title: "Our data integration services.",
            introduction: "We connect business systems through explicit contracts and observable failure handling rather than fragile point-to-point scripts.",
            items: [
              { title: "CRM and ERP integration", description: "Synchronize customer, sales, finance, inventory, and operational records with clear source-of-truth rules." },
              { title: "Database and file integration", description: "Move data securely across operational databases, warehouses, object storage, SFTP, and structured files." },
              { title: "API and SaaS integration", description: "Connect approved third-party platforms while handling authentication, rate limits, schema changes, and rejected records." },
            ],
          },
        ],
        process: [
          { title: "Discover sources", description: "Map databases, SaaS platforms, files, APIs, owners, volumes, update patterns, and downstream consumers." },
          { title: "Design", description: "Choose ETL, ELT, batch, or streaming patterns and define contracts, checkpoints, security, and recovery behavior." },
          { title: "Build", description: "Implement modular ingestion and transformation with idempotency, version control, retries, and safe backfills." },
          { title: "Test", description: "Exercise schema changes and failure cases, then compare critical totals and records with their source systems." },
          { title: "Monitor", description: "Track freshness, uptime, volume, cost, and errors with alerts connected to accountable owners." },
        ],
        toolsHeading: "Tools we use.",
        signs: {
          title: "Signs you need better data pipelines.",
          introduction: "These are operating failures, not minor inconveniences. They compound as sources, reports, and teams grow.",
          items: [
            { title: "Manual exports", description: "Teams repeatedly download, copy, and merge files to keep reporting or operations moving." },
            { title: "Broken reports", description: "Dashboards fail or silently drift because an upstream field, schema, or schedule changed." },
            { title: "Data stuck in separate tools", description: "Customer, finance, product, and operational data remain trapped in separate tools." },
            { title: "Slow or outdated data", description: "Decisions rely on yesterday's snapshot because refreshes are fragile, opaque, or too expensive." },
          ],
        },
        architecture: {
          title: "Sample pipeline architecture.",
          introduction: "The exact services change by workload, but the responsibilities stay clear from source extraction through monitoring and consumption.",
          stages: ["Source systems", "Secure ingestion", "Transform & test", "Warehouse or lakehouse", "Reports, apps & AI"],
        },
        results: {
          introduction: "We establish a baseline before implementation and report verified changes after release. The measures below are tracked with your team rather than replaced by unverified marketing numbers.",
          items: [
            { title: "Data freshness", description: "Expected arrival time versus actual availability for every critical dataset." },
            { title: "Pipeline reliability", description: "Successful runs, recovery time, replay success, and failure frequency by workflow." },
            { title: "Manual work removed", description: "Hours previously spent exporting, cleaning, reconciling, and restarting data movement." },
          ],
        },
        engagementOptions: [
          { title: "Pipeline audit", description: "Assess sources, current flows, failure history, ownership, and the highest-risk gaps." },
          { title: "Pipeline build", description: "Design and implement a defined set of production-ready batch or streaming pipelines." },
          { title: "Managed pipelines", description: "Monitor, maintain, and improve critical flows with agreed service levels and ownership." },
        ],
        insights: [
          { title: "How to Build an ETL Pipeline: A Step-by-Step Guide", description: "The core architecture choices and controls behind a dependable ETL workflow.", href: "https://vyntics.com/blog/how-to-build-etl-pipeline" },
          { title: "What Is the Modern Data Stack?", description: "A practical view of the tools and boundaries that make up a modern data platform.", href: "https://vyntics.com/blog/what-is-modern-data-stack" },
        ],
        faqs: [
          { question: "What is the difference between ETL and ELT?", answer: "ETL transforms data before loading it into the destination. ELT loads source data first and performs most transformation inside the warehouse or lakehouse. The right choice depends on security, source constraints, scale, latency, and the target platform." },
          { question: "How long does it take to build a data pipeline?", answer: "A focused production pipeline can take a few weeks; a multi-source platform takes longer. Timing depends on source access, data quality, transformation complexity, testing, and operational requirements. We scope those dependencies before committing to a schedule." },
          { question: "Can you connect our CRM, ERP and other tools?", answer: "Yes, where the systems provide supported APIs, database access, files, events, or approved connectors. We verify authentication, rate limits, field mappings, history, and failure behavior before selecting an integration method." },
          { question: "Do you support real-time data?", answer: "Yes, when the business decision genuinely needs it. We use streaming or event-driven patterns for appropriate workloads and choose simpler batch processing when it is more reliable and cost-effective." },
          { question: "What happens when a pipeline fails?", answer: "Failures are logged and alerted with enough context to identify the affected source and consumers. Pipelines are designed for safe retry or replay, with checkpoints, idempotency, and reconciliation to prevent duplication or silent data loss." },
          { question: "How much does data pipeline development cost?", answer: "Cost depends on the number and quality of sources, latency, transformation logic, infrastructure, security, and support expectations. An audit or discovery phase produces a defensible scope instead of a misleading fixed estimate." },
        ],
        relatedServices: [
          { name: "Data Warehousing & Lakehouse", description: "Give pipeline outputs a governed, query-ready analytical foundation.", href: "/services/data-engineering/data-warehousing-lakehouse" },
          { name: "Data Quality & Governance", description: "Add ownership, validation, lineage, and issue workflows to critical data.", href: "/services/data-engineering/data-quality-governance" },
        ],
      },
      technologies: ["Apache Airflow", "dbt", "Fivetran", "Airbyte", "Apache Kafka", "AWS Glue", "Azure Data Factory"],
    }),
    "data-warehousing-lakehouse": defineService({
      group: "data", slug: "data-warehousing-lakehouse", name: "Data Warehousing & Lakehouse", eyebrow: "Data engineering · Warehouse & lakehouse",
      title: "Create one governed foundation for analytics and AI.",
      introduction: "We design and implement cloud warehouses and lakehouses that organize raw operational data into secure, reusable analytical models.",
      keywords: ["data warehousing services", "data warehouse consulting", "Snowflake consulting", "BigQuery consulting", "Amazon Redshift services", "data lakehouse services", "Databricks consulting", "data warehouse modernization"],
      promise: "Give teams query-ready data without creating another unowned data swamp.",
      promiseDetail: "The platform choice matters less than the model, workload, governance, and operating discipline around it. We design storage and compute around actual access patterns and growth.",
      deliverables: [
        { title: "Platform architecture", description: "Storage, compute, ingestion, environments, security boundaries, workload isolation, and cost model." },
        { title: "Analytical models", description: "Documented dimensions, facts, semantic definitions, incremental transformations, and reusable datasets." },
        { title: "Platform operations", description: "Access, monitoring, performance, backup, retention, deployment, and ownership practices." },
      ],
      dataPage: {
        kind: "warehouse",
        serviceGroups: [
          {
            title: "Our data warehousing services.",
            introduction: "We build analytical foundations that turn fragmented operational data into governed, reusable business models.",
            items: [
              { title: "Warehouse design", description: "Define storage, compute, environments, ingestion zones, transformation layers, security boundaries, and workload separation." },
              { title: "Data modelling", description: "Create facts, dimensions, marts, history, semantic definitions, and reusable datasets around real reporting needs." },
              { title: "Migration and performance", description: "Move legacy workloads incrementally, reconcile outputs, tune queries, and control compute and storage costs." },
            ],
          },
          {
            title: "Our lakehouse services.",
            introduction: "We combine structured and unstructured data in one governed foundation for analytics, data science, and AI workloads.",
            items: [
              { title: "Lakehouse architecture", description: "Design ingestion, object storage, open table formats, processing, serving, and workload isolation as one operating model." },
              { title: "Unified data processing", description: "Support SQL, engineering, machine-learning, and streaming use cases without creating disconnected copies for every team." },
              { title: "Governance and operations", description: "Apply cataloging, lineage, role-based access, monitoring, retention, deployment, and cost controls across the platform." },
            ],
          },
        ],
        process: [
          { title: "Assess", description: "Map current sources, reports, users, query patterns, security constraints, pain points, and growth expectations." },
          { title: "Model", description: "Define raw, standardized, and business-ready layers with ownership, history, and access rules." },
          { title: "Build", description: "Configure storage, compute, ingestion, transformation, environments, deployment, and observability." },
          { title: "Migrate", description: "Move subject areas in controlled stages and prove results against the systems they replace." },
          { title: "Optimise", description: "Tune query performance, concurrency, storage, compute, and cost from observed production use." },
        ],
        toolsHeading: "Platforms.",
        signs: {
          title: "Signs you need a data warehouse.",
          introduction: "A central platform is justified when fragmented data is already slowing decisions and increasing the cost of every new report or model.",
          items: [
            { title: "Conflicting reports", description: "The same metric produces different answers because logic and source selection are inconsistent." },
            { title: "Slow queries", description: "Operational systems are overloaded or analysts wait too long for complex reports to complete." },
            { title: "Scattered data", description: "Useful history is split across databases, SaaS products, files, and individual spreadsheets." },
            { title: "No source of truth", description: "Teams cannot identify the governed dataset, definition, owner, or refresh expectation for key measures." },
          ],
        },
        architecture: {
          title: "Sample warehouse architecture.",
          introduction: "A useful platform separates ingestion, storage, modeling, and consumption so each layer can change without turning the whole system into a dependency trap.",
          stages: ["Operational sources", "Ingestion layer", "Lakehouse or warehouse", "Semantic models", "Dashboards, analytics & AI"],
        },
        results: {
          introduction: "Performance claims only matter when they are measured against the current platform. We baseline the existing workload and validate improvements under realistic query, concurrency, and cost conditions.",
          items: [
            { title: "Query performance", description: "Response time and concurrency for agreed reports, models, and analytical workloads." },
            { title: "Reporting cycle time", description: "Time from source availability to validated, decision-ready reporting." },
            { title: "Platform efficiency", description: "Storage and compute cost by workload, team, environment, and useful query volume." },
          ],
        },
        engagementOptions: [
          { title: "Warehouse assessment", description: "Evaluate architecture, data models, workloads, security, performance, cost, and operating ownership." },
          { title: "Build or migration", description: "Deliver a new platform or move priority workloads from a legacy warehouse in controlled stages." },
          { title: "Ongoing support", description: "Operate, tune, govern, and extend the platform as data volumes and business needs change." },
        ],
        insights: [
          { title: "What Is the Modern Data Stack?", description: "Understand the responsibilities and tradeoffs across a modern analytical platform.", href: "https://vyntics.com/blog/what-is-modern-data-stack" },
          { title: "Data Engineering vs Data Science", description: "See how reliable data foundations support analysis, modeling, and operational use.", href: "https://vyntics.com/blog/data-engineering-vs-data-science" },
        ],
        faqs: [
          { question: "What is the difference between a data warehouse, a data lake and a lakehouse?", answer: "A warehouse is optimized for governed analytical tables and predictable SQL workloads. A lake stores large volumes of raw and varied data. A lakehouse adds warehouse-style management and query capabilities over lake storage. The right pattern depends on workload, governance, skills, and cost." },
          { question: "Which is better: Snowflake, BigQuery or Redshift?", answer: "None is universally better. Snowflake emphasizes workload separation and cross-cloud availability, BigQuery offers serverless operation on Google Cloud, and Redshift integrates deeply with AWS. We compare them against your data volume, concurrency, ecosystem, skills, governance, and cost model." },
          { question: "How long does it take to build a data warehouse?", answer: "A first useful subject area may be delivered in weeks, while a broader migration usually takes months. Source access, data quality, historical logic, security, reconciliation, and the number of business domains determine the real schedule." },
          { question: "Can you migrate our existing database to a modern warehouse?", answer: "Yes. We inventory workloads, select migration waves, rebuild or adapt models, validate historical data, test performance, and plan cutover and rollback. We avoid a single high-risk big-bang move where incremental migration is possible." },
          { question: "How much does a cloud data warehouse cost to run?", answer: "Cost depends on stored data, compute time, query patterns, concurrency, data movement, retention, and platform pricing. We model expected workloads and add allocation, budgets, and monitoring so spend remains visible after launch." },
          { question: "Is our data secure in a cloud data warehouse?", answer: "It can be when identity, least-privilege access, network boundaries, encryption, sensitive-data controls, audit logs, retention, and operational ownership are designed correctly. The platform alone does not create security." },
        ],
        relatedServices: [
          { name: "Data Pipelines & Integration", description: "Bring source data into the platform through recoverable, observable flows.", href: "/services/data-engineering/data-pipelines-integration" },
          { name: "Data Quality & Governance", description: "Define the ownership and controls that keep shared data trustworthy.", href: "/services/data-engineering/data-quality-governance" },
          { name: "Dashboards & Executive Reporting", description: "Turn governed warehouse models into focused operational and leadership reporting.", href: "/services/analytics-bi/dashboards-executive-reporting" },
          { name: "RAG & Knowledge Assistants", description: "Ground retrieval and assistant workflows in governed enterprise data.", href: "/services/ai-solutions/rag-knowledge-assistants" },
          { name: "Cloud Architecture & Migration", description: "Create the secure cloud foundation around your modern data platform.", href: "/services/cloud-foundations/cloud-architecture-migration" },
        ],
      },
      technologies: ["Snowflake", "Google BigQuery", "Amazon Redshift", "Databricks", "Azure Synapse"],
    }),
    "data-quality-governance": defineService({
      group: "data", slug: "data-quality-governance", name: "Data Quality & Governance", eyebrow: "Data engineering · Quality & governance",
      title: "Make trusted data a managed system, not an assumption.",
      introduction: "We establish definitions, ownership, validation, lineage, access, and issue workflows that keep important data dependable and explainable.",
      keywords: ["data quality services", "data governance consulting", "data quality management", "master data management", "data observability", "data catalog implementation", "data compliance services"],
      promise: "Expose data problems early and give the right people a clear way to resolve them.",
      promiseDetail: "Governance fails when it becomes paperwork detached from delivery. We focus controls on critical data, automate checks where possible, and assign real operational ownership.",
      deliverables: [
        { title: "Critical data framework", description: "Priority domains, business definitions, owners, consumers, sensitivity, and expected service levels." },
        { title: "Automated quality controls", description: "Freshness, completeness, validity, uniqueness, relationship, and reconciliation tests in pipelines." },
        { title: "Governance workflow", description: "Catalog, lineage, access requests, issue triage, change control, and accountable resolution." },
      ],
      dataPage: {
        kind: "quality",
        serviceGroups: [
          {
            title: "Our data quality services.",
            introduction: "We turn critical data expectations into automated controls and accountable remediation workflows.",
            items: [
              { title: "Data profiling", description: "Measure completeness, uniqueness, distributions, formats, relationships, and anomalies before defining corrective action." },
              { title: "Validation and cleansing", description: "Apply technical and business rules, standardize values, reconcile sources, and resolve duplicates with traceable logic." },
              { title: "Automated quality checks", description: "Run freshness, volume, validity, and relationship tests inside pipelines and transformation deployments." },
            ],
          },
          {
            title: "Our data governance services.",
            introduction: "We connect ownership and policy to the systems and workflows that teams use every day.",
            items: [
              { title: "Catalog and ownership", description: "Document critical datasets, business definitions, consumers, accountable owners, and expected service levels." },
              { title: "Access and lineage", description: "Control sensitive data, trace movement and transformation, and preserve evidence for change and access decisions." },
              { title: "Compliance workflows", description: "Support retention, deletion, auditability, and access processes for requirements such as GDPR and India's DPDP Act." },
            ],
          },
        ],
        spotlight: {
          title: "Data observability.",
          introduction: "Monitoring and alerts catch bad data before it reaches a report, application, or AI system.",
          items: [
            { title: "Freshness and volume", description: "Detect late loads, missing partitions, abnormal row counts, and unexpected distribution changes." },
            { title: "Lineage-aware alerting", description: "Show which sources, models, reports, and users are affected so failures can be prioritized correctly." },
            { title: "Incident response", description: "Route failures with severity, evidence, ownership, and a clear path from diagnosis through verified resolution." },
          ],
        },
        process: [
          { title: "Assess", description: "Prioritize datasets and fields tied to decisions, customer experiences, financial reporting, or regulatory duties." },
          { title: "Define rules", description: "Agree definitions, quality dimensions, thresholds, service levels, sensitivity, access, and accountable owners." },
          { title: "Clean", description: "Profile existing data, resolve duplicates and invalid values, and document accepted exceptions." },
          { title: "Automate", description: "Run tests, lineage capture, policy checks, and issue routing inside delivery workflows." },
          { title: "Monitor", description: "Track recurring failures to their source and improve the process, contract, or ownership causing them." },
        ],
        toolsHeading: "Tools we use.",
        signs: {
          title: "Signs of a data quality problem.",
          introduction: "Data distrust is usually a visible symptom of missing ownership and controls. Fixing rows without fixing that operating system only delays the next failure.",
          items: [
            { title: "Duplicate records", description: "Customers, products, or transactions appear multiple times with no dependable matching rule." },
            { title: "Missing values", description: "Critical fields are incomplete because validation and accountability are absent at collection time." },
            { title: "Contradictory reports", description: "Teams use different definitions, transformations, or source systems for the same measure." },
            { title: "Low trust", description: "People rebuild checks in spreadsheets because they cannot see lineage, ownership, or test results." },
          ],
        },
        results: {
          introduction: "We measure quality against agreed business rules and preserve the evidence. Improvements are reported against a verified baseline, not represented by generic percentage claims.",
          items: [
            { title: "Quality pass rate", description: "Critical records and datasets meeting completeness, validity, uniqueness, and relationship rules." },
            { title: "Defects removed", description: "Duplicate, missing, invalid, and inconsistent records resolved with traceable remediation." },
            { title: "Manual checking time", description: "Hours previously spent finding, validating, and reconciling data issues by hand." },
          ],
        },
        engagementOptions: [
          { title: "Data quality audit", description: "Profile critical data, identify failure patterns, assess controls, and prioritize remediation." },
          { title: "Governance setup", description: "Establish definitions, ownership, catalog, lineage, access workflows, and automated quality rules." },
          { title: "Ongoing monitoring", description: "Operate controls, triage incidents, report service levels, and improve recurring failure patterns." },
        ],
        insights: [
          { title: "Data Engineering vs Data Science", description: "Understand why reliable, governed inputs are a prerequisite for trustworthy analysis and models.", href: "https://vyntics.com/blog/data-engineering-vs-data-science" },
          { title: "What Is the Modern Data Stack?", description: "See where testing, lineage, cataloging, and ownership fit in a modern platform.", href: "https://vyntics.com/blog/what-is-modern-data-stack" },
        ],
        faqs: [
          { question: "What is the difference between data quality and data governance?", answer: "Data quality measures whether data is fit for use, such as complete, valid, timely, and consistent. Data governance defines the ownership, policies, access, definitions, and decision processes that sustain trustworthy data. Quality controls are one part of governance." },
          { question: "How do you measure data quality?", answer: "We define rules across dimensions such as completeness, validity, uniqueness, consistency, freshness, and reconciliation. Each rule needs a threshold, business context, owner, severity, and response path so the score leads to action." },
          { question: "How long does a data quality audit take?", answer: "A focused audit of a critical domain may take a few weeks. The scope depends on the number of sources, datasets, rules, owners, and historical issues. We prioritize critical data instead of attempting to profile everything equally." },
          { question: "Can you fix our existing bad data?", answer: "Yes, where correction rules and reliable source evidence exist. We profile, deduplicate, standardize, reconcile, and document exceptions. We also fix the upstream process or control where possible so the same defects do not immediately return." },
          { question: "How do you help with data compliance like GDPR or the DPDP Act?", answer: "We help identify sensitive data, document purpose and ownership, apply access and retention controls, support lineage and deletion workflows, and preserve audit evidence. This is engineering support, not legal advice; legal interpretation remains with your counsel." },
          { question: "Do we need a data catalog?", answer: "Not always. A catalog is useful when many teams need shared definitions, discovery, lineage, ownership, and access workflows. For a smaller estate, a simpler documented inventory may deliver more value with less overhead." },
        ],
        relatedServices: [
          { name: "Data Pipelines & Integration", description: "Enforce quality and reconciliation inside the flows that move business data.", href: "/services/data-engineering/data-pipelines-integration" },
          { name: "Data Warehousing & Lakehouse", description: "Apply governance to a shared analytical foundation with controlled access and models.", href: "/services/data-engineering/data-warehousing-lakehouse" },
          { name: "Dashboards & Executive Reporting", description: "Build reporting on governed definitions and tested datasets.", href: "/services/analytics-bi/dashboards-executive-reporting" },
          { name: "AI Solutions", description: "Prepare trusted, permission-aware data for practical AI systems.", href: "/services/ai-solutions" },
        ],
      },
      technologies: ["Great Expectations", "dbt tests", "Monte Carlo", "Collibra", "Alation", "Databricks Unity Catalog"],
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
      title: "AI chatbot development services grounded in your knowledge.",
      introduction: "We build private knowledge assistants that retrieve approved content, respect access controls, and cite the evidence behind each response.",
      promise: "Make organizational knowledge easier to use without asking people to trust unsupported answers.",
      promiseDetail: "A reliable assistant depends on content quality, retrieval, permissions, evaluation, and user experience. We engineer and measure the full system rather than treating the model as the product.",
      deliverables: [
        { title: "Knowledge pipeline", description: "Content ingestion, parsing, chunking, metadata, indexing, refresh, deletion, and permission synchronization." },
        { title: "Grounded assistant", description: "Retrieval, reranking, prompting, citations, conversation design, refusal behavior, and access-aware answers." },
        { title: "Evaluation and operations", description: "Representative test sets, quality measures, feedback, tracing, monitoring, cost controls, and review workflow." },
      ],
      aiPage: {
        signs: {
          title: "Signs you need an AI knowledge assistant",
          introduction: "A knowledge assistant is useful when finding and verifying information has become a daily operating problem, not simply because chat interfaces are popular.",
          items: [
            { title: "Staff search documents for answers", description: "Teams lose time searching folders, portals, PDFs, and disconnected systems before they can answer routine questions." },
            { title: "The same questions repeat", description: "Support and operations teams repeatedly answer questions that already exist in approved company knowledge." },
            { title: "Knowledge is locked away", description: "Important policies and guidance sit inside PDFs, wikis, shared drives, and systems that are difficult to search together." },
            { title: "Onboarding is slow", description: "New employees depend on individual colleagues to learn processes, terminology, and where reliable information lives." },
          ],
        },
        beforeFlow: [{
          title: "What we build",
          introduction: "We design each assistant around its users, approved sources, access rules, and the decisions it needs to support.",
          items: [
            { title: "Internal knowledge assistants", description: "Secure assistants for policies, procedures, technical documentation, and operational knowledge." },
            { title: "Customer support chatbots", description: "Grounded support experiences that answer from approved product and service information and escalate when needed." },
            { title: "Compliance and policy assistants", description: "Access-aware guidance that cites the current source material behind every sensitive answer." },
            { title: "Document Q&A", description: "Question answering across PDFs, contracts, manuals, wikis, and other controlled document collections." },
          ],
        }],
        flow: {
          title: "How RAG works",
          introduction: "Retrieval-augmented generation finds relevant approved content before the model answers, so the response can stay grounded in evidence instead of relying on model memory.",
          stages: ["Your documents", "Permission-aware search", "Relevant evidence", "AI answer", "Source citations"],
        },
        afterFlow: [
          {
            title: "Accuracy & security",
            introduction: "Accuracy and privacy are system requirements. They depend on retrieval quality, evaluation, permissions, refusal behaviour, and controlled deployment.",
            items: [
              { title: "Answers with source citations", description: "Responses point users to the exact approved material used, making important claims easier to verify." },
              { title: "Guardrails against made-up answers", description: "Evaluation, confidence rules, constrained prompting, and safe refusals reduce unsupported responses." },
              { title: "Access control", description: "Retrieval follows source permissions so users only receive information they are already authorized to access." },
              { title: "Private deployment", description: "Model, storage, logging, and retention choices are configured around your security and compliance requirements." },
            ],
          },
          {
            title: "Integrations",
            introduction: "The assistant can live where employees and customers already work instead of forcing another disconnected destination.",
            items: [
              { title: "Team collaboration", description: "Slack and Microsoft Teams experiences connected to approved company knowledge." },
              { title: "Customer channels", description: "Website chat and WhatsApp interfaces with clear escalation and conversation controls." },
              { title: "Knowledge sources", description: "SharePoint, Google Drive, Notion, and Confluence ingestion with refresh and deletion handling." },
            ],
          },
        ],
        process: [
          { title: "Discover", description: "Define users, questions, source systems, permissions, risks, and measurable success criteria." },
          { title: "Prepare data", description: "Clean, structure, label, and synchronize approved content while preserving ownership and access rules." },
          { title: "Build pilot", description: "Implement retrieval, reranking, prompting, citations, interfaces, and safe fallback behaviour." },
          { title: "Evaluate", description: "Test retrieval and answer quality against representative questions, edge cases, and permission boundaries." },
          { title: "Deploy", description: "Release into the target channel with monitoring, operational ownership, and controlled access." },
          { title: "Improve", description: "Use feedback, failed queries, content freshness, latency, and cost evidence to refine the system." },
        ],
        toolsHeading: "Tech we use",
        results: {
          introduction: "We establish a verified baseline before launch and measure the operating change. Generic percentages without project evidence are not credible.",
          items: [
            { title: "Support demand", description: "Questions resolved without manual handling and changes in repeat support requests." },
            { title: "Time to answer", description: "Time saved finding and verifying information compared with the existing process." },
            { title: "Answer quality", description: "Retrieval relevance, citation correctness, groundedness, refusal quality, and user feedback." },
          ],
        },
        engagementOptions: [
          { title: "2-week pilot", description: "Test a focused user group, representative knowledge set, and measurable question set before a larger commitment." },
          { title: "Full build", description: "Production ingestion, permissions, interfaces, evaluation, monitoring, and operational handover." },
          { title: "Ongoing support and improvement", description: "Monitor quality, refresh knowledge, review failures, and improve retrieval and user experience." },
        ],
        insights: [
          { title: "What is RAG?", description: "Understand how retrieval grounds AI answers in approved company information.", href: "/blog" },
          { title: "RAG vs fine-tuning", description: "Compare two different approaches to adapting model behaviour and knowledge.", href: "/blog" },
          { title: "How to reduce AI hallucinations", description: "See why evidence, evaluation, constraints, and safe refusals must work together.", href: "/blog" },
        ],
        faqs: [
          { question: "What is RAG (retrieval-augmented generation)?", answer: "RAG retrieves relevant information from approved sources before a language model writes its answer. This makes responses easier to ground, cite, update, and control than relying only on what the model learned during training." },
          { question: "How accurate are the assistant's answers?", answer: "Accuracy depends on source quality, retrieval design, question type, and evaluation. We measure retrieval relevance, groundedness, citation correctness, and safe refusal behaviour against representative questions before release." },
          { question: "Can it answer from our private documents securely?", answer: "Yes, when ingestion, storage, retrieval, model access, logging, and retention are designed around your security requirements. Source permissions must be enforced during retrieval rather than added only in the interface." },
          { question: "Which document types can it read?", answer: "Typical sources include PDFs, Office documents, web pages, wikis, knowledge bases, and structured records. Scans and complex layouts may require OCR or document-intelligence processing before indexing." },
          { question: "Can it work inside Slack, Teams or our website?", answer: "Yes. We can integrate the assistant into Slack, Microsoft Teams, website chat, and other approved channels while keeping identity, permissions, citations, and escalation consistent." },
          { question: "How much does an AI knowledge assistant cost?", answer: "Cost depends on source volume and quality, permissions, integrations, evaluation depth, user traffic, hosting, and support. A focused pilot is the honest way to validate scope before pricing a production system." },
        ],
        relatedServices: [
          { name: "AI Agents", description: "Move from answering questions to completing controlled multi-step tasks across connected systems.", href: "/services/ai-solutions/ai-agents" },
          { name: "Intelligent Automation", description: "Extract information and automate document-heavy workflows with visible exception handling.", href: "/services/ai-solutions/intelligent-automation" },
          { name: "Data Quality & Governance", description: "Improve the quality, ownership, permissions, and controls behind AI-ready knowledge.", href: "/services/data-engineering/data-quality-governance" },
          { name: "Data Warehousing & Lakehouse", description: "Build a governed data foundation for analytical and AI workloads.", href: "/services/data-engineering/data-warehousing-lakehouse" },
        ],
      },
      technologies: ["OpenAI", "Anthropic", "Google Gemini", "Open-source LLMs", "LangChain", "LlamaIndex", "Pinecone", "pgvector"],
    }),
    "ai-agents": defineService({
      group: "ai", slug: "ai-agents", name: "AI Agents", eyebrow: "AI solutions · AI agents",
      title: "AI agent development services built around clear operational boundaries.",
      introduction: "We build agents that reason over business context, use approved tools, and complete controlled workflow steps with traceable decisions.",
      promise: "Automate multi-step work without handing unchecked authority to a model.",
      promiseDetail: "Useful agents require deterministic controls around probabilistic reasoning. We constrain tools, validate inputs and outputs, preserve audit trails, and escalate exceptions to people.",
      deliverables: [
        { title: "Agent workflow", description: "Goals, state, tool contracts, decision points, permissions, stopping conditions, and human handoffs." },
        { title: "Tool integrations", description: "Secure connections to business systems with validation, idempotency, rate limits, and recovery." },
        { title: "Safety and evaluation", description: "Scenario tests, approval gates, audit logs, observability, cost limits, and production monitoring." },
      ],
      aiPage: {
        signs: {
          title: "Signs you're ready for AI agents",
          introduction: "Agents make sense when the workflow is valuable, repeatable, connected to usable systems, and bounded by rules that can be tested.",
          items: [
            { title: "Multi-step work repeats", description: "People repeatedly research, decide, update systems, communicate, and follow up through the same sequence." },
            { title: "Teams copy data between systems", description: "Work stalls because information is manually moved among CRMs, ticketing tools, spreadsheets, inboxes, and internal apps." },
            { title: "Rules need some judgement", description: "The process is structured but still requires language understanding, prioritization, or context-sensitive choices." },
            { title: "Exceptions consume attention", description: "Most work follows a known path, while a smaller set of ambiguous or high-risk cases needs human review." },
          ],
        },
        beforeFlow: [
          {
            title: "What AI agents can do",
            introduction: "A useful agent completes bounded work through approved tools, with explicit stopping conditions and escalation paths.",
            items: [
              { title: "Research and summarise", description: "Collect evidence from approved sources and turn it into concise, traceable briefs." },
              { title: "Update CRMs and tickets", description: "Create or update records through validated tool calls and controlled permissions." },
              { title: "Draft emails and reports", description: "Prepare context-aware communications and structured reports for review or approved delivery." },
              { title: "Route requests", description: "Classify incoming work, gather required context, and direct it to the correct team or workflow." },
              { title: "Run connected tasks", description: "Coordinate actions across business applications while preserving state, audit history, and recovery paths." },
            ],
          },
          {
            title: "Use cases by team",
            introduction: "The strongest use cases start with a specific team outcome and a workflow owner, not a broad request to add an agent everywhere.",
            items: [
              { title: "Sales", description: "Research accounts, prepare briefs, update CRM records, and draft controlled follow-up." },
              { title: "Customer Support", description: "Triage requests, gather account context, suggest resolutions, and escalate exceptions." },
              { title: "Operations", description: "Coordinate recurring requests, system updates, approvals, and cross-team handoffs." },
              { title: "Finance", description: "Collect evidence, classify transactions, prepare reconciliations, and route approvals." },
              { title: "HR", description: "Support onboarding, answer policy questions, prepare documents, and coordinate routine requests." },
            ],
          },
        ],
        flow: {
          title: "How our agents work",
          introduction: "The model can plan and use tools, but consequential actions stay inside permissions, validation, and human approval boundaries.",
          stages: ["Trigger", "Agent plans", "Uses tools and APIs", "Human approval", "Result"],
        },
        afterFlow: [
          {
            title: "LLM integration",
            introduction: "We connect models such as GPT, Claude, and Gemini to existing applications through stable, observable service boundaries.",
            items: [
              { title: "Model gateway", description: "Centralize provider access, credentials, rate limits, routing, fallbacks, and version changes." },
              { title: "Structured interfaces", description: "Validate model inputs and outputs before they reach business systems or downstream code." },
              { title: "Existing applications", description: "Embed agent capabilities into the software and workflows teams already use." },
            ],
          },
          {
            title: "Safety & control",
            introduction: "Autonomy without operational controls is a liability. We constrain what an agent can see, decide, spend, and execute.",
            items: [
              { title: "Human approval", description: "Require explicit review before sensitive communications, financial actions, or system changes." },
              { title: "Permissions", description: "Give every agent and tool the minimum access required for the approved task." },
              { title: "Audit logs", description: "Capture prompts, decisions, tool calls, inputs, outputs, approvals, and failure context." },
              { title: "Cost limits", description: "Set usage budgets, timeouts, iteration limits, and alerts that prevent uncontrolled execution." },
            ],
          },
        ],
        process: [
          { title: "Pick a use case", description: "Choose one valuable workflow with an accountable owner, measurable outcome, and clear execution boundaries." },
          { title: "Pilot", description: "Connect the minimum tools and data required to test the workflow under supervised conditions." },
          { title: "Test", description: "Exercise normal, edge, adversarial, timeout, permission, and recovery scenarios before release." },
          { title: "Deploy", description: "Release gradually with human oversight, complete traces, alerts, and a clear rollback path." },
          { title: "Monitor", description: "Track task success, failures, human interventions, latency, spend, and business outcomes." },
        ],
        toolsHeading: "Tech we use",
        results: {
          introduction: "Agent performance is measured against the existing workflow and verified in operation. We do not present fictional savings as case-study evidence.",
          items: [
            { title: "Hours saved", description: "Manual time removed from the specific workflow after accounting for review and exception handling." },
            { title: "Tasks completed", description: "Successful end-to-end task completion, including tool calls, approvals, and downstream confirmation." },
            { title: "Response time", description: "Change in elapsed time from trigger to a completed result or correctly routed exception." },
          ],
        },
        engagementOptions: [
          { title: "Agent pilot", description: "Validate one bounded workflow, a limited tool set, safety controls, and measurable task success." },
          { title: "Production build", description: "Engineer durable integrations, state, approvals, evaluation, observability, security, and rollout." },
          { title: "Ongoing monitoring", description: "Review execution quality, failures, costs, model changes, permissions, and opportunities for controlled expansion." },
        ],
        insights: [
          { title: "What are AI agents?", description: "Understand how agents plan, use tools, preserve state, and complete bounded tasks.", href: "/blog" },
          { title: "AI agents vs chatbots", description: "See the difference between answering questions and taking controlled actions.", href: "/blog" },
          { title: "AI agent use cases for business", description: "Evaluate where agents can deliver measurable value without creating unmanaged risk.", href: "/blog" },
        ],
        faqs: [
          { question: "What is an AI agent?", answer: "An AI agent is software that uses a model to interpret a goal, choose among approved actions, call tools or APIs, maintain workflow state, and return or execute a result within defined boundaries." },
          { question: "How are AI agents different from chatbots?", answer: "A chatbot primarily responds to messages. An agent can perform multi-step work across connected tools. That extra capability requires stronger permissions, validation, approval, tracing, and failure handling." },
          { question: "Are AI agents safe to use with our business systems?", answer: "They can be when access is narrow, inputs and outputs are validated, important actions require approval, every step is logged, and failure behaviour is tested. Giving an agent broad credentials is not safe architecture." },
          { question: "Which tasks can AI agents automate?", answer: "Good candidates are repetitive, valuable workflows with clear triggers, accessible systems, bounded decisions, and measurable completion criteria. Highly ambiguous or irreversible decisions usually need stronger human control." },
          { question: "Can AI agents connect to our existing software?", answer: "Yes, through approved APIs, databases, webhooks, and automation platforms. We define narrow tool contracts and validate every operation instead of exposing unrestricted system access." },
          { question: "How much does it cost to build an AI agent?", answer: "Cost depends on workflow complexity, number and quality of integrations, security, testing depth, usage volume, and monitoring. A bounded pilot provides real evidence for production scope and cost." },
        ],
        relatedServices: [
          { name: "RAG & Knowledge Assistants", description: "Ground agent decisions in approved company knowledge with verifiable citations.", href: "/services/ai-solutions/rag-knowledge-assistants" },
          { name: "Intelligent Automation", description: "Combine AI interpretation with deterministic workflows and human exception handling.", href: "/services/ai-solutions/intelligent-automation" },
          { name: "CRM Implementation & Integration", description: "Create dependable customer-system workflows and controlled integration points for agents.", href: "/services/crm-revenue-ops/crm-implementation-integration" },
          { name: "Sales Automation & Revenue Analytics", description: "Automate sales follow-through and measure commercial workflow outcomes.", href: "/services/crm-revenue-ops/sales-automation-revenue-analytics" },
        ],
      },
      technologies: ["OpenAI", "Anthropic", "Google Gemini", "LangGraph", "CrewAI", "Model Context Protocol (MCP)", "n8n"],
    }),
    "intelligent-automation": defineService({
      group: "ai", slug: "intelligent-automation", name: "Intelligent Automation", eyebrow: "AI solutions · Intelligent automation",
      title: "Intelligent automation services for document and workflow work.",
      introduction: "We combine deterministic workflow automation with AI for extraction, classification, drafting, routing, and exception handling.",
      promise: "Remove repetitive work while keeping judgment, accountability, and recovery visible.",
      promiseDetail: "Not every step needs AI. We use models where interpretation adds value, conventional rules where certainty matters, and human review where risk demands it.",
      deliverables: [
        { title: "Workflow design", description: "Current-state analysis, decision rules, AI tasks, exception paths, ownership, and measurable targets." },
        { title: "Automation system", description: "Document processing, system actions, queues, approvals, notifications, and integration with existing tools." },
        { title: "Operational controls", description: "Validation, confidence thresholds, human review, audit history, retries, monitoring, and reporting." },
      ],
      aiPage: {
        signs: {
          title: "Signs you need intelligent automation",
          introduction: "Intelligent automation is justified when repetitive document and workflow work creates measurable delay, rework, and operating risk.",
          items: [
            { title: "Manual data entry", description: "People repeatedly copy fields from PDFs, scans, forms, and emails into business systems." },
            { title: "Approvals are slow", description: "Requests wait in inboxes because ownership, required evidence, and next actions are unclear." },
            { title: "Copy-paste errors recur", description: "Routine re-keying introduces avoidable mistakes, missing fields, and reconciliation work." },
            { title: "Staff are stuck on repetitive work", description: "Skilled employees spend significant time classifying, extracting, routing, and updating instead of handling exceptions." },
          ],
        },
        beforeFlow: [
          {
            title: "Intelligent document processing",
            introduction: "We turn unstructured business documents into validated, traceable data that downstream workflows can use.",
            items: [
              { title: "Invoices", description: "Extract suppliers, totals, tax, dates, line items, and purchase-order references for validation and approval." },
              { title: "Contracts", description: "Identify parties, clauses, dates, obligations, and exceptions while preserving links to source context." },
              { title: "Forms, IDs and receipts", description: "Classify documents, extract required fields, score confidence, and route uncertain values for review." },
            ],
          },
          {
            title: "AI workflow automation",
            introduction: "We combine AI interpretation with deterministic rules, integrations, and human review to automate the complete operating path.",
            items: [
              { title: "Approvals", description: "Assemble evidence, validate policy conditions, route to the correct approver, and record the decision." },
              { title: "Notifications and handoffs", description: "Keep owners informed and move work between teams with the required context attached." },
              { title: "Data entry and system updates", description: "Write validated information into approved systems with idempotency, audit history, and recovery controls." },
            ],
          },
          {
            title: "Use cases",
            introduction: "We prioritize document-heavy processes where quality, timing, and exception visibility can be measured against a real baseline.",
            items: [
              { title: "Invoice processing", description: "Capture invoice data, match supporting records, route approvals, and send exceptions to finance." },
              { title: "Contract review", description: "Extract key clauses and obligations, compare against playbooks, and flag issues for legal review." },
              { title: "Customer onboarding (KYC)", description: "Collect and validate documents, identify missing evidence, and route risk exceptions." },
              { title: "Claims processing", description: "Classify submissions, extract evidence, validate completeness, and coordinate review steps." },
              { title: "HR paperwork", description: "Process onboarding, policy, benefits, and employee documents with clear ownership and access controls." },
            ],
          },
        ],
        flow: {
          title: "Sample automation flow",
          introduction: "Straight-through processing handles confident, valid cases. Uncertain or exceptional cases retain source context and move to a human reviewer.",
          stages: ["Document in", "AI extracts data", "Validation", "System update", "Human review for exceptions"],
        },
        afterFlow: [],
        process: [
          { title: "Map the workflow", description: "Document inputs, decisions, systems, owners, volumes, exceptions, controls, and the current performance baseline." },
          { title: "Pilot", description: "Test representative documents and one bounded workflow before expanding the automation surface." },
          { title: "Automate", description: "Implement extraction, rules, approvals, notifications, integrations, and traceable system updates." },
          { title: "Test", description: "Validate field accuracy, business rules, permissions, duplicate handling, retries, and exception routing." },
          { title: "Monitor", description: "Track processing time, accuracy, manual review, failures, drift, cost, and recurring exception causes." },
        ],
        toolsHeading: "Tools we use",
        results: {
          introduction: "Results are measured against the existing workflow after representative testing. We report verified operating outcomes, not invented automation claims.",
          items: [
            { title: "Hours saved", description: "Manual effort removed after accounting for validation, human review, and exception handling." },
            { title: "Processing time", description: "Elapsed time from document or request arrival to a completed update or routed exception." },
            { title: "Error reduction", description: "Change in missing, invalid, duplicated, or incorrectly entered data against the baseline." },
          ],
        },
        engagementOptions: [
          { title: "Automation audit", description: "Map the workflow, quantify manual effort and errors, assess document variation, and prioritize opportunities." },
          { title: "Pilot", description: "Test a representative document set and one end-to-end process with measurable quality thresholds." },
          { title: "Full rollout", description: "Scale integrations, controls, monitoring, exception operations, training, and ownership across the production workflow." },
        ],
        insights: [
          { title: "What is intelligent document processing?", description: "Learn how extraction, validation, and human review turn documents into dependable workflow data.", href: "/blog" },
          { title: "RPA vs intelligent automation", description: "Compare rule-only automation with workflows that also interpret language and documents.", href: "/blog" },
          { title: "Automating invoice processing", description: "See the controls required to move from extraction to validated finance operations.", href: "/blog" },
        ],
        faqs: [
          { question: "What is intelligent automation?", answer: "Intelligent automation combines deterministic workflow rules and integrations with AI capabilities such as document extraction, classification, summarization, and language understanding, while keeping exceptions and accountability visible." },
          { question: "How is intelligent automation different from RPA?", answer: "Traditional RPA is strongest with stable interfaces and explicit rules. Intelligent automation can also interpret less structured documents and language, but it requires confidence thresholds, evaluation, and human review for uncertainty." },
          { question: "Which documents can AI read accurately?", answer: "Common examples include invoices, contracts, forms, IDs, receipts, and correspondence. Accuracy depends on scan quality, layout variation, handwriting, languages, fields, and validation evidence, so we benchmark representative samples." },
          { question: "What happens when the AI is unsure about a document?", answer: "Low-confidence fields and failed validation rules are routed to a human reviewer with the source document, extracted value, confidence, and relevant context. The system should never silently guess." },
          { question: "Can it connect to our ERP or accounting software?", answer: "Yes, when the system provides an approved API, integration layer, database interface, or supported automation connector. Updates are validated, logged, and designed to avoid duplicates." },
          { question: "How much does intelligent automation cost?", answer: "Cost depends on document types and variation, monthly volume, accuracy requirements, integrations, exception workflows, compliance, and support. An audit and representative pilot provide the evidence needed for a credible estimate." },
        ],
        relatedServices: [
          { name: "AI Agents", description: "Coordinate multi-step work across tools when the workflow requires context-sensitive decisions.", href: "/services/ai-solutions/ai-agents" },
          { name: "RAG & Knowledge Assistants", description: "Ground document and policy questions in approved sources with verifiable citations.", href: "/services/ai-solutions/rag-knowledge-assistants" },
          { name: "Data Pipelines & Integration", description: "Create reliable flows between source documents, operational systems, and downstream data products.", href: "/services/data-engineering/data-pipelines-integration" },
          { name: "CRM Implementation & Integration", description: "Connect automated customer workflows to dependable CRM records and ownership.", href: "/services/crm-revenue-ops/crm-implementation-integration" },
        ],
      },
      technologies: ["Azure AI Document Intelligence", "Amazon Textract", "Google Document AI", "n8n", "Make", "Power Automate", "Zapier"],
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
