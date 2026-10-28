import { aiPlatforms as platforms } from "@/content/service-platforms";
import { ServicesHero } from "@/components/pages/services-hero";
import type { Metadata } from "next";
import Link from "next/link";
import { AiSolutionsServicesShowcase } from "@/components/pages/ai-solutions-services-showcase";
import { DataEngineeringProcessTimeline } from "@/components/pages/data-engineering-process-timeline";
import { DataEngineeringDatabricksCredential } from "@/components/pages/data-engineering-databricks-credential";
import { ServiceTools } from "@/components/pages/service-tools";
import { ServiceFaqContent } from "@/components/pages/service-faq-content";
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


const openAiCredential = {
  badgeName: "OpenAI Select Partner",
  sectionTitle: "Recognized for AI Excellence",
  eyebrow: "OpenAI Partnership",
  heading: "Recognized as an OpenAI Select Partner",
  body: "Vyntics builds production AI solutions, including retrieval-based assistants grounded in client data and automation around the systems our clients already use.",
  titleId: "openai-credential-title",
} as const;

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
        title={"AI Solutions Built For Control And Trust"}
        description={"We build custom AI solutions - from LLM integrations and grounded assistants to AI agents and intelligent automation - designed around your data, systems, and workflows."}
        primaryAction={{ href: "/contact-us", label: "Discuss your AI use case" }}
        secondaryAction={{ href: "#ai-services", label: "Our AI solutions" }}
        capabilities={aiServices.map(service => ({ label: service.title, href: `/services/ai-solutions/${service.slug}` }))}
      />

      <DataEngineeringDatabricksCredential content={openAiCredential} />

      <section className={`${problemStyles.section} ${styles.noDivider}`} aria-labelledby="problems-title">
        <Container>
          <header className={problemStyles.intro}><p className={problemStyles.eyebrow}>AI Solutions</p><h2 id="problems-title">AI Problems We Solve</h2><p className={problemStyles.subtext}>From trapped knowledge to risky automation, we solve the operating problems that keep useful AI from reaching production.</p></header>
          <AiProblems />
        </Container>
      </section>

      <section className={`${styles.section} ${styles.servicesSection}`} id="ai-services" aria-labelledby="services-title">
        <Container><AiSolutionsServicesShowcase /></Container>
      </section>

      <AiWhy />

      <ServiceTools id="ai-platforms" headingId="platforms-title" sectionName="AI platforms we work with" name="AI Solutions" eyebrow="AI Platforms We Work With"
        title="Choose The Stack Around The Risk And Workload" introduction="We keep the architecture modular where practical, so one model or vendor does not become the whole system."
        technologies={platforms.map(platform => platform.name)} details={platforms.map(platform => ({ ...platform, role: platform.role.replace(/\b\w/g, letter => letter.toUpperCase()) }))} presentation="platforms" balancedPlatforms note={null} />

      <section className={`${styles.section} ${styles.processSection}`} aria-labelledby="process-title">
        <Container>
          <div className={`${styles.sectionHeading} ${styles.processHeading}`}><p className={styles.label}>How We Work</p><h2 id="process-title">Discover. Pilot. Build. Deploy. Improve.</h2><p>Five focused stages. One accountable delivery process built around evidence and safe operation.</p></div>
          <DataEngineeringProcessTimeline steps={process} />
        </Container>
      </section>

      <section className={`${cloudStyles.workBridge} ${styles.noDivider}`} aria-labelledby="case-study-title">
        <Container>
          <header className={cloudStyles.sectionHeading}><p className={cloudStyles.eyebrow}>CASE STUDIES</p><h2 id="case-study-title">Case Studies</h2><p className={cloudStyles.contentState}>Explore how we’ve helped businesses turn practical AI use cases into controlled, production-ready systems.</p></header>
          <Suspense fallback={<FeaturedCaseStudySkeleton />}><PublishedServiceCaseStudies service="ai_solutions" /></Suspense>
          <Link className={cloudStyles.secondaryAction} href="/case-studies">Explore all case studies <ArrowIcon /></Link>
        </Container>
      </section>

      <NextServiceBanner id="ai-next" currentService="ai-solutions" sectionClassName={styles.section} title="What Comes Next" />

      <section className={`${cloudStyles.context} ${styles.noDivider}`} aria-labelledby="insights-title">
        <Container>
          <header className={cloudStyles.sectionHeading}><p className={cloudStyles.eyebrow}>RELATED INSIGHTS</p><h2 id="insights-title">Related Insights</h2></header>
          <Suspense fallback={<p className={cloudStyles.contentState} role="status">Loading AI insights…</p>}><AiInsights /></Suspense>
          <Link className={cloudStyles.secondaryAction} href="/blog">View all insights <ArrowIcon /></Link>
        </Container>
      </section>

      <section className={shared.section} aria-labelledby="faq-title">
        <ServiceFaqContent page="services/ai-solutions"
          heading={<>
            <h2 id="faq-title">Frequently Asked Questions</h2>
            <p className={faqStyles.introduction}>Practical answers about AI use cases, delivery timelines, data security, model choices, and measurable value.</p>
            <div className={faqStyles.contactFallback}>
              <p className={faqStyles.contactPrompt}>Can’t find the answer you’re looking for?</p>
              <p className={faqStyles.contactHelp}>Reach out to us at <a className={shared.faqEmail} href="mailto:contact@vyntics.com">contact@vyntics.com</a> and we’ll be happy to help.</p>
            </div>
          </>}
          name="ai-solutions-faq"
          label="AI solutions questions"
        />
      </section>

      <ContactCta eyebrow="AI solutions consultation" title="Ready To Turn An AI Use Case Into A Working System?" intro="Tell us where knowledge, documents, decisions, or repetitive work are slowing the team down. We’ll identify the practical first step and the evidence needed to scope it properly." submitLabel="Discuss your AI project" />
    </>
  );
}
