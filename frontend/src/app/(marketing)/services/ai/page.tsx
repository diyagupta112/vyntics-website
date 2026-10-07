import type { Metadata } from "next";
import Link from "next/link";
import { AiSolutionsServicesShowcase } from "@/components/pages/ai-solutions-services-showcase";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { Container } from "@/components/ui/container";
import { articles } from "@/content/articles";
import { getProject } from "@/content/projects";
import styles from "../data/page.module.css";

export const metadata: Metadata = {
  title: "AI Solutions",
  description: "Custom AI solutions including RAG assistants, AI agents, document automation, workflow automation, and production LLM integrations.",
};

const problems = [
  { title: "Knowledge stays trapped", description: "People search across documents and systems, ask the same questions repeatedly, and still cannot verify the answer." },
  { title: "Manual work does not scale", description: "Document review, classification, drafting, and system updates consume time without improving the decision itself." },
  { title: "AI pilots never reach production", description: "Promising demos fail on permissions, evaluation, integration, reliability, ownership, or operating cost." },
  { title: "Automation creates hidden risk", description: "Models act without clear limits, approval gates, traceability, or a dependable path for exceptions." },
] as const;

const reasons = [
  { title: "Use case before model", description: "We define the user, decision, evidence, workflow, risk, and measurable outcome before choosing a model or framework." },
  { title: "Evaluation from the start", description: "Retrieval, answer quality, structured outputs, tool use, safety, latency, and cost are tested against representative cases." },
  { title: "Control is part of the design", description: "Permissions, human approval, audit trails, uncertainty, refusals, and recovery paths are built into the operating workflow." },
  { title: "Direct technical delivery", description: "The engineers shaping the architecture stay involved through integration, production release, monitoring, and handover." },
] as const;

const platforms = [
  { name: "OpenAI", role: "Language models", description: "Reasoning, generation, structured outputs, embeddings, and tool use across production AI workloads." },
  { name: "Azure AI", role: "Enterprise AI", description: "Governed model access and document intelligence for organizations operating in the Microsoft ecosystem." },
  { name: "Anthropic", role: "Language models", description: "Long-context reasoning and generation for knowledge, analysis, and controlled agent workflows." },
  { name: "Pinecone & Qdrant", role: "Vector retrieval", description: "Scalable semantic search, metadata filtering, and retrieval across enterprise knowledge collections." },
  { name: "LangGraph & LangChain", role: "AI orchestration", description: "Stateful agent workflows, retrieval pipelines, tool coordination, tracing, and human checkpoints." },
  { name: "FastAPI & PostgreSQL", role: "Application foundation", description: "Typed APIs, durable data, audit records, permissions, and integration with existing products and systems." },
] as const;

const process = [
  { title: "Assess", visual: "Use case and evidence", description: "Identify the user problem, workflow, available knowledge, integration boundaries, risk, and evidence of value." },
  { title: "Design", visual: "Architecture and controls", description: "Define models, retrieval, tools, permissions, evaluation, approval gates, failure behaviour, and ownership." },
  { title: "Build", visual: "Grounded AI system", description: "Deliver the smallest useful production slice with integrations, observability, tests, and representative evaluation data." },
  { title: "Validate", visual: "Quality and safety", description: "Test accuracy, citations, tool use, edge cases, latency, cost, security, and the complete human workflow." },
  { title: "Operate", visual: "Monitor and improve", description: "Track real usage, failures, quality drift, content freshness, spend, feedback, and controlled model changes." },
] as const;

const measures = ["Task success", "Answer accuracy", "Citation quality", "Manual work removed", "Exception rate", "Latency and cost"] as const;

