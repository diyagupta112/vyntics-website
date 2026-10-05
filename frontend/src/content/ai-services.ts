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
    title: "Answers your team can verify, not just trust.",
    introduction:
      "We build retrieval-augmented assistants that answer from approved company knowledge, show the supporting evidence, and make uncertainty visible.",
    promise:
      "Turn scattered documents and internal knowledge into a dependable answer layer.",
    promiseDetail:
      "A useful RAG system is not a chat window connected to a vector database. Retrieval quality, permissions, evaluation, source freshness, and failure handling determine whether people can rely on it.",
    deliverables: [
      { title: "Knowledge ingestion", description: "Connect, clean, split, and index approved documents, wikis, databases, and structured business content." },
      { title: "Hybrid retrieval", description: "Combine semantic search, keyword matching, metadata filters, and reranking to find the strongest evidence." },
      { title: "Cited answers", description: "Constrain responses to retrieved material and link each important claim back to its source." },
      { title: "Evaluation & monitoring", description: "Measure retrieval and answer quality with test sets, feedback signals, trace logs, and freshness checks." },
    ],
    process: [
      { title: "Define the answer boundary", description: "Agree on trusted sources, users, permissions, and questions the assistant should refuse." },
      { title: "Build the retrieval layer", description: "Prepare the content, tune search, and validate that the right passages appear consistently." },
      { title: "Ground and evaluate", description: "Generate from evidence, verify citations, and test against representative questions and edge cases." },
      { title: "Operate in production", description: "Monitor quality, sync changing content, capture feedback, and improve weak queries over time." },
    ],
    outcomes: ["Answers grounded in approved sources", "Verifiable citations at the point of use", "Access controls carried into retrieval", "Visible uncertainty and safe fallbacks"],
    technologies: ["OpenAI", "Azure OpenAI", "Pinecone", "PostgreSQL", "pgvector", "LangChain", "FastAPI", "AWS"],
    technologyIntroduction: "We choose each layer around retrieval quality, security, scale, and the systems you already operate. The stack stays modular, so the assistant is not locked to one model or database.",
    technologyDetails: [
      { name: "OpenAI", role: "Language models", description: "Generates grounded answers, summaries, and structured responses from the evidence retrieved for each question." },
      { name: "Azure OpenAI", role: "Enterprise AI", description: "Supports private, governed model access for organizations already operating within the Microsoft and Azure ecosystem." },
      { name: "Pinecone", role: "Vector search", description: "Stores document embeddings and retrieves semantically relevant passages across large knowledge collections." },
      { name: "PostgreSQL", role: "System of record", description: "Keeps document metadata, user feedback, access rules, evaluations, and traceable application data together." },
      { name: "pgvector", role: "Integrated retrieval", description: "Adds vector similarity search directly to PostgreSQL when a simpler, consolidated data layer is the better fit." },
      { name: "LangChain", role: "RAG orchestration", description: "Coordinates ingestion, retrieval, reranking, prompting, citations, and model calls as a testable pipeline." },
      { name: "FastAPI", role: "Application API", description: "Exposes the assistant through secure, typed endpoints that integrate cleanly with web and business applications." },
      { name: "AWS", role: "Cloud infrastructure", description: "Runs the production workload with controlled networking, storage, monitoring, scaling, and operational security." },
    ],
    metadataDescription: "Production RAG assistants with hybrid retrieval, verifiable citations, access controls, evaluation, and monitoring.",
  },
  "ai-agents": {
    slug: "ai-agents",
    name: "AI Agents",
    eyebrow: "Custom AI · AI agents",
    title: "AI that can move work forward—with limits.",
    introduction:
      "We build agents that use approved tools, follow controlled multi-step workflows, and ask for human approval when an action carries real consequence.",
    promise:
      "Move beyond text generation without handing an unpredictable model unlimited control.",
    promiseDetail:
      "Reliable agents need narrow permissions, explicit tools, durable state, observable decisions, and clear stop conditions. We design the workflow around those controls from day one.",
    deliverables: [
      { title: "Tool-connected agents", description: "Give agents carefully scoped access to internal APIs, databases, search, ticketing, and business applications." },
      { title: "Multi-step execution", description: "Plan and complete bounded tasks while preserving context, state, and deterministic business rules." },
      { title: "Human checkpoints", description: "Require review before high-impact actions such as sending, publishing, updating records, or spending money." },
      { title: "Tracing & auditability", description: "Record tool calls, decisions, approvals, outputs, and failures so every run can be inspected." },
    ],
    process: [
      { title: "Choose a bounded job", description: "Start with a workflow that has a clear trigger, permitted actions, success criteria, and owner." },
      { title: "Design tools and controls", description: "Expose only the capabilities the agent needs and define validation, permissions, and approval gates." },
      { title: "Test realistic failure modes", description: "Exercise incomplete data, tool errors, ambiguous requests, retries, and attempts to exceed authority." },
      { title: "Release with supervision", description: "Deploy gradually, review traces, measure completion quality, and expand autonomy only when evidence supports it." },
    ],
    outcomes: ["Controlled actions across existing tools", "Human approval for consequential steps", "Complete traces for review and audit", "Predictable failure and escalation paths"],
    technologies: ["OpenAI", "Azure AI", "LangGraph", "Python", "FastAPI", "PostgreSQL", "Redis", "n8n"],
    metadataDescription: "Controlled AI agents that connect to business tools, execute bounded workflows, and keep humans in charge of high-impact actions.",
  },
  "document-automation": {
    slug: "document-automation",
    name: "Document Automation",
    eyebrow: "Custom AI · Document automation",
    title: "Turn document queues into structured, reviewable work.",
    introduction:
      "We automate document intake, classification, extraction, validation, and exception routing while keeping people focused on the cases that need judgment.",
    promise:
      "Process more documents without hiding errors inside a black box.",
    promiseDetail:
      "Document automation works when extraction is tied to validation and review—not when a model silently guesses. We combine OCR, language models, business rules, and confidence thresholds into one observable pipeline.",
    deliverables: [
      { title: "Intake & classification", description: "Capture files from approved channels, identify document types, and route them into the correct process." },
      { title: "Structured extraction", description: "Extract fields, tables, clauses, and entities into schemas that downstream systems can use." },
      { title: "Validation & exceptions", description: "Check required fields and business rules, score confidence, and send uncertain cases for review." },
      { title: "Review workflows", description: "Give operators the source context, suggested values, and correction controls needed to resolve exceptions quickly." },
    ],
    process: [
      { title: "Map the document set", description: "Identify formats, variations, target fields, volumes, sensitive data, and downstream decisions." },
      { title: "Create a measured baseline", description: "Build representative test samples and define accuracy thresholds field by field." },
      { title: "Automate with validation", description: "Combine extraction models with deterministic checks, confidence policies, and human review." },
      { title: "Integrate and improve", description: "Write validated data into business systems and use corrections to track and improve performance." },
    ],
    outcomes: ["Structured data from unstructured files", "Confidence-based exception routing", "Traceable corrections and source context", "Less repetitive manual review"],
    technologies: ["Azure AI Document Intelligence", "Amazon Textract", "OpenAI", "Python", "FastAPI", "PostgreSQL", "AWS S3", "n8n"],
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
