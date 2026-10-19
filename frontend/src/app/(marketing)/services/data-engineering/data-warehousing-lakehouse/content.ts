import type { SubSection } from "@/content/cloud-sub-services/pages";
import type { MigrationEngagementStep } from "@/components/service-sub/migration-engagement-options.data";

export const warehouseService = { key: "data-warehousing-lakehouse", slug: "data-warehousing-lakehouse", name: "Data Warehousing & Lakehouse", keyword: "data warehousing services", seoTitle: "Data Warehousing Services | Vyntics", seoDescription: "Data warehousing services for trusted data models, legacy database migration, performance tuning, and lakehouse foundations for analytics and AI.", hero: { title: "Data warehousing services for one trusted data foundation", introduction: "Bring scattered business data into a central layer your teams can use for reporting, analytics, and AI.", outcome: "Build a data foundation people can understand and maintain.", cta: "Discuss your data foundation", expectedImage: "/images/services/hero/data.jpg", imageAlt: "Team reviewing a central data and analytics workspace" } } as const;

export const warehouseSections: { signs: SubSection; warehousing: SubSection; lakehouse: SubSection; results: SubSection; related: SubSection } = {
  signs: { id: "warehouse-signs", title: "Signs you need a data warehouse", introduction: "A trusted data layer becomes important when reporting and decisions depend on inconsistent or difficult-to-reach information.", items: [
    { title: "Numbers don't match across reports", description: "Different teams use different definitions, sources, or refreshes for the same business measure." },
    { title: "Slow queries", description: "Reports and analysis take too long because the current data environment is difficult to query efficiently." },
    { title: "Data spread across tools", description: "Business information remains in separate systems without a shared, governed destination." },
    { title: "No single source of truth", description: "Teams cannot easily agree which data is current, complete, or appropriate for a decision." },
  ] },
  warehousing: { id: "data-warehousing-services", title: "Our data warehousing services", introduction: "We create a practical data warehouse foundation around your sources, definitions, users, and operating needs.", items: [
    { title: "Warehouse design and data modelling", description: "Shape a maintainable structure for shared business definitions, reporting, analytics, and future change." },
    { title: "Migration from legacy databases", description: "Plan and validate the move from legacy databases while keeping dependencies, access, and data quality visible." },
    { title: "Performance tuning", description: "Review models, queries, refreshes, workloads, and usage patterns to identify practical improvements." },
  ] },
  lakehouse: { id: "lakehouse-services", title: "Our lakehouse services", introduction: "Combine structured and unstructured data in one governed platform for analytics and AI workloads.", items: [
    { title: "A shared data foundation", description: "Bring different data types together with structures and ownership that support reuse." },
    { title: "Analytics-ready data", description: "Prepare trusted data for reporting, exploration, and the models your teams need to develop." },
    { title: "A path to AI", description: "Create a clearer foundation for AI and knowledge use cases without separating them from governed business data." },
  ] },
  results: { id: "warehouse-results", title: "What a trusted data foundation can improve", introduction: "We review outcomes against your starting point and requirements rather than assuming a fixed result.", items: [
    { title: "Query speed", description: "Give teams a more suitable structure for the questions and workloads they need to run." },
    { title: "Reporting time saved", description: "Reduce repeated reconciliation and preparation by using shared definitions and reusable data models." },
    { title: "Storage cost visibility", description: "Make storage, workload, retention, and platform decisions easier to review over time." },
  ] },
  related: { id: "warehouse-related-services", title: "Connect your data foundation to the next stage", introduction: "A warehouse or lakehouse works best with dependable pipelines and clear data quality ownership.", items: [
    { title: "Data Pipelines & Integration", description: "Connect applications, databases, files, and APIs into a dependable data flow.", href: "/services/data-engineering/data-pipelines-integration", linkLabel: "Explore Data Pipelines & Integration" },
    { title: "Data Quality & Governance", description: "Improve ownership, rules, access, and checks so teams can trust the data foundation.", href: "/services/data-engineering/data-quality-governance", linkLabel: "Explore Data Quality & Governance" },
  ] },
};