const faqs = [
  { question: "What do custom AI solutions include?", answer: "They can include grounded knowledge assistants, tool-using agents, document processing, workflow automation, and language-model features integrated into existing software. The right solution depends on the decision or task—not on adding a chatbot everywhere." },
  { question: "How do you reduce hallucinations?", answer: "We constrain models with approved evidence, retrieval and reranking, structured outputs, validation rules, explicit refusals, citations, representative evaluation sets, and human review where an incorrect result carries material risk." },
  { question: "Can AI use our private company data securely?", answer: "Yes, when identity, permissions, retrieval boundaries, provider data policies, encryption, logging, retention, and deployment architecture are designed correctly. Security cannot be added after the assistant is already connected to sensitive sources." },
  { question: "How long does an AI project take?", answer: "A focused assessment or prototype can take weeks. A production system with integrations, permissions, evaluation, and operational controls usually takes longer. Any precise estimate before reviewing the data and workflow is guesswork." },
  { question: "Which AI models and platforms do you use?", answer: "We work with OpenAI, Azure AI, Anthropic, vector platforms such as Pinecone and Qdrant, orchestration tools including LangGraph and LangChain, and production application stacks built with Python, FastAPI, PostgreSQL, and cloud infrastructure." },
  { question: "How do we know whether the AI is delivering value?", answer: "We agree on operating measures before implementation: task success, answer and citation quality, manual work removed, exception rates, cycle time, latency, adoption, and cost. Model benchmarks alone do not prove business value." },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export default function AiSolutionsPage() {
  const project = getProject("compliance-rag-chatbot");
  const relatedInsights = articles.filter((article) => article.category === "AI");

  return (
    <>
      <section className={styles.hero} aria-labelledby="ai-solutions-title">
        <Container>
          <Link className={styles.backLink} href="/#services">← All services</Link>
          <p className={styles.eyebrow}>AI solutions</p>
          <h1 id="ai-solutions-title">Build AI your business can verify and control.</h1>
          <p className={styles.heroIntro}>We build grounded assistants, capable agents, and intelligent automation around your data, systems, permissions, and operating reality.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#contact">Discuss your AI use case <ArrowIcon /></a>
            <a className={styles.secondaryLink} href="#ai-services">Explore our solutions</a>
          </div>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="problems-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>AI problems we solve</p><h2 id="problems-title">The hard part starts after the demo works.</h2><p>We focus on the data, controls, integrations, and operating discipline required to make AI useful in production.</p></div>
          <div className={styles.problemGrid}>{problems.map((problem, index) => <article key={problem.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{problem.title}</h3><p>{problem.description}</p></article>)}</div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.servicesSection}`} id="ai-services" aria-labelledby="services-title">
        <Container><AiSolutionsServicesShowcase /></Container>
      </section>

      <section className={styles.section} aria-labelledby="why-title">
        <Container className={styles.whyLayout}>
          <div className={styles.stickyHeading}><p className={styles.label}>Why Vyntics for AI</p><h2 id="why-title">AI systems designed for accountable use.</h2><p>Convincing output is not enough. Production AI must be measurable, reviewable, secure, and owned.</p></div>
          <div className={styles.reasonList}>{reasons.map((reason, index) => <article key={reason.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{reason.title}</h3><p>{reason.description}</p></div></article>)}</div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.platformSection}`} aria-labelledby="platforms-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>AI platforms we work with</p><h2 id="platforms-title">Choose the stack around the risk and workload.</h2><p>We keep the architecture modular where practical, so one model or vendor does not become the whole system.</p></div>
          <div className={styles.platformGrid}>{platforms.map((platform) => <article key={platform.name}><p>{platform.role}</p><h3>{platform.name}</h3><span>{platform.description}</span></article>)}</div>
          <Link className={styles.inlineLink} href="/technologies">View all technologies <ArrowIcon /></Link>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.processSection}`} aria-labelledby="process-title">
        <Container>
          <div className={`${styles.sectionHeading} ${styles.processHeading}`}><p className={styles.label}>How we work</p><h2 id="process-title">A controlled path from use case to production AI.</h2><p>Five focused stages. One accountable delivery process built around evidence and safe operation.</p></div>
          <ol className={styles.processList}>{process.map((step, index) => <li key={step.title}><article className={styles.processCard}><span>Step {String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.description}</p></article><span className={styles.processMarker} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div className={styles.processVisual} aria-hidden="true"><svg viewBox="0 0 180 100"><path d="M26 50h30m68 0h30M56 50l18-24m-18 24 18 24m50-24-18-24m18 24-18 24" /><circle cx="20" cy="50" r="6" /><circle cx="82" cy="20" r="8" /><circle cx="82" cy="80" r="8" /><rect x="76" y="41" width="28" height="18" rx="4" /><circle cx="112" cy="20" r="8" /><circle cx="112" cy="80" r="8" /><circle cx="160" cy="50" r="6" /></svg><span>{step.visual}</span></div></li>)}</ol>
        </Container>
      </section>

      {project && <section className={`${styles.section} ${styles.caseStudySection}`} aria-labelledby="case-study-title">
        <Container>
          <div className={styles.caseStudyCard}><div><p className={styles.label}>AI case study</p><h2 id="case-study-title">{project.title}</h2><p className={styles.caseSummary}>{project.summary}</p><ul>{project.proofPoints.map((point) => <li key={point}>{point}</li>)}</ul><Link href={`/case-studies/${project.slug}`}>Read the case study <ArrowIcon /></Link></div><div className={styles.caseMeasure}><strong>{project.metric}</strong><span>{project.metricLabel}</span><p>Built with {project.stack.join(", ")}.</p></div></div>
          <div className={styles.measureBar} aria-label="Measures used to evaluate AI results"><p>Results we measure</p><ul>{measures.map((measure) => <li key={measure}>{measure}</li>)}</ul></div>
        </Container>
      </section>}

      <section className={styles.section} aria-labelledby="journey-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>The wider journey</p><h2 id="journey-title">Useful AI needs trusted data—and a real workflow.</h2></div>
          <div className={styles.journeyGrid}>
            <Link href="/services/data"><span>Build the foundation</span><h3>Data Engineering</h3><p>Create reliable pipelines, governed models, and query-ready data for AI to use.</p><strong>Explore data engineering <ArrowIcon /></strong></Link>
            <Link href="/services/crm"><span>Connect the workflow</span><h3>CRM & Revenue Operations</h3><p>Put AI into customer and revenue workflows with clear ownership and measurable outcomes.</p><strong>Explore CRM services <ArrowIcon /></strong></Link>
          </div>
        </Container>
      </section>

      {relatedInsights.length > 0 && <section className={`${styles.section} ${styles.insightsSection}`} aria-labelledby="insights-title">
        <Container><div className={styles.sectionHeading}><p className={styles.label}>Related insights</p><h2 id="insights-title">Practical guidance for AI leaders.</h2></div><div className={styles.insightGrid}>{relatedInsights.map((article) => <a href={article.href} key={article.href}><span>{article.category} · {article.readTime}</span><h3>{article.title}</h3><p>{article.description}</p><strong>Read article <ArrowIcon /></strong></a>)}</div></Container>
      </section>}

      <section className={styles.section} aria-labelledby="faq-title">
        <Container className={styles.faqLayout}><div className={styles.stickyHeading}><p className={styles.label}>Frequently asked questions</p><h2 id="faq-title">Straight answers before the AI project starts.</h2></div><div className={styles.faqList}>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></Container>
      </section>

      <ContactCta eyebrow="AI solutions consultation" title="Ready to turn an AI use case into a working system?" intro="Tell us where knowledge, documents, decisions, or repetitive work are slowing the team down. We’ll identify the practical first step and the evidence needed to scope it properly." submitLabel="Discuss your AI project" />
    </>
  );
}
