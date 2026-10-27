import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { PathToResilienceOrbitalTimeline } from "@/components/ui/path-to-resilience-orbital-timeline";
import { CloudSubHero } from "@/components/service-sub/hero";
import { DraftCardSection } from "@/components/service-sub/draft-sections";
import { MigrationEngagementOptions } from "@/components/service-sub/migration-engagement-options";
import { AutomationFlow } from "@/components/service-sub/automation-flow";
import { UseCaseExplorer } from "./use-case-explorer";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { FaqContent } from "@/components/pages/faq-content";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { ServiceTools } from "@/components/pages/service-tools";
import { getBlogs } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import {
  automationEngagements,
  automationUseCaseDetails,
  intelligentAutomation,
  intelligentAutomationFaqs,
  intelligentAutomationProcess,
  intelligentAutomationSections,
  intelligentAutomationTools,
} from "./content";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./page.module.css";
import subStyles from "@/components/service-sub/service-sub.module.css";

export const metadata: Metadata = {
  title: intelligentAutomation.seoTitle,
  description: intelligentAutomation.seoDescription,
  alternates: { canonical: "/services/ai-solutions/intelligent-automation" },
};

const automationRelevance = /\b(intelligent automation|document processing|invoice|workflow|automation|approval|claims|onboarding|KYC|RPA|forms)\b/i;
const unrelatedAiTopics = /\b(RAG|retrieval[- ]augmented|knowledge assistant|chatbot|AI agents?|agentic)\b/i;

function isIntelligentAutomationContent(text: string) {
  return automationRelevance.test(text) && !unrelatedAiTopics.test(text);
}

