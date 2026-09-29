export type ServiceContent = {
  slug: "ai" | "data" | "cloud" | "other";
  eyebrow: string;
  title: string;
  introduction: string;
  promise: string;
  offerings: ReadonlyArray<{ title: string; description: string }>;
  outcomes: readonly string[];
  technologies: readonly string[];
};

export const services: Record<ServiceContent["slug"], ServiceContent> = {
  ai: {
    slug: "ai",
    eyebrow: "Custom AI solutions",
    title: "AI that works from your data—and shows its sources.",
    introduction: "We design and build production AI systems grounded in the information, workflows, and controls your organization already relies on.",
    promise: "Useful AI is more than a convincing demo. It needs reliable retrieval, clear evaluation, secure integrations, and a path into the real workflow.",
    offerings: [
      { title: "RAG assistants", description: "Private assistants that answer from approved enterprise content and attach a verifiable citation to every response." },
      { title: "AI agents", description: "Goal-driven systems that connect to existing tools, retrieve context, and carry out controlled workflow steps." },
      { title: "Document automation", description: "Classification, field extraction, exception routing, and review flows for document-heavy operations." },
      { title: "LLM integrations", description: "Backend services and product integrations that make language models useful inside existing software." },
    ],
    outcomes: ["Grounded, cited answers", "Private and auditable workflows", "Human review where it matters", "Production-ready integrations"],
    technologies: ["OpenAI", "Azure AI", "Pinecone", "FastAPI", "PostgreSQL", "AWS Fargate", "Docker"],
  },
  data: {
    slug: "data",
    eyebrow: "Data engineering & analytics",
    title: "A reliable data foundation your teams can agree on.",
    introduction: "We connect scattered sources, automate movement and transformation, and create query-ready data for reporting, analytics, and AI.",
    promise: "A dashboard cannot repair unreliable data. We establish the pipelines, definitions, and controls first, then build the analytics layer on top.",
    offerings: [
      { title: "Data pipelines", description: "Automated ingestion and transformation flows designed around freshness, reliability, and recoverability." },
      { title: "Warehousing", description: "Cloud data models that turn fragmented operational information into a dependable source of truth." },
      { title: "Data integration", description: "Practical connections across APIs, databases, files, SaaS platforms, and internal systems." },
      { title: "Analytics & BI", description: "Decision-ready dashboards, shared KPIs, drill-down reporting, and scheduled executive views." },
    ],
    outcomes: ["Consistent business metrics", "Automated refresh and validation", "Clean, query-ready data", "Reporting teams can trust"],
    technologies: ["Snowflake", "dbt", "Python", "SQL", "PostgreSQL", "Power BI", "Tableau", "Amazon QuickSight"],
  },
  cloud: {
    slug: "cloud",
    eyebrow: "Cloud solutions",
    title: "Cloud infrastructure sized for the work you actually run.",
    introduction: "We design, migrate, and improve cloud systems across AWS, Azure, and Google Cloud with reliability, observability, and cost in view.",
    promise: "The right cloud foundation should be repeatable, understandable, and economical—not over-provisioned or hidden behind unnecessary complexity.",
    offerings: [
      { title: "Cloud architecture", description: "Clear system designs that balance scale, security, reliability, and operational simplicity." },
      { title: "Migration", description: "Planned movement of applications, databases, and workloads with controlled risk and documented decisions." },
      { title: "DevOps & infrastructure", description: "Repeatable environments, automated deployments, and infrastructure defined as code." },
      { title: "Reliability & FinOps", description: "Monitoring, cost visibility, right-sizing, and practical controls for production services." },
    ],
    outcomes: ["Repeatable deployments", "Observable services", "Clear cost visibility", "Documented cloud ownership"],
    technologies: ["AWS", "Microsoft Azure", "Google Cloud", "Terraform", "Kubernetes", "Docker", "Grafana"],
  },
  other: {
    slug: "other",
    eyebrow: "Backend, integrations & advisory",
    title: "The engineering between your systems that makes work flow.",
    introduction: "We build backend services, connect software, automate repetitive processes, and provide hands-on technical direction when a project crosses boundaries.",
    promise: "Not every business problem fits neatly into AI, data, or cloud. We handle the integration and application work required to make the whole system useful.",
    offerings: [
      { title: "Backend services", description: "Production APIs, business logic, databases, and services built for maintainability and real workloads." },
      { title: "System integrations", description: "Reliable connections between CRMs, internal platforms, third-party APIs, and operational tools." },
      { title: "Workflow automation", description: "Practical automation that reduces repetitive work while preserving human control and context." },
      { title: "Technical advisory", description: "Architecture reviews, delivery planning, and hands-on engineering support for important technical decisions." },
    ],
    outcomes: ["Less manual handoff work", "Systems that share context", "Maintainable APIs and services", "Clear technical decisions"],
    technologies: ["Python", "FastAPI", "Node.js", "PostgreSQL", "REST APIs", "Docker", "AWS", "Azure"],
  },
};
