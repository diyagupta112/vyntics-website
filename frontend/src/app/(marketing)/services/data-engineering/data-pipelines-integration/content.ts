import type { SubSection } from "@/content/cloud-sub-services/pages";
import type { MigrationEngagementStep } from "@/components/service-sub/migration-engagement-options.data";

export const pipelineService = { key: "data-pipelines-integration", slug: "data-pipelines-integration", name: "Data Pipelines & Integration", keyword: "data pipeline services", seoTitle: "Data Pipeline Services | Vyntics", seoDescription: "Data pipeline services for ETL, ELT, real-time streaming, and data integration across apps, databases, spreadsheets, and APIs.", hero: { title: "Data pipeline services for connected, usable data", introduction: "Move data from scattered apps, databases, and spreadsheets into the destinations your teams rely on.", outcome: "Build dependable flows your team can monitor and maintain.", cta: "Discuss your data pipelines", expectedImage: "/images/services/hero/data.jpg", imageAlt: "Team working with connected data pipeline information" } } as const;

export const pipelineSections: { signs: SubSection; pipelines: SubSection; integrations: SubSection; results: SubSection; related: SubSection } = {
  signs: { id: "pipeline-signs", title: "Signs you need better data pipelines", introduction: "Pipeline problems often show up in the time it takes to prepare information and trust the result.", items: [
    { title: "The same spreadsheet gets rebuilt by hand again and again", description: "Data is moved by hand because no automated ETL or ELT pipeline loads it into one place" },
    { title: "Reports break, or two reports show different numbers", description: "Data may reach reports late or incomplete because pipelines are not scheduled, checked or monitored" },
    { title: "Getting the full picture means opening several different tools", description: "Data stays locked inside individual apps because they are not integrated into one central destination" },
    { title: "Decisions rely on old numbers, and real-time data feels out of reach", description: "Data is refreshed in slow, manual or batch-only runs, so current information is not available when it is needed" },
  ] },
  pipelines: { id: "data-pipeline-services", title: "Our data pipeline services", introduction: "We design pipeline patterns around your sources, destinations, data freshness, and operating ownership.", items: [
    { title: "ETL and ELT pipelines", description: "Build repeatable flows that extract, transform, and load data into a destination your teams can use." },
    { title: "Batch and real-time streaming", description: "Choose a refresh pattern that fits the decisions, events, volume, and latency your business needs." },
    { title: "Pipeline orchestration and scheduling", description: "Coordinate dependencies, schedules, retries, and notifications so pipeline runs are visible and manageable." },
  ] },
  integrations: { id: "data-integration-services", title: "Our data integration services", introduction: "Connect the systems that create business information with the destination where it needs to be understood.", items: [
    { title: "CRMs", description: "Bring customer, lead, and activity data into shared models for reporting and operations." },
    { title: "ERPs", description: "Connect finance, inventory, and operational records with the wider data environment." },
    { title: "Databases", description: "Move structured data from application and legacy databases through reviewable integration flows." },
    { title: "Files", description: "Replace fragile spreadsheet and file handoffs with repeatable, checked ingestion." },
    { title: "Third-party APIs", description: "Integrate external services using documented access, rate, and error-handling requirements." },
  ] },
  results: { id: "pipeline-results", title: "What better pipelines can improve", introduction: "We review outcomes against your starting point and agreed operating requirements rather than assuming a fixed result.", items: [
    { title: "Data freshness", description: "Deliver information on a refresh pattern that matches the decisions your teams need to make." },
    { title: "Hours of manual work saved", description: "Reduce repeated exports, file preparation, and reconciliation across connected systems." },
    { title: "Pipeline reliability", description: "Make failures visible and recovery steps clear through monitoring, checks, and ownership." },
  ] },
  related: { id: "pipeline-related-services", title: "Build on a dependable data foundation", introduction: "Pipelines are one part of a data environment. Explore the services that help teams trust and use what flows through it.", items: [
    { title: "Data Warehousing & Lakehouse", description: "Create a governed destination for reporting, analytics, and shared business definitions.", href: "/services/data-engineering/data-warehousing-lakehouse", linkLabel: "Explore Data Warehousing & Lakehouse" },
    { title: "Data Quality & Governance", description: "Improve the rules, ownership, and checks that keep data reliable and understandable.", href: "/services/data-engineering/data-quality-governance", linkLabel: "Explore Data Quality & Governance" },
  ] },
};

