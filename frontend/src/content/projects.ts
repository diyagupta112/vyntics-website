export type Project = {
  slug: string;
  type: string;
  industry: string;
  title: string;
  summary: string;
  metric: string;
  metricLabel: string;
  proofPoints: readonly string[];
  stack: readonly string[];
};

export const projects: readonly Project[] = [
  {
    slug: "compliance-rag-chatbot",
    type: "AI / RAG",
    industry: "Compliance-EdTech · Confidential",
    title: "Compliance RAG Chatbot",
    summary: "A production retrieval-augmented chatbot answering regulatory and compliance questions with a verified citation on every response.",
    metric: "95%+",
    metricLabel: "correct answers",
    proofPoints: ["20K+ documents", "100% answers cited", "Daily freshness"],
    stack: ["AWS Fargate", "Amazon S3", "Pinecone", "PostgreSQL", "FastAPI", "OpenAI"],
  },
  {
    slug: "property-data-platform",
    type: "Data platform",
    industry: "Real estate · Portfolio operations",
    title: "Property Data Platform",
    summary: "A governed data foundation unifying leasing, occupancy, and financial data into one dependable view for portfolio teams.",
    metric: "1 view",
    metricLabel: "of portfolio performance",
    proofPoints: ["Automated ingestion", "Governed metrics", "Role-based access"],
    stack: ["Snowflake", "dbt", "Power BI", "Python", "AWS"],
  },
  {
    slug: "document-processing-automation",
    type: "AI automation",
    industry: "Operations · Document workflows",
    title: "Intelligent Document Processing",
    summary: "An AI-assisted workflow that classifies incoming documents, extracts critical fields, and routes exceptions to the right team.",
    metric: "24/7",
    metricLabel: "automated document intake",
    proofPoints: ["Structured extraction", "Human review queue", "Audit-ready logs"],
    stack: ["Azure AI", "Python", "FastAPI", "PostgreSQL", "Docker"],
  },
  {
    slug: "executive-analytics-hub",
    type: "Analytics / BI",
    industry: "Leadership · Decision intelligence",
    title: "Executive Analytics Hub",
    summary: "A focused analytics layer replacing fragmented reporting with trusted KPIs, drill-down views, and scheduled executive reporting.",
    metric: "Live",
    metricLabel: "decision-ready metrics",
    proofPoints: ["Shared KPI layer", "Automated refresh", "Executive views"],
    stack: ["Power BI", "Tableau", "QuickSight", "SQL", "dbt"],
  },
  {
    slug: "cloud-reliability-platform",
    type: "Cloud platform",
    industry: "Technology · Platform engineering",
    title: "Cloud Reliability Platform",
    summary: "A right-sized cloud foundation with observable services, repeatable deployments, and practical controls for reliability and spend.",
    metric: "Lean",
    metricLabel: "resilient infrastructure",
    proofPoints: ["Repeatable releases", "Cost visibility", "Service monitoring"],
    stack: ["AWS", "Azure", "Terraform", "Kubernetes", "Grafana"],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
