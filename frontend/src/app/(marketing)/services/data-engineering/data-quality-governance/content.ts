import type { SubSection } from "@/content/cloud-sub-services/pages";
import type { MigrationEngagementStep } from "@/components/service-sub/migration-engagement-options.data";

export const qualityService = { key: "data-quality-governance", slug: "data-quality-governance", name: "Data Quality & Governance", keyword: "data quality services", seoTitle: "Data Quality Services | Vyntics", seoDescription: "Data quality services and data governance consulting for profiling, cleansing, ownership, access control, lineage, observability, and trusted reporting.", hero: { title: "Data quality services for numbers your team can trust", introduction: "Improve the quality, ownership, and controls around the data your teams use for reporting, operations, and AI.", outcome: "Make data issues visible before they become business problems.", cta: "Discuss your data quality", expectedImage: "/images/services/hero/data.jpg", imageAlt: "Team reviewing data quality and governance information" } } as const;

export const qualitySections: { signs: SubSection; quality: SubSection; governance: SubSection; observability: SubSection; results: SubSection; related: SubSection } = {
  signs: { id: "quality-signs", title: "Signs of a data quality problem", introduction: "Trust in data is difficult to maintain when records, definitions, and ownership are unclear.", items: [
    { title: "One customer shows up several times, and nobody knows which is right", description: "Duplicate records are created when systems and teams enter or import the same data without matching rules." },
    { title: "People open records and find important details left blank", description: "Fields may be optional or entered inconsistently, with no validation checks at the point of data entry." },
    { title: "Two reports on the same topic show different numbers", description: "Reports may draw on different sources, rules or definitions, and nobody has agreed which version is correct." },
    { title: "Teams double-check every number before they will act on it", description: "Data quality is not measured or monitored, so errors are found late, usually by the people using the data." },
  ] },
  quality: { id: "data-quality-services", title: "Our data quality services", introduction: "We help teams understand, improve, and continuously check the quality of the data they rely on.", items: [
    { title: "Data profiling", description: "Inspect completeness, consistency, patterns, and anomalies so priorities are based on evidence." },
    { title: "Validation rules", description: "Define checks for the fields, relationships, and thresholds that matter to your business." },
    { title: "Cleansing and deduplication", description: "Resolve inconsistent records and duplicates with agreed rules and reviewable decisions." },
    { title: "Automated quality checks", description: "Run repeatable checks as data moves through pipelines and before it reaches reporting or AI." },
  ] },
  governance: { id: "data-governance-services", title: "Our data governance services", introduction: "Establish practical ownership, access, and lineage so data can be understood and handled responsibly.", items: [
    { title: "Data catalog", description: "Create a clearer view of important data assets, definitions, owners, and intended use." },
    { title: "Data ownership", description: "Agree who maintains key data, resolves issues, and approves changes to shared definitions." },
    { title: "Access control", description: "Shape access around users, roles, sensitivity, and the systems that need to handle data." },
    { title: "Data lineage", description: "Trace how important data moves and changes from source through reporting and AI workflows." },
    { title: "Compliance", description: "Support practical data controls relevant to requirements such as GDPR and India's DPDP Act, without replacing legal advice." },
  ] },
  observability: { id: "data-observability", title: "Data observability", introduction: "Monitoring and alerts can catch bad data before it reaches reports or AI workflows.", items: [
    { title: "Monitor data health", description: "Track freshness, volume, schema, distributions, and quality signals across important data flows." },
    { title: "Detect issues early", description: "Surface unexpected changes and failed checks while there is still time to investigate the cause." },
    { title: "Alert the right owners", description: "Route useful context to the people responsible for resolving a data issue and protecting downstream work." },
  ] },
  results: { id: "quality-results", title: "What better data quality can improve", introduction: "We review outcomes against your starting point and agreed requirements rather than assuming a fixed result.", items: [
    { title: "Fewer data errors", description: "Find and resolve issues before they affect important reports, operations, or AI workflows." },
    { title: "Fewer duplicates", description: "Improve the consistency of shared records with clearer rules, ownership, and checks." },
    { title: "Less manual checking", description: "Automate repeatable validation and monitoring so teams can focus on decisions and improvements." },
  ] },
  related: { id: "quality-related-services", title: "Connect quality with the wider data foundation", introduction: "Good governance depends on dependable data flows and a destination your teams can use.", items: [
    { title: "Data Pipelines & Integration", description: "Build dependable flows that move data from applications, databases, files, and APIs.", href: "/services/data-engineering/data-pipelines-integration", linkLabel: "Explore Data Pipelines & Integration" },
    { title: "Data Warehousing & Lakehouse", description: "Create a governed destination for reporting, analytics, and AI workloads.", href: "/services/data-engineering/data-warehousing-lakehouse", linkLabel: "Explore Data Warehousing & Lakehouse" },
  ] },
};

