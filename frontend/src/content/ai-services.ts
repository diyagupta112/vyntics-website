export type AiServiceSlug =
  | "rag-assistants"
  | "ai-agents"
  | "document-automation"
  | "workflow-automation"
  | "llm-integrations";

export type AiServiceContent = {
  slug: AiServiceSlug;
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
  technologyIntroduction?: string;
  technologyDetails?: ReadonlyArray<{ name: string; role: string; description: string }>;
  metadataDescription: string;
};

export const aiServices: Record<AiServiceSlug, AiServiceContent> = {
  "rag-assistants": {
    slug: "rag-assistants",
    name: "RAG Assistants",
    eyebrow: "Custom AI · RAG assistants",
    title: "Turn internal enterprise knowledge into instant, verifiable answers.",
    introduction:
      "We build custom retrieval-augmented AI assistants that connect to your proprietary databases, cite exact source documents, and eliminate information bottlenecks across your organization.",
    promise:
      "Convert fragmented company data into a secure, enterprise-grade intelligence engine.",
    promiseDetail:
      "Effective enterprise RAG requires more than basic vector lookup. Granular permissions, context precision, continuous evaluation, and real-time syncing determine whether your team can make critical decisions with confidence.",
    deliverables: [
      { title: "Multi-Source Ingestion", description: "Connect, parse, and structure data across Notion, Confluence, Google Drive, SQL databases, and internal PDFs into clean vector indexes." },
      { title: "Hybrid Semantic Search", description: "Pair dense vector embeddings with sparse keyword search and reranking models for pinpoint retrieval accuracy." },
      { title: "Verifiable Source Attribution", description: "Force models to ground every statement in retrieved chunks, providing direct inline citations to source files." },
      { title: "Observability & Governance", description: "Track latency, hallucination rates, data freshness, and user feedback loops through end-to-end tracing logs." },
    ],
    process: [
      { title: "Scope & Data Governance", description: "Define trusted data sources, user access roles, and strict guardrails for handling restricted or off-topic queries." },
      { title: "Pipeline & Retrieval Tuning", description: "Clean raw data, establish chunking strategies, optimize hybrid search parameters, and validate retrieval accuracy." },
      { title: "Grounding & Evaluation", description: "Enforce strict citations, eliminate hallucinations through systematic evaluation suites, and stress-test edge cases." },
      { title: "Production & Continuous Sync", description: "Deploy securely, set up automated document syncing pipelines, monitor performance, and refine responses based on real user interactions." },
    ],
    outcomes: ["Answers grounded in approved sources", "Verifiable citations at the point of use", "Access controls carried into retrieval", "Visible uncertainty and safe fallbacks"],
    technologies: ["Anthropic & OpenAI", "Azure OpenAI", "Qdrant / Pinecone", "PostgreSQL", "pgvector", "LlamaIndex / LangChain", "FastAPI", "AWS"],
    technologyIntroduction: "We choose each layer around retrieval quality, security, scale, and the systems you already operate. The stack stays modular, so the assistant is not locked to one model or database.",
    technologyDetails: [
      { name: "Anthropic & OpenAI", role: "Language Models", description: "Powers high-reasoning, large-context synthesis with low hallucination rates." },
      { name: "Azure OpenAI", role: "Enterprise AI", description: "Supports private, governed model access for organizations already operating within the Microsoft and Azure ecosystem." },
      { name: "Qdrant / Pinecone", role: "Vector Search", description: "Handles high-throughput similarity search and metadata filtering at scale." },
      { name: "PostgreSQL", role: "System of record", description: "Keeps document metadata, user feedback, access rules, evaluations, and traceable application data together." },
      { name: "pgvector", role: "Integrated retrieval", description: "Adds vector similarity search directly to PostgreSQL when a simpler, consolidated data layer is the better fit." },
      { name: "LlamaIndex / LangChain", role: "RAG Orchestration", description: "Manages complex document indexing, chunking strategies, and retrieval evaluation pipelines." },
      { name: "FastAPI", role: "Application API", description: "Exposes the assistant through secure, typed endpoints that integrate cleanly with web and business applications." },
      { name: "AWS", role: "Cloud infrastructure", description: "Runs the production workload with controlled networking, storage, monitoring, scaling, and operational security." },
    ],
    metadataDescription: "Production RAG assistants with hybrid retrieval, verifiable citations, access controls, evaluation, and monitoring.",
  },
  "ai-agents": {
    slug: "ai-agents",
    name: "AI Agents",
    eyebrow: "Custom AI · AI agents",
    title: "Automate complex enterprise workflows with controlled autonomous agents.",
    introduction:
      "We build intelligent AI agents that integrate with your core stack, execute multi-step operational tasks, and route sensitive decisions to human oversight.",
    promise:
      "Execute complex operational workflows with predictable, governance-first AI agents.",
    promiseDetail:
      "Transforming LLMs into reliable action engines requires robust architecture. We construct agents with scoped execution permissions, state retention, complete observability, and human-in-the-loop safeguards.",
    deliverables: [
      { title: "API & System Integration", description: "Securely bridge agents to CRMs, ERPs, databases, and internal endpoints through granular role-based access." },
      { title: "Deterministic Multi-Step Planning", description: "Break down long-horizon workflows into logical, trackable execution steps without drift." },
      { title: "Human-in-the-Loop Governance", description: "Insert explicit approval gates for high-risk operations like database updates or external communications." },
      { title: "End-to-End Execution Auditing", description: "Capture complete decision trees, API payloads, and execution logs for compliance and troubleshooting." },
    ],
    process: [
      { title: "Workflow & Boundary Definition", description: "Target a specific operational process with clear trigger conditions, acceptable action scopes, and success metrics." },
      { title: "Tooling & Governance Design", description: "Expose precise API endpoints and establish strict validation rules, role-based controls, and human approval checkpoints." },
      { title: "Stress Testing & Edge Case Validation", description: "Rigorously test agent responses against corrupt data, API timeouts, prompt injection, and permission boundaries." },
      { title: "Phased Deployment & Monitoring", description: "Roll out under live supervision, audit trace logs, track task success rates, and grant additional operational autonomy as performance proves out." },
    ],
    outcomes: ["Controlled actions across existing tools", "Human approval for consequential steps", "Complete traces for review and audit", "Predictable failure and escalation paths"],
    technologies: ["OpenAI", "Azure AI", "LangGraph", "Python", "FastAPI", "PostgreSQL", "Redis", "n8n / Workflows"],
    technologyDetails: [
      { name: "OpenAI", role: "Language Models", description: "Powers multi-step reasoning, task execution, and structured data extraction." },
      { name: "Azure AI", role: "Enterprise AI", description: "Secure, governed enterprise model deployments with strict data privacy controls." },
      { name: "LangGraph", role: "Agent Orchestration", description: "Stateful, cyclic multi-agent workflow management with built-in human-in-the-loop controls." },
      { name: "Python", role: "Core Architecture", description: "Scalable backend scripting and custom tool integration layer." },
      { name: "FastAPI", role: "Application API", description: "High-performance, async REST APIs to trigger and control agent actions." },
      { name: "PostgreSQL", role: "System of Record", description: "Persistent database for operational logs, audit trails, and transactional data." },
      { name: "Redis", role: "State & Caching", description: "Sub-millisecond session memory and short-term state persistence across agent steps." },
      { name: "n8n / Workflows", role: "Automation Layer", description: "Low-code orchestration to connect agents seamlessly across enterprise SaaS apps." },
    ],
    metadataDescription: "Controlled AI agents that connect to business tools, execute bounded workflows, and keep humans in charge of high-impact actions.",
  },
  "document-automation": {
    slug: "document-automation",
    name: "Document Automation",
    eyebrow: "Custom AI · Document automation",
    title: "Automated document parsing with enterprise-grade accuracy.",
    introduction:
      "Transform unstructured PDFs, scans, and emails into structured database inputs with automated field extraction, schema validation, and human-in-the-loop exception handling.",
    promise:
      "Scale document processing with full validation and zero silent errors.",
    promiseDetail:
      "Reliable document intelligence requires more than standard OCR. We build observable, rule-validated extraction pipelines that guarantee data integrity, score extraction confidence, and streamline human verification.",
    deliverables: [
      { title: "Intake & Intelligent Classification", description: "Ingest multi-format files across email, cloud storage, or APIs, automatically categorizing documents into operational workflows." },
      { title: "Precision Schema Extraction", description: "Extract complex tables, key-value pairs, nested clauses, and unstructured metadata directly into clean JSON database schemas." },
      { title: "Rules Engine & Validation", description: "Cross-reference extracted data against custom business rules, syntax guidelines, and historical records to tag low-confidence fields." },
      { title: "Human-in-the-Loop Review", description: "Empower review teams with side-by-side document views, auto-highlighted fields, and single-click correction tools." },
    ],
    process: [
      { title: "Document & Schema Mapping", description: "Audit document types, structural variations, target data fields, processing volumes, and compliance rules." },
      { title: "Precision Benchmarking", description: "Construct representative test sets and establish strict accuracy baselines for every extracted data point." },
      { title: "Hybrid Extraction & Validation", description: "Deploy OCR and LLM pipelines paired with deterministic business logic and confidence scoring models." },
      { title: "Downstream Sync & Learning Loops", description: "Deliver clean data into enterprise CRMs/ERPs and feed operator corrections back into system optimization." },
    ],
    outcomes: ["Structured data from unstructured files", "Confidence-based exception routing", "Traceable corrections and source context", "Less repetitive manual review"],
    technologies: ["Azure AI Document Intelligence", "Amazon Textract", "OpenAI / LLMs", "Python", "FastAPI", "PostgreSQL", "AWS S3", "n8n / Workflows"],
    technologyDetails: [
      { name: "Azure AI Document Intelligence", role: "Document AI", description: "Advanced layout parsing, table extraction, and pre-built form processing." },
      { name: "Amazon Textract", role: "OCR Engine", description: "High-precision text and tabular data extraction from scanned documents and PDFs." },
      { name: "OpenAI / LLMs", role: "Language Models", description: "Normalizes unstructured text outputs and handles complex multi-page document reasoning." },
      { name: "Python", role: "Core Pipeline", description: "Handles custom parsing rules, schema validation, and backend business logic." },
      { name: "FastAPI", role: "REST API", description: "Connects document processing pipelines cleanly to frontend web applications and external enterprise apps." },
      { name: "PostgreSQL", role: "Database", description: "Stores extracted structured payloads, field metadata, confidence scores, and audit logs." },
      { name: "AWS S3", role: "Object Storage", description: "Secure, encrypted storage for raw document files, processed renders, and output attachments." },
      { name: "n8n / Workflows", role: "Automation Layer", description: "Automates file triggers, email intake routing, and downstream API webhooks." },
    ],
    metadataDescription: "Document automation for classification, extraction, validation, exception handling, and human review workflows.",
  },
  "workflow-automation": {
    slug: "workflow-automation",
    name: "Workflow Automation",
    eyebrow: "Custom AI · Workflow automation",
    title: "Automate repeated work without losing control.",
    introduction:
      "We connect systems, rules, and selective AI into reliable workflows that reduce manual handoffs and keep exceptions visible to the people responsible.",
    promise:
      "Remove repetitive steps while preserving ownership, context, and a clear recovery path.",
    promiseDetail:
      "Not every step needs AI. The strongest automations use deterministic rules where possible, models where judgment or language is required, and people where risk or ambiguity demands them.",
    deliverables: [
      { title: "Process orchestration", description: "Coordinate triggers, decisions, tasks, notifications, and system updates across a complete business process." },
      { title: "System integration", description: "Connect APIs, databases, SaaS tools, files, email, and internal applications without fragile manual handoffs." },
      { title: "AI-assisted decisions", description: "Use models selectively for classification, summarization, extraction, and drafting inside controlled steps." },
      { title: "Exception operations", description: "Route failures and ambiguous cases to the right owner with the context needed to resolve them." },
    ],
    process: [
      { title: "Observe the real workflow", description: "Map triggers, handoffs, workarounds, decision points, failure cases, and current measures." },
      { title: "Separate rules from judgment", description: "Automate deterministic steps directly and use AI only where it adds measurable value." },
      { title: "Build for exceptions", description: "Add idempotency, retries, approvals, alerts, and clear ownership before the happy path goes live." },
      { title: "Measure the operating result", description: "Track cycle time, manual touches, failure rates, and exception causes—not merely run counts." },
    ],
    outcomes: ["Fewer repetitive handoffs", "Clear ownership of exceptions", "Recoverable and observable execution", "Measured improvements in cycle time"],
    technologies: ["n8n", "Temporal", "Python", "Node.js", "FastAPI", "PostgreSQL", "REST APIs", "AWS"],
    metadataDescription: "Reliable workflow automation connecting business systems, deterministic rules, selective AI, human approvals, and exception handling.",
  },
  "llm-integrations": {
    slug: "llm-integrations",
    name: "LLM Integrations",
    eyebrow: "Custom AI · LLM integrations",
    title: "Put language models inside the software people already use.",
    introduction:
      "We add secure, production-ready language capabilities to existing products and business tools without forcing teams into a separate AI destination.",
    promise:
      "Make the model a dependable part of your product architecture—not an isolated demo.",
    promiseDetail:
      "Production integration means more than calling an API. It requires stable contracts, prompt and model versioning, latency and cost controls, safety checks, observability, and graceful degradation.",
    deliverables: [
      { title: "Product features", description: "Add summarization, drafting, search, extraction, classification, and conversational workflows to existing software." },
      { title: "Model gateway", description: "Centralize providers, routing, fallbacks, rate limits, credentials, usage policies, and model changes behind one interface." },
      { title: "Structured generation", description: "Return validated schemas for dependable downstream use instead of passing unstructured text between systems." },
      { title: "Evaluation & observability", description: "Trace requests, compare versions, monitor latency and cost, and test output quality before releases." },
    ],
    process: [
      { title: "Define the product contract", description: "Specify inputs, outputs, latency, privacy boundaries, failure behavior, and quality expectations." },
      { title: "Choose and abstract models", description: "Select models against the workload and isolate provider details behind a maintainable service layer." },
      { title: "Validate every boundary", description: "Use schema validation, policy checks, retries, fallbacks, and evaluation suites around model behavior." },
      { title: "Operate by evidence", description: "Track quality, cost, latency, and user outcomes so model or prompt changes can be made safely." },
    ],
    outcomes: ["AI inside existing user workflows", "Validated outputs for downstream systems", "Provider flexibility and controlled fallbacks", "Observable quality, latency, and cost"],
    technologies: ["OpenAI", "Azure OpenAI", "Anthropic", "Google Gemini", "Python", "TypeScript", "FastAPI", "PostgreSQL"],
    metadataDescription: "Production LLM integrations with structured outputs, provider abstraction, evaluation, observability, and cost controls.",
  },
};

export const aiServiceSlugs = Object.keys(aiServices) as AiServiceSlug[];

export function isAiServiceSlug(value: string): value is AiServiceSlug {
  return value in aiServices;
}