export const pipelineProcess = [
  { title: "Discover sources", visual: "Systems and data", description: "Inventory sources, destinations, owners, access, formats, dependencies, and freshness requirements." },
  { title: "Design", visual: "Flow and controls", description: "Choose the pipeline pattern, transformations, checks, orchestration, and operating responsibilities." },
  { title: "Build", visual: "Working pipeline", description: "Implement the agreed connections and transformations with reviewable configuration and documentation." },
  { title: "Test", visual: "Validated data", description: "Check completeness, accuracy, failure handling, performance, and the results in the destination." },
  { title: "Monitor", visual: "Ongoing operation", description: "Track pipeline runs, freshness, failures, and ownership so issues can be acted on quickly." },
] as const;

export const pipelineEngagements: readonly MigrationEngagementStep[] = [
  { id: "pipeline-audit", number: "01", icon: "assess", title: "Pipeline audit", problem: "We need to understand where our data flows are failing.", description: "Review sources, destinations, schedules, failures, ownership, and priorities before changing the pipeline environment.", bullets: ["Source and destination review", "Failure and freshness findings", "Prioritized next-step plan"] },
  { id: "pipeline-build", number: "02", icon: "migrate", title: "Pipeline build", problem: "We need new or improved data flows.", description: "Build and validate the agreed connections, transformations, orchestration, and monitoring around your data needs.", bullets: ["Agreed pipeline scope", "Transformation and validation checks", "Documentation and handover"] },
  { id: "managed-pipelines", number: "03", icon: "manage", title: "Managed pipelines", problem: "We want help keeping pipelines reliable.", description: "Discuss ongoing monitoring, issue response, improvements, and ownership for the pipeline environment.", bullets: ["Run and freshness monitoring", "Failure and change support", "Agreed improvement priorities"] },
];

export const pipelineFaqs = [
  { question: "What is the difference between ETL and ELT?", answer: "ETL transforms data before loading it into a destination. ELT loads data first and applies transformations in the destination. The right approach depends on your data, platform, governance, performance, and team ownership." },
  { question: "How long does it take to build a data pipeline?", answer: "Timing depends on the number and condition of sources, transformations, destination, freshness needs, testing, access, and review cycles. We assess those dependencies before agreeing a delivery plan." },
  { question: "Can you connect our CRM, ERP and other tools?", answer: "Yes. We can connect CRMs, ERPs, databases, files, and third-party APIs where the required access, interfaces, data definitions, and security controls are available." },
  { question: "Do you support real-time data?", answer: "We can assess batch and streaming patterns against your event volume, latency needs, source capabilities, destination, and operating requirements." },
  { question: "What happens when a pipeline fails?", answer: "A maintainable pipeline should make failures visible, preserve useful logs and context, define retry or recovery behavior, and have clear ownership for investigation." },
  { question: "How much does data pipeline development cost?", answer: "Cost depends on sources, transformations, destination, data volume, refresh pattern, testing, monitoring, and support. We clarify the scope and responsibilities before preparing an estimate." },
] as const;

export const pipelineTools = ["Databricks", "Apache Airflow", "dbt", "Fivetran", "Airbyte", "Kafka", "AWS Glue", "Azure Data Factory"] as const;

export const pipelineToolDetails = [
  { name: "Databricks", description: "Build, schedule, and monitor data pipelines on a lakehouse platform that also supports analytics and AI workloads." },
] as const;