export default async function IntelligentAutomationPage() {
  const [caseStudies, blogResult] = await Promise.all([
    getCaseStudies("ai_solutions").catch(() => [] as CaseStudyListItem[]),
    getBlogs("ai_solutions"),
  ]);
  // The existing canonical service feed includes AI Solutions and all_services records.
  // Topic matching keeps unrelated RAG and AI-agent entries off this sub-service page.
  const studies = caseStudies.filter(study => isIntelligentAutomationContent([study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" "))).slice(0, 1);
  const insights = blogResult.blogs.filter(post => (!post.status || post.status === "published") && isIntelligentAutomationContent(`${post.title} ${post.category} ${post.excerpt}`)).slice(0, 3);
  const contentId = "intelligent-automation-content";
  const heroPage = { ...intelligentAutomation, key: "intelligent-automation" };

  return <div className={styles.page} data-ai-sub-page="intelligent-automation">
    <CloudSubHero page={heroPage} opticalAlign showOutcome={false} />
    <div id={contentId}>
      <DraftCardSection section={intelligentAutomationSections.signs} variant="diagnostic" signalEyebrow="" />
      <DraftCardSection section={intelligentAutomationSections.documentProcessing} variant="services" />
      <DraftCardSection section={intelligentAutomationSections.workflowAutomation} variant="services" />
      <nav className={styles.relatedWorkflow} aria-label="Related AI and workflow services">
        <span>Related services</span>
        <Link href="/services/ai-solutions">AI Solutions <span aria-hidden="true">→</span></Link>
        <Link href="/services/data-engineering/data-pipelines-integration">Data Pipelines & Integration <span aria-hidden="true">→</span></Link>
        <Link href="/services/crm-revenue-ops/crm-implementation-integration">CRM Implementation & Integration <span aria-hidden="true">→</span></Link>
      </nav>
      <section className={`${sectionStyles.section} ${styles.section}`} id={intelligentAutomationSections.useCases.id} aria-labelledby="automation-use-cases-title">
        <Container>
          <header className={styles.heading} data-reveal="automation-use-cases-heading">
            <h2 id="automation-use-cases-title">{intelligentAutomationSections.useCases.title}</h2>
            <p>{intelligentAutomationSections.useCases.introduction}</p>
          </header>
          <UseCaseExplorer items={automationUseCaseDetails} />
        </Container>
      </section>
      <div id="intelligent-automation-process" className={styles.process}>
        <PathToResilienceOrbitalTimeline
          showStepNumbers eyebrow="How we work" title="Our Process" headingId="intelligent-automation-process-title"
          description="A controlled path from understanding the workflow to monitoring how it performs in operation."
          steps={intelligentAutomationProcess.map(step => ({ title: step.title, label: step.visual, description: step.description }))}
        />
      </div>
      <AutomationFlow />
      <ServiceTools id="intelligent-automation-tools" name={intelligentAutomation.name} eyebrow="Tools & platforms" title="Tools We Use"
        introduction="We select document processing and workflow tools around your data, systems, review needs, and operating environment."
        technologies={intelligentAutomationTools} presentation="platforms" balancedPlatforms showTechnologyLinks note={null}
        revealPrefix="intelligent-automation-tools" />
      <DraftCardSection section={intelligentAutomationSections.results} variant="connected" visual={{ src: "/images/services/sub-services/benefits/intelligent-automation.jpg", alt: "Colleagues working together around a table with documents and a laptop" }} />
      <section className={cloudStyles.workBridge} aria-labelledby="automation-case-study-title" data-automation-case-studies>
        <Container>
          <header className={cloudStyles.sectionHeading} data-reveal="automation-case-study-heading">
            <p className={cloudStyles.eyebrow}>Case study</p>
            <h2 id="automation-case-study-title">Intelligent Automation Case Study</h2>
            <p className={cloudStyles.contentState}>Explore published work relevant to document processing or workflow automation.</p>
          </header>
          {studies.length ? <ServiceCaseStudyGallery studies={studies} /> : <ReferenceEmptyState text="No published intelligent automation case study is available yet. Explore other Vyntics projects in the meantime." href="/case-studies" label="View all case studies" />}
        </Container>
      </section>
      <MigrationEngagementOptions sectionId="intelligent-automation-engagement" title="Choose The Right Starting Point" introduction="Begin with an automation audit, test a focused pilot, or plan a broader rollout." steps={automationEngagements} />
      <section className={cloudStyles.context} aria-labelledby="automation-insights-title" data-automation-insights>
        <Container>
          <header className={cloudStyles.sectionHeading} data-reveal="automation-insights-heading">
            <p className={cloudStyles.eyebrow}>Related insights</p><h2 id="automation-insights-title">Intelligent Automation Insights</h2>
          </header>
          {insights.length ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div> : <ReferenceEmptyState text="We're adding published insights about intelligent document processing and workflow automation. Browse the latest from our blog in the meantime." href="/blog" label="Visit the blog" />}
          <Link className={cloudStyles.primaryAction} href="/blog">View all insights <span aria-hidden="true">→</span></Link>
        </Container>
      </section>
      <section className={`${sectionStyles.section} ${subStyles.section}`} aria-labelledby="intelligent-automation-faq-title" data-reveal="intelligent-automation-faq">
        <FaqContent heading={<><h2 id="intelligent-automation-faq-title">Frequently Asked Questions</h2><p className={subStyles.faqIntro}>Answers about intelligent document processing and AI workflow automation.</p><p className={subStyles.faqContact}>Have a question about your workflow? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>}
          items={intelligentAutomationFaqs} name="intelligent-automation-faq" label="Intelligent automation questions" />
      </section>
      <DraftCardSection section={intelligentAutomationSections.related} />
      <div data-reveal="intelligent-automation-contact"><ContactCta eyebrow="Intelligent automation services" title="Make repetitive workflows easier to manage" intro="Tell us about the documents, approvals, or recurring process steps taking time from your team. We can discuss a practical first workflow to review." submitLabel="Discuss intelligent automation" sectionId="contact" /></div>
    </div>
    <ScrollReveals scope={`#${contentId}`} />
  </div>;
}

function ReferenceEmptyState({ text, href, label }: { text: string; href: string; label: string }) {
  return <div className={subStyles.referenceEmpty}><p>{text}</p><Link className={cloudStyles.primaryAction} href={href}>{label} <span aria-hidden="true">→</span></Link></div>;
}
