import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Custom AI Solutions",
  description: "Production RAG assistants, AI agents, workflow automation, and AI advisory grounded in your data.",
};

const ragCapabilities = [
  { title: "Knowledge assistants", text: "Give teams one place to ask questions across approved documents, policies, wikis, databases, and internal knowledge." },
  { title: "Verifiable citations", text: "Every answer points back to its supporting source so users can check the evidence instead of trusting a black box." },
  { title: "Hybrid retrieval", text: "Combine semantic understanding, keyword matching, and reranking to handle both meaning and exact business terminology." },
  { title: "Confidence controls", text: "Flag uncertain results and route exceptions for review rather than presenting a weak answer as fact." },
  { title: "Private architecture", text: "Keep access controlled, respect data boundaries, and deploy around the security requirements of your organization." },
  { title: "Production operations", text: "Authentication, logging, monitoring, content freshness checks, and graceful fallbacks are designed in from the start." },
] as const;

const workflow = [
  "Ingest and structure the approved source material.",
  "Retrieve relevant passages using hybrid search and reranking.",
  "Generate an answer constrained by the retrieved evidence.",
  "Validate citations and assess confidence before delivery.",
  "Log the question, answer, and supporting sources for auditability.",
] as const;

const agentCapabilities = [
  { title: "Connected workflows", text: "Link AI to the tools your team already uses so it can retrieve context and move work forward across systems." },
  { title: "Plan and take action", text: "Build controlled multi-step flows that can decide the next permitted action instead of only generating text." },
  { title: "Human approval", text: "Add checkpoints to high-impact steps so automation stays reviewable, reversible, and under your control." },
] as const;

const advisoryCapabilities = [
  { title: "Readiness and use cases", text: "Assess data, workflows, constraints, and likely value before committing budget to a build." },
  { title: "Architecture and build-vs-buy", text: "Choose models, platforms, and integration patterns that suit the workload without unnecessary lock-in." },
  { title: "Prototype to production", text: "Validate the riskiest assumptions quickly, then establish a realistic path to a system your team can own." },
  { title: "Responsible AI", text: "Define evaluation, guardrails, monitoring, and escalation paths before the system reaches real users." },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export default function AiServicePage() {
  return (
    <>
      <section className={styles.hero}>
        <Container>
          <Link className={styles.backLink} href="/#services">← All services</Link>
          <p className={styles.eyebrow}>Service · Custom AI</p>
          <h1>Custom AI, built on your data.</h1>
          <p className={styles.heroCopy}>
            We build production AI grounded in your own information: RAG assistants that return cited answers, plus controlled agentic automation that works across your tools. Private, auditable, and designed for trust.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/#contact">Discuss your use case <ArrowIcon /></Link>
            <Link className={styles.secondaryButton} href="/case-studies/compliance-rag-chatbot">See it in production</Link>
          </div>
          <dl className={styles.stats}>
            <div><dt>95%+</dt><dd>Answer accuracy</dd></div>
            <div><dt>100%</dt><dd>Answers cited</dd></div>
            <div><dt>Private</dt><dd>Your data stays yours</dd></div>
            <div><dt>Prod</dt><dd>Production-ready</dd></div>
          </dl>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="rag-title">
        <Container>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>RAG assistants</p>
            <h2 id="rag-title">A trustworthy answer engine-not another generic chatbot.</h2>
            <p>Retrieval-augmented assistants answer from controlled company knowledge, attach the evidence, and make uncertainty visible.</p>
          </div>
          <div className={styles.featureGrid}>
            {ragCapabilities.map((capability, index) => (
              <article key={capability.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{capability.title}</h3>
                <p>{capability.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.workflowSection} aria-labelledby="workflow-title">
        <Container>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 id="workflow-title">From source material to a cited answer.</h2>
          </div>
          <ol className={styles.workflow}>
            {workflow.map((step, index) => (
              <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>
            ))}
          </ol>
          <ul className={styles.technologyStrip} aria-label="Custom AI technology stack">
            {["OpenAI", "Pinecone", "PostgreSQL", "FastAPI", "AWS", "LangChain", "n8n"].map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Container>
      </section>

      <section className={styles.darkSection} aria-labelledby="agents-title">
        <Container>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Agentic AI & automation</p>
            <h2 id="agents-title">AI that can move work forward-not only answer.</h2>
            <p>We connect agents to real business tools and processes, with approvals, guardrails, and complete logs where the risk demands them.</p>
          </div>
          <div className={styles.agentGrid}>
            {agentCapabilities.map((capability) => (
              <article key={capability.title}><h3>{capability.title}</h3><p>{capability.text}</p></article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="advisory-title">
        <Container>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>AI strategy & advisory</p>
            <h2 id="advisory-title">Not sure where AI fits? Start with the decision.</h2>
            <p>We help identify worthwhile use cases and a buildable path before technology choices lock the project in the wrong direction.</p>
          </div>
          <div className={styles.advisoryGrid}>
            {advisoryCapabilities.map((capability) => (
              <article key={capability.title}><h3>{capability.title}</h3><p>{capability.text}</p></article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.caseStudy}>
        <Container>
          <div>
            <p className={styles.eyebrow}>Case study</p>
            <h2>A compliance assistant working across 20,000+ documents.</h2>
            <p>See how grounded retrieval, verified citations, and production infrastructure support 95%+ answer accuracy.</p>
          </div>
          <Link href="/case-studies/compliance-rag-chatbot">Read the case study <ArrowIcon /></Link>
        </Container>
      </section>

      <section className={styles.cta}>
        <Container>
          <div><p className={styles.eyebrow}>Have a knowledge problem?</p><h2>Let&apos;s find out whether custom AI is the right answer.</h2></div>
          <Link href="/#contact">Start a conversation <ArrowIcon /></Link>
        </Container>
      </section>
    </>
  );
}
