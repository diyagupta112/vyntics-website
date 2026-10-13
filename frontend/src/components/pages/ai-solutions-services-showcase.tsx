import { DataEngineeringServicesShowcase } from "./data-engineering-services-showcase";

const services = [
  {
    name: "RAG & Knowledge Assistants",
    href: "/services/ai-solutions/rag-knowledge-assistants",
    image: "/images/technology-ai.png",
    imageAlt: "Abstract visualization representing an AI assistant retrieving trusted knowledge.",
    introduction: "Give teams fast answers from approved company knowledge, with the source evidence attached to every important claim.",
  },
  {
    name: "AI Agents",
    href: "/services/ai-solutions/ai-agents",
    image: "/images/about-hero-ai.png",
    imageAlt: "Abstract visualization representing connected AI agents and business systems.",
    introduction: "Build bounded agents that use approved tools, complete multi-step work, and stop for human approval when risk demands it.",
  },
  {
    name: "Intelligent Automation",
    href: "/services/ai-solutions/intelligent-automation",
    image: "/images/technology-data.png",
    imageAlt: "Abstract visualization representing structured document processing.",
    introduction: "Combine document intelligence, workflow orchestration, and language models to remove repetitive work while keeping exceptions visible.",
  },
] as const;

export function AiSolutionsServicesShowcase() {
  return <DataEngineeringServicesShowcase services={services} eyebrow="Our AI solutions" heading="Three focused capabilities, built as one controlled AI system." headingId="services-title" idPrefix="ai-service" label="AI solutions" />;
}