export const warehouseProcess = [
  { title: "Assess", visual: "Sources and needs", description: "Review sources, users, definitions, workloads, access, and the decisions the data foundation must support." },
  { title: "Model", visual: "Shared structure", description: "Define a maintainable model, business terms, ownership, and the paths data will take through the environment." },
  { title: "Build", visual: "Working foundation", description: "Implement the warehouse or lakehouse structure, access, transformations, and reviewable data checks." },
  { title: "Migrate", visual: "Moved workloads", description: "Move agreed data and reporting workloads with validation, dependency planning, and a clear handover." },
  { title: "Optimise", visual: "Evolving platform", description: "Review performance, usage, storage, cost, and new analytics or AI requirements as the environment grows." },
] as const;

export const warehouseEngagements: readonly MigrationEngagementStep[] = [
  { id: "warehouse-assessment", number: "01", icon: "assess", title: "Warehouse assessment", problem: "We need one trusted place for our data.", description: "Review sources, definitions, workloads, platform choices, and the practical next step for your data foundation.", bullets: ["Source and workload review", "Platform and modelling priorities", "Practical next-step plan"] },
  { id: "warehouse-build", number: "02", icon: "migrate", title: "Build or migration", problem: "We are ready to create or modernise the data foundation.", description: "Build or migrate the agreed warehouse or lakehouse scope with validation and team review.", bullets: ["Agreed foundation scope", "Migration and validation checks", "Documentation and handover"] },
  { id: "warehouse-support", number: "03", icon: "manage", title: "Ongoing support", problem: "We want help as data needs change.", description: "Discuss ongoing support for platform operation, performance, data models, and new analytics or AI needs.", bullets: ["Performance and issue support", "Model and platform review", "Agreed improvement priorities"] },
];

export const warehouseFaqs = [
  { question: "What is the difference between a data warehouse, a data lake and a lakehouse?", answer: "A warehouse is typically structured around governed, queryable business data. A data lake can hold broader raw and processed data types. A lakehouse combines flexible data storage with structures and controls that support analytics and AI. The suitable choice depends on your workloads, users, governance, and operating model." },
  { question: "Which is better: Snowflake, BigQuery or Redshift?", answer: "There is no single best platform for every team. We compare the options against your existing environment, workloads, skills, data location, governance, performance, and cost requirements." },
  { question: "How long does it take to build a data warehouse?", answer: "Timing depends on the number and condition of sources, modelling scope, migration needs, reporting requirements, access, testing, and review cycles. We clarify those dependencies before agreeing a plan." },
  { question: "Can you migrate our existing database to a modern warehouse?", answer: "Yes. We can assess dependencies, map data, plan migration, validate results, and support the transition from an existing database into a suitable modern warehouse or lakehouse." },
  { question: "How much does a cloud data warehouse cost to run?", answer: "Cost depends on platform, storage, query workloads, refresh patterns, retention, users, and operating choices. We review those drivers rather than assuming a fixed monthly cost." },
  { question: "Is our data secure in a cloud data warehouse?", answer: "Security depends on identity, access, network, encryption, data handling, governance, and the platform configuration. We review those requirements as part of the design and operating model." },
] as const;

export const warehousePlatforms = [
  { name: "Databricks", description: "Databricks consulting can help teams plan a lakehouse foundation for structured data, broader analytics, and AI workloads." },
  { name: "Snowflake", description: "Snowflake consulting can cover warehouse design, data modelling, workloads, access, and performance around your operating needs." },
  { name: "Google BigQuery", description: "BigQuery consulting can help teams shape a scalable analytics foundation around Google Cloud data and reporting requirements." },
  { name: "Amazon Redshift", description: "Amazon Redshift services can support warehouse modernisation, workload review, migration, and performance planning on AWS." },
  { name: "Azure Synapse", description: "Azure Synapse can connect warehouse and analytics needs within an existing Microsoft data environment." },
] as const;
