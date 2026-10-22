import { ServicesHero } from "@/components/pages/services-hero";
import type { Metadata } from "next";
import Link from "next/link";
import { AiSolutionsServicesShowcase } from "@/components/pages/ai-solutions-services-showcase";
import { DataEngineeringProcessTimeline } from "@/components/pages/data-engineering-process-timeline";
import { ServiceTools } from "@/components/pages/service-tools";
import { FaqContent } from "@/components/pages/faq-content";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { Container } from "@/components/ui/container";
import { NextServiceBanner } from "@/components/pages/next-service-banner";
import { Suspense } from "react";
import { PublishedServiceCaseStudies } from "@/components/pages/published-service-case-studies";
import { FeaturedCaseStudySkeleton } from "@/components/sections/case-studies/case-study-skeleton";
import { getBlogs } from "@/lib/blogs";
import { AiProblems } from "./ai-problems";
import { AiWhy } from "./ai-why";
import cloudStyles from "../cloud/page.module.css";
import problemStyles from "../cloud/cloud-problems.module.css";
import faqStyles from "../cloud/cloud-faq.module.css";
import shared from "../../recognitions/page.module.css";
import studyStyles from "../../case-studies/page.module.css";
import styles from "../data/page.module.css";

export const metadata: Metadata = {
  title: "AI Development Services",
  description: "AI development services for secure knowledge assistants, AI agents, intelligent automation, generative AI, and production LLM integrations.",
  alternates: { canonical: "/services/ai-solutions" },
};

const platforms = [
  { name: "OpenAI", role: "Language models", description: "Reasoning, generation, structured outputs, embeddings, and tool use across production AI workloads." },
  { name: "Anthropic", role: "Language models", description: "Long-context reasoning and generation for knowledge, analysis, and controlled agent workflows." },
  { name: "n8n", role: "Workflow automation", description: "Coordinate repeatable workflows, system actions, and automated hand-offs." },
  { name: "Pinecone", role: "Vector retrieval", description: "Scalable semantic search, metadata filtering, and retrieval across enterprise knowledge collections." },
  { name: "Qdrant", role: "Vector retrieval", description: "Scalable semantic search, metadata filtering, and retrieval across enterprise knowledge collections." },
  { name: "LangGraph", role: "AI orchestration", description: "Stateful agent workflows, tool coordination, and human checkpoints." },
  { name: "LangChain", role: "AI orchestration", description: "Retrieval pipelines, tool coordination, and tracing across AI workflows." },
  { name: "Azure AI", role: "Enterprise AI", description: "Governed model access and document intelligence for organizations operating in the Microsoft ecosystem." },
] as const;

const aiServices = [
  { number: "01", title: "RAG & Knowledge Assistants", slug: "rag-knowledge-assistants" },
  { number: "02", title: "AI Agents", slug: "ai-agents" },
  { number: "03", title: "Intelligent Automation", slug: "intelligent-automation" },
] as const;

const process = [
  { title: "Discover", visual: "Use case and evidence", description: "Identify the user problem, workflow, available knowledge, integration boundaries, risk, and evidence of value." },
  { title: "Pilot", visual: "Architecture and controls", description: "Test the smallest useful version against representative data, users, permissions, quality measures, and failure cases." },
  { title: "Build", visual: "Production AI system", description: "Turn the proven approach into a dependable system with integrations, observability, tests, and operating controls." },
  { title: "Deploy", visual: "Release and adoption", description: "Release into the real workflow, validate security and performance, train owners, and establish support and recovery paths." },
  { title: "Improve", visual: "Monitor and improve", description: "Track real usage, failures, quality drift, content freshness, spend, feedback, and controlled model changes." },
] as const;