export const qualityProcess = [
  { title: "Assess", visual: "Current data health", description: "Review sources, definitions, ownership, access, issues, and the data products that matter most." },
  { title: "Define rules", visual: "Agreed standards", description: "Agree quality checks, business definitions, owners, thresholds, and handling for important data." },
  { title: "Clean", visual: "Resolved records", description: "Profile, cleanse, standardise, and deduplicate data with reviewable decisions and controls." },
  { title: "Automate", visual: "Repeatable checks", description: "Add validation, lineage, catalog, and workflow controls where they can prevent repeated problems." },
  { title: "Monitor", visual: "Ongoing trust", description: "Track quality signals, alert owners, and improve controls as sources and requirements change." },
] as const;

export const qualityEngagements: readonly MigrationEngagementStep[] = [
  { id: "quality-audit", number: "01", icon: "assess", title: "Data quality audit", problem: "We need to understand why our numbers cannot be trusted.", description: "Review important sources, issues, definitions, ownership, and controls before deciding what to fix first.", bullets: ["Source and data health review", "Priority quality findings", "Practical next-step plan"] },
  { id: "governance-setup", number: "02", icon: "migrate", title: "Governance setup", problem: "We need clearer ownership and data controls.", description: "Establish agreed definitions, ownership, access, lineage, and quality checks around the data that matters.", bullets: ["Governance scope and rules", "Ownership and access model", "Catalog and quality checks"] },
  { id: "quality-monitoring", number: "03", icon: "manage", title: "Ongoing monitoring", problem: "We want data issues caught earlier.", description: "Discuss monitoring, alerts, issue response, and continuous improvement for important data flows.", bullets: ["Quality and freshness monitoring", "Issue response support", "Agreed improvement priorities"] },
];

export const qualityFaqs = [
  { question: "What is the difference between data quality and data governance?", answer: "Data quality focuses on whether data is accurate, complete, consistent, timely, and fit for use. Data governance defines the ownership, rules, access, definitions, and controls that help maintain that quality." },
  { question: "How do you measure data quality?", answer: "We define measures around the data and decisions that matter, such as completeness, validity, uniqueness, consistency, freshness, and accuracy. The useful checks depend on your sources and business rules." },
  { question: "How long does a data quality audit take?", answer: "Timing depends on the number of sources, data products, owners, access, and depth of review. We scope the audit around your priority data and the questions you need answered." },
  { question: "Can you fix our existing bad data?", answer: "We can help profile, cleanse, standardise, deduplicate, and validate data when the rules and ownership for those decisions are agreed." },
  { question: "How do you help with data compliance like GDPR or the DPDP Act?", answer: "We can help establish practical data ownership, access, catalog, lineage, and handling controls relevant to your requirements. This work does not replace legal advice or a formal compliance assessment." },
  { question: "Do we need a data catalog?", answer: "A catalog can be useful when teams need a shared view of important data assets, definitions, owners, lineage, and permitted use. We assess whether it is appropriate for your size, sources, and governance needs." },
] as const;

export const qualityTools = [
  { name: "Databricks Unity Catalog", description: "Organise access, discovery, and governance for data and AI assets in a Databricks environment." },
  { name: "Great Expectations", description: "Define and run expectations that check important data before it reaches downstream users." },
  { name: "dbt tests", description: "Add model and relationship checks close to transformation logic and shared data definitions." },
  { name: "Monte Carlo", description: "Monitor data reliability signals and help teams investigate issues across the data environment." },
  { name: "Collibra", description: "Support catalog, governance, ownership, and lineage workflows around governed data assets." },
  { name: "Alation", description: "Create a searchable context for data definitions, ownership, and how teams use important assets." },
] as const;
