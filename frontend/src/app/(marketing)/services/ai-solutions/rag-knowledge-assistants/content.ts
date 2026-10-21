import type { SubSection } from "@/content/cloud-sub-services/pages";
import type { MigrationEngagementStep } from "@/components/service-sub/migration-engagement-options.data";

export const ragService = { key: "rag-knowledge-assistants", slug: "rag-knowledge-assistants", name: "RAG & Knowledge Assistants", keyword: "AI chatbot development services", seoTitle: "AI Chatbot Development Services | Vyntics", seoDescription: "AI chatbot development services for private document search, RAG knowledge assistants, source citations, and practical business workflows.", hero: { title: "AI chatbot development services for your company knowledge", introduction: "Help people find answers in your documents, policies, and knowledge bases with an assistant built around your private business context.", outcome: "Give teams useful answers with the sources and controls to review them.", cta: "Discuss your knowledge assistant", expectedImage: "/images/services/hero/ai.jpg", imageAlt: "Team reviewing an AI knowledge assistant workspace" } } as const;
export const ragSections: { signs: SubSection; builds: SubSection; security: SubSection; integrations: SubSection; results: SubSection; related: SubSection } = {
  signs: { id: "rag-signs", title: "Signs you need an AI knowledge assistant", introduction: "Knowledge work becomes expensive when answers are difficult to find or repeat across teams.", items: [
    { title: "Staff spend too much time searching documents for answers", description: "Company knowledge lives in many folders and tools, and ordinary search cannot find answers from it." },
    { title: "The same support questions are answered repeatedly every day", description: "Answers are not captured in a consistent, searchable knowledge base, so teams repeat the same explanations." },
    { title: "Important knowledge is locked inside PDFs and wikis", description: "Useful context exists, but it is difficult to search in the flow of everyday work." },
    { title: "New employees take too long to find information", description: "Onboarding depends on knowing where information lives and who to ask." },
  ] },
  builds: { id: "rag-builds", title: "What we build", introduction: "Practical AI knowledge assistants shaped around the people, content, and questions they need to handle.", items: [
    { title: "Internal knowledge assistants", description: "Help employees find answers across policies, procedures, documentation, and internal knowledge." },
    { title: "Customer support chatbots", description: "Give customers a useful first response from approved support content and product information." },
    { title: "Compliance and policy assistants", description: "Make approved policies easier to search while keeping access and source context visible." },
    { title: "Document Q&A", description: "Ask questions of private documents and receive answers grounded in the retrieved content." },
  ] },
  security: { id: "rag-accuracy-security", title: "Accuracy & security", introduction: "A useful assistant needs practical controls around its answers, sources, users, and deployment environment.", items: [
    { title: "Answers with source citations", description: "Show the documents or passages used so people can review the context behind an answer." },
    { title: "Guardrails against made-up answers", description: "Test retrieval, prompts, fallback behavior, and failure cases instead of assuming every answer is correct." },
    { title: "Access control", description: "Respect the permissions and content boundaries that apply to the people using the assistant." },
    { title: "Private deployment", description: "Review deployment, data handling, and integration choices around your security requirements." },
  ] },
  integrations: { id: "rag-integrations", title: "Integrations", introduction: "Connect your knowledge assistant to the tools your team already uses.", items: ["Slack", "Microsoft Teams", "Website chat", "WhatsApp", "SharePoint", "Google Drive", "Notion", "Confluence"].map(title => ({ title, description: `Connect approved knowledge and assistant interactions through ${title}.` })) },
  results: { id: "rag-results", title: "What a knowledge assistant can improve", introduction: "We review outcomes against your content, users, and use case rather than assuming a fixed result.", items: [
    { title: "Support tickets reduced", description: "Help people resolve recurring questions earlier with relevant answers and source context." },
    { title: "Time saved finding answers", description: "Reduce the time teams spend searching across documents, wikis, and internal systems." },
    { title: "Answer accuracy", description: "Evaluate retrieval and response quality against the questions and content that matter to your business." },
  ] },
  related: { id: "rag-related-services", title: "Extend your AI foundation", introduction: "Knowledge assistants work alongside AI agents and automation when teams need systems to answer, decide, and act.", items: [
    { title: "AI Agents", description: "Build assistants that can plan and complete multi-step work across connected tools.", href: "/services/ai-solutions/ai-agents", linkLabel: "Explore AI Agents" },
    { title: "Intelligent Automation", description: "Automate document-heavy workflows, approvals, and repetitive operations with AI.", href: "/services/ai-solutions/intelligent-automation", linkLabel: "Explore Intelligent Automation" },
  ] },
};
export const ragProcess = [
  { title: "Discover", visual: "Use case and users", description: "Understand the business use case, users, knowledge sources, access requirements, and desired outcome." },
  { title: "Prepare data", visual: "Organised knowledge", description: "Organise and prepare the documents and knowledge sources the assistant will use." },
  { title: "Build pilot", visual: "Focused assistant", description: "Create a focused assistant around a real use case and representative content." },
  { title: "Evaluate", visual: "Quality and controls", description: "Test answer quality, retrieval, citations, access controls, and failure cases." },
  { title: "Deploy", visual: "Connected channels", description: "Connect the assistant to the required channels and business environment." },
  { title: "Improve", visual: "Feedback loop", description: "Monitor usage and feedback, then improve retrieval, prompts, content, and workflows." },
] as const;
export const ragEngagements: readonly MigrationEngagementStep[] = [
  { id: "rag-pilot", number: "01", icon: "assess", title: "2-week pilot", problem: "We want to test one knowledge use case.", description: "Choose a focused audience, content set, and question pattern to evaluate a practical assistant pilot.", bullets: ["Use case and content scope", "Retrieval and answer evaluation", "Pilot findings and next steps"] },
  { id: "rag-build", number: "02", icon: "migrate", title: "Full build", problem: "We are ready to deploy a knowledge assistant.", description: "Build the agreed assistant, controls, content preparation, integrations, and review process.", bullets: ["Assistant and content scope", "Channel and access integration", "Evaluation and handover"] },
  { id: "rag-support", number: "03", icon: "manage", title: "Ongoing support and improvement", problem: "We want to improve the assistant after launch.", description: "Review feedback, retrieval, content, prompts, usage, and workflows as needs change.", bullets: ["Usage and quality review", "Content and retrieval improvements", "Agreed support priorities"] },
];
export const ragFaqs = [
  { question: "What is RAG (retrieval-augmented generation)?", answer: "RAG retrieves relevant content from a knowledge source before asking an AI model to generate an answer. This gives the response useful business context and allows the assistant to show its sources." },
  { question: "How accurate are the assistant's answers?", answer: "Accuracy depends on the content, retrieval, question patterns, model, access rules, and evaluation process. We test representative questions, citations, and failure cases rather than promising a fixed accuracy rate." },
  { question: "Can it answer from our private documents securely?", answer: "It can be designed around private documents and access controls, subject to the chosen deployment, integrations, permissions, and data-handling requirements." },
  { question: "Which document types can it read?", answer: "The suitable document types depend on the source systems, extraction quality, structure, and content preparation required for your use case." },
  { question: "Can it work inside Slack, Teams or our website?", answer: "Yes, assistants can be connected to channels such as Slack, Microsoft Teams, and website chat when the integration and access requirements are supported." },
  { question: "How much does an AI knowledge assistant cost?", answer: "Cost depends on the use case, content volume, integrations, evaluation, deployment, model, and level of ongoing support. We clarify the scope before preparing an estimate." },
] as const;
export const ragTools = ["OpenAI", "Anthropic Claude", "Google Gemini", "Open-source LLMs", "LangChain", "LlamaIndex", "Pinecone", "pgvector"] as const;
