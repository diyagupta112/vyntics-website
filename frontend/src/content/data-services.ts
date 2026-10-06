export type DataServiceSlug =
  | "data-pipelines"
  | "etl-elt"
  | "data-warehousing"
  | "data-integration"
  | "data-quality";

export type DataServiceContent = {
  slug: DataServiceSlug;
  name: string;
  eyebrow: string;
  title: string;
  introduction: string;
  promise: string;
  promiseDetail: string;
  deliverables: ReadonlyArray<{ title: string; description: string }>;
  process: ReadonlyArray<{ title: string; description: string }>;
  outcomes: readonly string[];
  technologies: readonly string[];
  metadataDescription: string;
};

export const dataServices: Record<DataServiceSlug, DataServiceContent> = {
  "data-pipelines": {
    slug: "data-pipelines",
    name: "Data Pipelines",
    eyebrow: "Data engineering · Data pipelines",
    title: "Data that arrives on time—and recovers when it does not.",
    introduction:
      "We build automated batch and streaming pipelines that move data from operational systems into dependable analytics and application-ready stores.",
    promise:
      "Replace fragile scripts and manual transfers with observable, recoverable data movement.",
    promiseDetail:
      "A pipeline is reliable only when freshness, schema changes, retries, ownership, and backfills are designed into it. We build those operating controls alongside the data flow itself.",
    deliverables: [
      { title: "Source ingestion", description: "Collect data from databases, APIs, files, events, and SaaS platforms with clear extraction and change-capture patterns." },
      { title: "Batch & streaming flows", description: "Select the right movement pattern for the required latency instead of forcing every workload into the same architecture." },
      { title: "Orchestration & recovery", description: "Coordinate dependencies, retries, backfills, idempotency, and failure handling so interrupted runs can recover safely." },
      { title: "Pipeline observability", description: "Track freshness, volume, runtime, failures, and lineage with alerts tied to meaningful service expectations." },
    ],
    process: [
      { title: "Map sources and consumers", description: "Document ownership, update patterns, volumes, latency needs, dependencies, and downstream use." },
      { title: "Design the movement contract", description: "Define schemas, checkpoints, load behavior, recovery rules, and freshness expectations before implementation." },
      { title: "Build for replay", description: "Make loads idempotent, preserve raw history where needed, and test retries, late data, and backfills." },
      { title: "Operate with evidence", description: "Monitor service levels, investigate weak points, and improve cost and throughput from production measurements." },
    ],
    outcomes: ["Predictable data freshness", "Recoverable failures and backfills", "Visible pipeline ownership", "Less manual data movement"],
    technologies: ["Apache Airflow", "Apache Kafka", "AWS Glue", "Python", "SQL", "dbt", "Amazon S3", "PostgreSQL"],
    metadataDescription: "Reliable batch and streaming data pipelines with orchestration, recovery, observability, and dependable delivery.",
  },
  "etl-elt": {
    slug: "etl-elt",
    name: "ETL & ELT",
    eyebrow: "Data engineering · ETL & ELT",
    title: "Turn source data into models people can actually use.",
    introduction:
      "We design ETL and ELT workflows that clean, standardize, join, and document raw data for analytics, reporting, and operational use.",
    promise:
      "Make transformation logic consistent, testable, and understandable across the organization.",
    promiseDetail:
      "Moving data is not enough. Teams need shared definitions, traceable transformations, controlled releases, and tests that catch incorrect results before they reach a dashboard or model.",
    deliverables: [
      { title: "Transformation architecture", description: "Choose ETL, ELT, or a hybrid approach based on source limits, warehouse capabilities, governance, and latency." },
      { title: "Reusable data models", description: "Create staged, intermediate, and business-ready models with consistent dimensions, measures, and naming." },
      { title: "Automated testing", description: "Validate uniqueness, completeness, relationships, accepted values, and business rules as part of every run." },
      { title: "Documentation & lineage", description: "Record model definitions, owners, dependencies, and field-level meaning so changes can be understood and reviewed." },
    ],
    process: [
      { title: "Profile the source data", description: "Measure shape, completeness, duplicates, change patterns, and exceptions before writing transformations." },
      { title: "Define business rules", description: "Agree on calculations, identifiers, history handling, and ownership with the people who use the result." },
      { title: "Build modular models", description: "Implement small, testable transformations with version control, review, and deployment discipline." },
      { title: "Validate with consumers", description: "Reconcile results against source systems and real reporting cases before promoting models for wider use." },
    ],
    outcomes: ["Shared business definitions", "Tested transformation logic", "Traceable model dependencies", "Faster analytics development"],
    technologies: ["dbt", "SQL", "Python", "Snowflake", "PostgreSQL", "AWS Glue", "Apache Spark", "GitHub Actions"],
    metadataDescription: "ETL and ELT workflows that transform raw source data into tested, documented, business-ready models.",
  },
  "data-warehousing": {
    slug: "data-warehousing",
    name: "Data Warehousing",
    eyebrow: "Data engineering · Data warehousing",
    title: "One dependable foundation for analytics and reporting.",
    introduction:
      "We design and implement cloud data warehouses that organize fragmented operational data into governed, query-ready models.",
    promise:
      "Give teams a shared source of truth without creating an expensive, opaque data platform.",
    promiseDetail:
      "A useful warehouse balances performance, cost, security, history, and ease of use. We shape the architecture around actual workloads and ownership—not a generic reference diagram.",
    deliverables: [
      { title: "Warehouse architecture", description: "Define storage, compute, environments, ingestion zones, transformation layers, and workload separation." },
      { title: "Dimensional modeling", description: "Create facts, dimensions, marts, and historical models that reflect how the business measures performance." },
      { title: "Security & governance", description: "Apply role-based access, sensitive-data controls, auditability, retention, and clear data ownership." },
      { title: "Performance & cost controls", description: "Tune queries, partitioning, clustering, materialization, and compute usage against real demand." },
    ],
    process: [
      { title: "Prioritize the workloads", description: "Start from the reports, analyses, users, and service expectations the warehouse must support." },
      { title: "Design the data layers", description: "Separate raw, standardized, and business-ready data with explicit contracts between each layer." },
      { title: "Migrate incrementally", description: "Deliver useful subject areas in controlled stages while reconciling results with existing systems." },
      { title: "Tune from production use", description: "Measure query behavior, concurrency, storage, and cost, then optimize the patterns that matter." },
    ],
    outcomes: ["A governed source of truth", "Faster and more consistent reporting", "Controlled access to sensitive data", "Visible platform cost and performance"],
    technologies: ["Snowflake", "Amazon Redshift", "Google BigQuery", "Microsoft Fabric", "dbt", "PostgreSQL", "SQL", "Terraform"],
    metadataDescription: "Cloud data warehouse architecture, modeling, governance, performance, and cost controls for trusted analytics.",
  },
  "data-integration": {
    slug: "data-integration",
    name: "Data Integration",
    eyebrow: "Data engineering · Data integration",
    title: "Connect the systems your business already depends on.",
    introduction:
      "We integrate APIs, databases, files, SaaS platforms, and internal applications so information moves reliably between operational and analytical systems.",
    promise:
      "Create stable connections without hiding brittle assumptions behind a connector.",
    promiseDetail:
      "Production integrations must handle authentication, rate limits, schema drift, duplicates, partial failure, and changing vendor APIs. We make those constraints explicit and observable.",
    deliverables: [
      { title: "API integrations", description: "Build secure connections to REST, GraphQL, webhook, and partner interfaces with managed authentication and rate limits." },
      { title: "Database & file exchange", description: "Move data between operational stores, warehouses, object storage, SFTP, and structured file formats." },
      { title: "SaaS connectivity", description: "Connect CRM, finance, support, marketing, and other business platforms with maintainable data contracts." },
      { title: "Reconciliation & monitoring", description: "Detect missing, duplicated, delayed, or rejected records and provide a clear path to resolution." },
    ],
    process: [
      { title: "Define the system boundary", description: "Identify systems of record, ownership, permitted data, direction of travel, and timing requirements." },
      { title: "Specify the contract", description: "Document fields, identifiers, mappings, validation, authentication, and failure behavior for each connection." },
      { title: "Test hostile conditions", description: "Exercise timeouts, rate limits, duplicate events, malformed records, credential expiry, and replay." },
      { title: "Release with monitoring", description: "Deploy gradually with reconciliation, alerting, runbooks, and accountable owners on both sides." },
    ],
    outcomes: ["Systems that share consistent data", "Fewer manual imports and exports", "Traceable transfer failures", "Maintainable integration contracts"],
    technologies: ["REST APIs", "GraphQL", "Apache Kafka", "Airbyte", "Fivetran", "Python", "PostgreSQL", "AWS"],
    metadataDescription: "Reliable data integration across APIs, databases, files, SaaS platforms, and internal business systems.",
  },
  "data-quality": {
    slug: "data-quality",
    name: "Data Quality",
    eyebrow: "Data engineering · Data quality",
    title: "Catch unreliable data before the business has to.",
    introduction:
      "We implement practical data quality controls that measure freshness, completeness, validity, consistency, and reconciliation across critical datasets.",
    promise:
      "Turn data trust from an opinion into an observable operating practice.",
    promiseDetail:
      "More tests do not automatically create better data. Quality controls need owners, meaningful thresholds, business context, and a response process when something fails.",
    deliverables: [
      { title: "Quality rules", description: "Define technical and business checks for required fields, ranges, relationships, duplicates, and expected behavior." },
      { title: "Freshness & volume monitoring", description: "Detect delayed loads, missing partitions, abnormal record counts, and unexpected distribution changes." },
      { title: "Source reconciliation", description: "Compare totals, balances, keys, and critical measures across source systems and analytical models." },
      { title: "Incident workflow", description: "Route failures to accountable owners with severity, context, lineage, and a documented resolution path." },
    ],
    process: [
      { title: "Identify critical data", description: "Prioritize the datasets and fields tied to important decisions, customer experiences, and regulatory obligations." },
      { title: "Set measurable expectations", description: "Agree on dimensions, thresholds, service levels, owners, and acceptable exceptions." },
      { title: "Automate detection", description: "Run checks inside pipelines and transformations, preserve results, and prevent bad data from moving silently." },
      { title: "Improve the failure pattern", description: "Track recurring issues to their source and fix the process, contract, or ownership causing them." },
    ],
    outcomes: ["Earlier detection of bad data", "Clear ownership of quality incidents", "Measurable freshness and completeness", "More trustworthy reporting and models"],
    technologies: ["dbt", "Great Expectations", "Soda", "Monte Carlo", "Python", "SQL", "Snowflake", "OpenLineage"],
    metadataDescription: "Data quality engineering with validation, freshness monitoring, reconciliation, incident ownership, and observable trust metrics.",
  },
};

export const dataServiceSlugs = Object.keys(dataServices) as DataServiceSlug[];

export function isDataServiceSlug(value: string): value is DataServiceSlug {
  return value in dataServices;
}
