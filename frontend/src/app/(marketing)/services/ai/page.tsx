import { PublishedServiceBlogs } from "@/components/pages/published-service-blogs";
import type { Metadata } from "next";
import Link from "next/link";
import { AiSolutionsServicesShowcase } from "@/components/pages/ai-solutions-services-showcase";
import { DataEngineeringProcessTimeline } from "@/components/pages/data-engineering-process-timeline";
import { DataPlatformsHoverGrid } from "@/components/pages/data-platforms-hover-grid";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { Container } from "@/components/ui/container";
import { NextServiceBanner } from "@/components/pages/next-service-banner";
import { Suspense } from "react";
import { PublishedServiceCaseStudies } from "@/components/pages/published-service-case-studies";
import { FeaturedCaseStudySkeleton } from "@/components/sections/case-studies/case-study-skeleton";
import reasonStyles from "@/components/pages/service-reason-card.module.css";
import styles from "../data/page.module.css";

export const metadata: Metadata = {
  title: "AI Development Services",
  description: "AI development services for secure knowledge assistants, AI agents, intelligent automation, generative AI, and production LLM integrations.",
  alternates: { canonical: "/services/ai-solutions" },
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

const securityControls = [
  {
    title: "Your data stays private",
    description: "We design explicit boundaries for sensitive data, retention, encryption, provider access, and where each workload is processed.",
  },
  {
    title: "Your data does not train public models",
    description: "We select and configure enterprise model services so submitted business data is not used to train public foundation models.",
  },
  {
    title: "Access follows your permissions",
    description: "Identity, source permissions, retrieval filters, approval gates, and audit records keep people and agents inside authorized limits.",
  },
] as const;

const process = [
  { title: "Discover", visual: "Use case and evidence", description: "Identify the user problem, workflow, available knowledge, integration boundaries, risk, and evidence of value." },
  { title: "Pilot", visual: "Architecture and controls", description: "Test the smallest useful version against representative data, users, permissions, quality measures, and failure cases." },
  { title: "Build", visual: "Production AI system", description: "Turn the proven approach into a dependable system with integrations, observability, tests, and operating controls." },
  { title: "Deploy", visual: "Release and adoption", description: "Release into the real workflow, validate security and performance, train owners, and establish support and recovery paths." },
  { title: "Improve", visual: "Monitor and improve", description: "Track real usage, failures, quality drift, content freshness, spend, feedback, and controlled model changes." },
] as const;

const measures = ["Task success", "Answer accuracy", "Citation quality", "Manual work removed", "Exception rate", "Latency and cost"] as const;

const faqs = [
  { question: "What do AI development services include?", answer: "They can include AI consulting, grounded knowledge assistants, tool-using agents, intelligent document processing, workflow automation, generative AI features, and LLM integrations inside existing software. The right scope starts with a specific business decision or task, not a model." },
  { question: "How do we know if our business is ready for AI?", answer: "You need a defined use case, an accountable owner, usable data or knowledge, access to the systems involved, and a measurable outcome. If those basics are missing, the honest first step is readiness work—not an AI build." },
  { question: "How long does it take to build an AI solution?", answer: "A focused assessment or pilot can take a few weeks. A production system with integrations, permissions, evaluation, security, and operational controls takes longer. Any precise estimate before reviewing the workflow and data is guesswork." },
  { question: "How much does AI development cost?", answer: "Cost depends on data readiness, integrations, security requirements, evaluation depth, user volume, and whether the work is a pilot or a production system. We scope those variables before proposing a budget instead of quoting a meaningless flat price." },
  { question: "Is our data safe when using AI?", answer: "It can be, when identity, permissions, retrieval boundaries, provider data policies, encryption, logging, retention, and deployment architecture are designed correctly. Security cannot be bolted on after sensitive sources are connected." },
  { question: "Which AI models do you work with?", answer: "We work with OpenAI and Azure OpenAI, Anthropic Claude, Google Gemini, and appropriate open-source models, plus retrieval and orchestration platforms such as Pinecone, Qdrant, LangGraph, and LangChain." },
  { question: "How do you reduce hallucinations?", answer: "We constrain models with approved evidence, retrieval and reranking, structured outputs, validation rules, explicit refusals, citations, representative evaluation sets, and human review where an incorrect result carries material risk." },
  { question: "How do we know whether the AI is delivering value?", answer: "We agree on operating measures before implementation: task success, answer and citation quality, manual work removed, exception rates, cycle time, latency, adoption, and cost. Model benchmarks alone do not prove business value." },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export default function AiSolutionsPage() {

  return (
    <>
      <section className={styles.hero} aria-labelledby="ai-solutions-title">
        <Container>
          <Link className={styles.backLink} href="/#services">← All services</Link>
          <p className={styles.eyebrow}>AI solutions</p>
          <h1 id="ai-solutions-title">AI development services your business can verify and control.</h1>
          <p className={styles.heroIntro}>We deliver AI consulting and custom AI solutions—from generative AI and LLM integrations to grounded assistants, capable agents, and intelligent automation—around your data, systems, permissions, and operating reality.</p>
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
          <div className={styles.stickyHeading}><p className={styles.label}>Why choose us</p><h2 id="why-title">AI systems designed for accountable use.</h2><p>Convincing output is not enough. Production AI must be measurable, reviewable, secure, and owned.</p></div>
          <div className={styles.reasonList}>{reasons.map((reason, index) => <article className={reasonStyles.card} key={reason.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{reason.title}</h3><p>{reason.description}</p></div></article>)}</div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.platformSection}`} aria-labelledby="platforms-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>AI platforms we work with</p><h2 id="platforms-title">Choose the stack around the risk and workload.</h2><p>We keep the architecture modular where practical, so one model or vendor does not become the whole system.</p></div>
          <DataPlatformsHoverGrid platforms={platforms} iconVariant="ai" />
          <Link className={styles.inlineLink} href="/technologies">View all technologies <ArrowIcon /></Link>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.securitySection}`} aria-labelledby="security-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>AI security &amp; data privacy</p><h2 id="security-title">Private data stays private. Access stays controlled.</h2><p>Enterprise AI is only useful when the people, models, and tools involved can reach exactly what they need—and nothing more.</p></div>
          <div className={styles.securityGrid}>{securityControls.map((control, index) => <article key={control.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{control.title}</h3><p>{control.description}</p></article>)}</div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.processSection}`} aria-labelledby="process-title">
        <Container>
          <div className={`${styles.sectionHeading} ${styles.processHeading}`}><p className={styles.label}>How we work</p><h2 id="process-title">Discover. Pilot. Build. Deploy. Improve.</h2><p>Five focused stages. One accountable delivery process built around evidence and safe operation.</p></div>
          <DataEngineeringProcessTimeline steps={process} />
        </Container>
      </section>

      <section className={`${styles.section} ${styles.caseStudySection}`} aria-labelledby="case-study-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>CASE STUDIES</p><h2 id="case-study-title">Case studies</h2></div>
          <Suspense fallback={<FeaturedCaseStudySkeleton />}><PublishedServiceCaseStudies service="ai_solutions" /></Suspense>
          <div className={styles.measureBar} aria-label="Measures used to evaluate AI results"><p>Results we measure</p><ul>{measures.map((measure) => <li key={measure}>{measure}</li>)}</ul></div>
        </Container>
      </section>

      <NextServiceBanner id="ai-next" currentService="ai-solutions" sectionClassName={styles.section} />

      <section className={`${styles.section} ${styles.insightsSection}`} aria-labelledby="insights-title">
        <Container><div className={styles.sectionHeading}><p className={styles.label}>Related insights</p><h2 id="insights-title">Practical guidance for AI leaders.</h2></div><Suspense fallback={<p role="status">Loading related insights…</p>}><PublishedServiceBlogs service="ai_solutions" className={styles.insightGrid} /></Suspense></Container>
      </section>

      <section className={styles.section} aria-labelledby="faq-title">
        <Container className={styles.faqLayout}><div className={styles.stickyHeading}><p className={styles.label}>Frequently asked questions</p><h2 id="faq-title">Straight answers before the AI project starts.</h2></div><div className={styles.faqList}>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></Container>
      </section>

      <ContactCta eyebrow="AI solutions consultation" title="Ready to turn an AI use case into a working system?" intro="Tell us where knowledge, documents, decisions, or repetitive work are slowing the team down. We’ll identify the practical first step and the evidence needed to scope it properly." submitLabel="Discuss your AI project" />
    </>
  );
}
