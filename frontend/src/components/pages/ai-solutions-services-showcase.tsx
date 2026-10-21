import { DataEngineeringServicesShowcase } from "./data-engineering-services-showcase";

const services = [
  {
    name: "RAG & Knowledge Assistants",
    href: "/services/ai-solutions/rag-knowledge-assistants",
    image: "/images/technology-ai.png",
    imageAlt: "Robot holding a tablet, illustrating AI assistants.",
    introduction: "Give teams fast answers from approved company knowledge, with the source evidence attached to every important claim.",
  },
  {
    name: "AI Agents",
    href: "/services/ai-solutions/ai-agents",
    image: "/images/services/our-services-section/ai-service-agents.jpg",
    imageAlt: "Team reviewing an AI agent workflow on a laptop.",
    introduction: "Build bounded agents that use approved tools, complete multi-step work, and stop for human approval when risk demands it.",
  },
  {
    name: "Intelligent Automation",
    href: "/services/ai-solutions/intelligent-automation",
    image: "/images/services/our-services-section/ai-service-automation.jpg",
    imageAlt: "Person reviewing a printed document while working at a laptop.",
    introduction: "Combine document intelligence, workflow orchestration, and language models to remove repetitive work while keeping exceptions visible.",
  },
] as const;

export function AiSolutionsServicesShowcase() {
  return <DataEngineeringServicesShowcase services={services} eyebrow="Our AI solutions" heading="Three focused capabilities, built as one controlled AI system." headingId="services-title" idPrefix="ai-service" label="AI solutions" />;
}