const faqs = [
  { question: "What do AI development services include?", answer: "They can include AI consulting, grounded knowledge assistants, tool-using agents, intelligent document processing, workflow automation, generative AI features, and LLM integrations inside existing software. The right scope starts with a specific business decision or task, not a model." },
  { question: "How do we know if our business is ready for AI?", answer: "You need a defined use case, an accountable owner, usable data or knowledge, access to the systems involved, and a measurable outcome. If those basics are missing, the honest first step is readiness work-not an AI build." },
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

async function AiInsights() {
  const result = await getBlogs("ai_solutions");
  const posts = result.blogs.slice(0, 3);
  if (!posts.length) return <p className={cloudStyles.contentState} role="status">{result.status === "error" ? "Related insights are temporarily unavailable. You can explore our articles on the Blog page." : "AI insights will appear here when available."}</p>;
  return <div className={studyStyles.otherGrid}>{posts.map(blog => <RelatedBlogCard blog={blog} variant="service" key={blog.id} />)}</div>;
}

export default function AiSolutionsPage() {

  return (
    <>
      <ServicesHero
        service="ai-solutions"
        headingId="ai-solutions-title"
        eyebrow={"AI solutions"}
        title={"AI solutions built for control and trust."}
        description={"We build custom AI solutions - from LLM integrations and grounded assistants to AI agents and intelligent automation - designed around your data, systems, and workflows."}
        primaryAction={{ href: "#contact", label: "Discuss your AI use case" }}
        secondaryAction={{ href: "#ai-services", label: "Our AI solutions" }}
        capabilities={aiServices.map(service => ({ label: service.title, href: `/services/ai-solutions/${service.slug}` }))}
      />

      <section className={problemStyles.section} aria-labelledby="problems-title">
        <Container>
          <header className={problemStyles.intro}><p className={problemStyles.eyebrow}>AI Solutions</p><h2 id="problems-title">AI problems we solve</h2><p className={problemStyles.subtext}>From trapped knowledge to risky automation, we solve the operating problems that keep useful AI from reaching production.</p></header>
          <AiProblems />
        </Container>
      </section>

      <section className={`${styles.section} ${styles.servicesSection}`} id="ai-services" aria-labelledby="services-title">
        <Container><AiSolutionsServicesShowcase /></Container>
      </section>

      <AiWhy />

      <ServiceTools id="ai-platforms" headingId="platforms-title" sectionName="AI platforms we work with" name="AI Solutions" eyebrow="AI platforms we work with"
        title="Choose the stack around the risk and workload." introduction="We keep the architecture modular where practical, so one model or vendor does not become the whole system."
        technologies={platforms.map(platform => platform.name)} details={platforms} presentation="platforms" balancedPlatforms note={null} />

      <section className={`${styles.section} ${styles.processSection}`} aria-labelledby="process-title">
        <Container>
          <div className={`${styles.sectionHeading} ${styles.processHeading}`}><p className={styles.label}>How we work</p><h2 id="process-title">Discover. Pilot. Build. Deploy. Improve.</h2><p>Five focused stages. One accountable delivery process built around evidence and safe operation.</p></div>
          <DataEngineeringProcessTimeline steps={process} />
        </Container>
      </section>

      <section className={cloudStyles.workBridge} aria-labelledby="case-study-title">
        <Container>
          <header className={cloudStyles.sectionHeading}><p className={cloudStyles.eyebrow}>CASE STUDIES</p><h2 id="case-study-title">Case studies</h2><p className={cloudStyles.contentState}>Explore how we’ve helped businesses turn practical AI use cases into controlled, production-ready systems.</p></header>
          <Suspense fallback={<FeaturedCaseStudySkeleton />}><PublishedServiceCaseStudies service="ai_solutions" /></Suspense>
          <Link className={cloudStyles.secondaryAction} href="/case-studies">Explore all case studies <ArrowIcon /></Link>
        </Container>
      </section>

      <NextServiceBanner id="ai-next" currentService="ai-solutions" sectionClassName={styles.section} />

      <section className={cloudStyles.context} aria-labelledby="insights-title">
        <Container>
          <header className={cloudStyles.sectionHeading}><p className={cloudStyles.eyebrow}>RELATED INSIGHTS</p><h2 id="insights-title">Related insights</h2></header>
          <Suspense fallback={<p className={cloudStyles.contentState} role="status">Loading AI insights…</p>}><AiInsights /></Suspense>
          <Link className={cloudStyles.secondaryAction} href="/blog">View all insights <ArrowIcon /></Link>
        </Container>
      </section>

      <section className={shared.section} aria-labelledby="faq-title">
        <FaqContent
          heading={<>
            <h2 id="faq-title">Frequently Asked Questions</h2>
            <p className={faqStyles.introduction}>Practical answers about AI use cases, delivery timelines, data security, model choices, and measurable value.</p>
            <div className={faqStyles.contactFallback}>
              <p className={faqStyles.contactPrompt}>Can’t find the answer you’re looking for?</p>
              <p className={faqStyles.contactHelp}>Reach out to us at <a className={shared.faqEmail} href="mailto:contact@vyntics.com">contact@vyntics.com</a> and we’ll be happy to help.</p>
            </div>
          </>}
          items={faqs}
          name="ai-solutions-faq"
          label="AI solutions questions"
        />
      </section>

      <ContactCta eyebrow="AI solutions consultation" title="Ready to turn an AI use case into a working system?" intro="Tell us where knowledge, documents, decisions, or repetitive work are slowing the team down. We’ll identify the practical first step and the evidence needed to scope it properly." submitLabel="Discuss your AI project" />
    </>
  );
}
