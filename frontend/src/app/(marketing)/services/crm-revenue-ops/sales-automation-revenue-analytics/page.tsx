import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { PathToResilienceOrbitalTimeline } from "@/components/ui/path-to-resilience-orbital-timeline";
import { CloudSubHero } from "@/components/service-sub/hero";
import { DraftCardSection } from "@/components/service-sub/draft-sections";
import { MigrationEngagementOptions } from "@/components/service-sub/migration-engagement-options";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { FaqContent } from "@/components/pages/faq-content";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { ServiceTools } from "@/components/pages/service-tools";
import { AgentTeams } from "@/app/(marketing)/services/ai-solutions/ai-agents/agent-teams";
import { getBlogs } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import { aiSalesCapabilities, salesAutomationService, salesEngagements, salesFaqs, salesProcess, salesSections, salesTools } from "./content";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./page.module.css";
import subStyles from "@/components/service-sub/service-sub.module.css";

export const metadata: Metadata = {
  title: salesAutomationService.seoTitle,
  description: salesAutomationService.seoDescription,
  alternates: { canonical: "/services/crm-revenue-ops/sales-automation-revenue-analytics" },
};

const salesRelevance = /\b(sales|revenue|crm|pipeline|lead|forecast|conversion|automation|revops)\b/i;

export default async function SalesAutomationRevenueAnalyticsPage() {
  const [caseStudies, blogResult] = await Promise.all([
    getCaseStudies("crm_revenue_ops").catch(() => [] as CaseStudyListItem[]),
    getBlogs("crm_revenue_ops"),
  ]);
  const studies = caseStudies.filter(study => salesRelevance.test([study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" "))).slice(0, 1);
  const insights = blogResult.blogs.filter(post => (!post.status || post.status === "published") && salesRelevance.test(`${post.title} ${post.category} ${post.excerpt}`)).slice(0, 3);
  const contentId = "sales-automation-content";
  const heroPage = { ...salesAutomationService, key: "sales-automation" };

  return <div className={styles.page} data-crm-sub-page="sales-automation-revenue-analytics">
    <CloudSubHero page={heroPage} />
    <div id={contentId}>
      <DraftCardSection section={salesSections.signs} variant="diagnostic" signalEyebrow="" />
      <DraftCardSection section={salesSections.automation} variant="services" />
      <DraftCardSection section={salesSections.analytics} variant="services" />
      <section className={`${sectionStyles.section} ${styles.section}`} aria-labelledby="ai-in-sales-title" id="ai-in-sales">
        <Container>
          <header className={styles.heading} data-reveal="ai-in-sales-heading">
            <h2 id="ai-in-sales-title">AI in sales</h2>
            <p>AI can support sales workflows by preparing information for your team, while people stay responsible for decisions and customer conversations.</p>
          </header>
          <AgentTeams teams={aiSalesCapabilities} titleTemplate="{name}" ctaLabel="Explore AI Agents" ctaHref="/services/ai-solutions/ai-agents" idPrefix="ai-sales" navLabel="AI capabilities" />
        </Container>
      </section>
      <div id="sales-automation-process" className={styles.process}>
        <PathToResilienceOrbitalTimeline
          showStepNumbers eyebrow="How we work" title="Our process" headingId="sales-automation-process-title"
          description="A practical sequence from understanding your sales process to reviewing how the workflows perform."
          steps={salesProcess.map(step => ({ title: step.title, label: step.visual, description: step.description }))}
        />
      </div>
      <ServiceTools id="sales-automation-tools" name={salesAutomationService.name} eyebrow="Tools & platforms" title="Tools we use"
        introduction="We work with the CRM, reporting, and workflow tools already used across your sales process."
        technologies={salesTools} presentation="platforms" balancedPlatforms showTechnologyLinks note={null} revealPrefix="sales-automation-tools" />
      <DraftCardSection section={salesSections.results} variant="connected" visual={{ src: "/images/services/sub-services/benefits/sales-automation.jpg", alt: "Colleagues reviewing sales workflow information together" }} />
      <section className={cloudStyles.workBridge} aria-labelledby="sales-case-study-title" data-sales-case-studies>
        <Container>
          <header className={cloudStyles.sectionHeading} data-reveal="sales-case-study-heading">
            <p className={cloudStyles.eyebrow}>Case study</p>
            <h2 id="sales-case-study-title">Sales and revenue case study</h2>
            <p className={cloudStyles.contentState}>Explore published work related to CRM, sales workflows, or revenue analytics.</p>
          </header>
          {studies.length ? <ServiceCaseStudyGallery studies={studies} /> : <ReferenceEmptyState text="No published sales or revenue case study is available yet. Explore other Vyntics projects in the meantime." href="/case-studies" label="View all case studies" />}
        </Container>
      </section>
      <MigrationEngagementOptions sectionId="sales-automation-engagement" title="Choose the right starting point" introduction="Start by reviewing the sales process, build the agreed automation and dashboards, or discuss ongoing optimisation." steps={salesEngagements} />
      <section className={cloudStyles.context} aria-labelledby="sales-insights-title" data-sales-insights>
        <Container>
          <header className={cloudStyles.sectionHeading} data-reveal="sales-insights-heading">
            <p className={cloudStyles.eyebrow}>Related insights</p><h2 id="sales-insights-title">Sales and revenue insights</h2>
          </header>
          {insights.length ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div> : <ReferenceEmptyState text="We're adding published insights about sales automation and revenue analytics. Browse the latest from our blog in the meantime." href="/blog" label="Visit the blog" />}
          <Link className={cloudStyles.primaryAction} href="/blog">View all insights <span aria-hidden="true">→</span></Link>
        </Container>
      </section>
      <section className={`${sectionStyles.section} ${subStyles.section}`} aria-labelledby="sales-automation-faq-title" data-reveal="sales-automation-faq">
        <FaqContent heading={<><h2 id="sales-automation-faq-title">Frequently asked questions</h2><p className={subStyles.faqIntro}>Answers about sales automation and revenue analytics.</p><p className={subStyles.faqContact}>Have a question about your sales process? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>}
          items={salesFaqs} name="sales-automation-faq" label="Sales automation questions" />
      </section>
      <DraftCardSection section={salesSections.related} />
      <div data-reveal="sales-automation-contact"><ContactCta eyebrow="Sales automation services" title="Build a clearer sales process and revenue view" intro="Tell us where manual work, follow-up, or pipeline visibility is getting in the way. We can discuss a practical next step for your sales automation and revenue analytics." submitLabel="Discuss sales automation" sectionId="contact" /></div>
    </div>
    <ScrollReveals scope={`#${contentId}`} />
  </div>;
}

function ReferenceEmptyState({ text, href, label }: { text: string; href: string; label: string }) {
  return <div className={subStyles.referenceEmpty}><p>{text}</p><Link className={cloudStyles.primaryAction} href={href}>{label} <span aria-hidden="true">→</span></Link></div>;
}
