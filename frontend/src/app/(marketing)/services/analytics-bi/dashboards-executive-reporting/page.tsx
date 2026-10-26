import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { PathToResilienceOrbitalTimeline } from "@/components/ui/path-to-resilience-orbital-timeline";
import { CloudSubHero } from "@/components/service-sub/hero";
import { DraftCardSection } from "@/components/service-sub/draft-sections";
import { DashboardsByTeam } from "./dashboards-by-team";
import { MigrationEngagementOptions } from "@/components/service-sub/migration-engagement-options";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { FaqContent } from "@/components/pages/faq-content";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { getBlogs } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import { dashboardEngagements, dashboardFaqs, dashboardProcess, dashboardSections, dashboardService, dashboardTeams } from "./content";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./page.module.css";
import subStyles from "@/components/service-sub/service-sub.module.css";

export const metadata: Metadata = {
  title: dashboardService.seoTitle,
  description: dashboardService.seoDescription,
  alternates: { canonical: "/services/analytics-bi/dashboards-executive-reporting" },
};

const dashboardRelevance = /\b(dashboard|report(?:ing)?|kpi|executive|business intelligence|analytics|power bi|tableau|quicksight)\b/i;

export default async function DashboardExecutiveReportingPage() {
  const [caseStudies, blogResult] = await Promise.all([
    getCaseStudies("analytics_bi").catch(() => [] as CaseStudyListItem[]),
    getBlogs("analytics_bi"),
  ]);
  const studies = caseStudies.filter(study => dashboardRelevance.test([study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" "))).slice(0, 1);
  const insights = blogResult.blogs.filter(post => (!post.status || post.status === "published") && dashboardRelevance.test(`${post.title} ${post.category} ${post.excerpt}`)).slice(0, 3);
  const contentId = "dashboard-reporting-content";
  const heroPage = { ...dashboardService, key: "dashboard-reporting" };

  return <div className={styles.page} data-analytics-sub-page="dashboards-executive-reporting">
    <CloudSubHero page={heroPage} showOutcome={false} />
    <div id={contentId}>
      <DraftCardSection section={dashboardSections.signs} variant="diagnostic" signalEyebrow="" />
      <DraftCardSection section={dashboardSections.dashboardServices} variant="services" />
      <DraftCardSection section={dashboardSections.executiveReporting} variant="services" />
      <div id="dashboard-reporting-process" className={styles.process}>
        <PathToResilienceOrbitalTimeline
          showStepNumbers eyebrow="How we work" title="Our Process" headingId="dashboard-reporting-process-title"
          description="A clear path from agreed business measures to reports your team can understand and use."
          steps={dashboardProcess.map(step => ({ title: step.title, label: step.visual, description: step.description }))}
        />
      </div>
      <section className={`${sectionStyles.section} ${styles.section}`} aria-labelledby="dashboards-by-team-title" id="dashboards-by-team">
        <Container>
          <header className={styles.heading} data-reveal="dashboards-by-team-heading">
            <h2 id="dashboards-by-team-title">Dashboards By Team</h2>
            <p>Reporting views can reflect the measures, cadence, and decisions that matter to each group.</p>
          </header>
          <DashboardsByTeam teams={dashboardTeams} />
        </Container>
      </section>
      <DraftCardSection section={dashboardSections.results} variant="connected" visual={{ src: "/images/services/sub-services/benefits/dashboard-and-executive-reporting.jpg", alt: "Colleagues reviewing dashboard information together" }} />
      <section className={cloudStyles.workBridge} aria-labelledby="dashboard-case-study-title" data-dashboard-case-studies>
        <Container>
          <header className={cloudStyles.sectionHeading} data-reveal="dashboard-case-study-heading">
            <p className={cloudStyles.eyebrow}>Case study</p>
            <h2 id="dashboard-case-study-title">Dashboard And Reporting Case Study</h2>
            <p className={cloudStyles.contentState}>Explore published work relevant to analytics, dashboards, or reporting.</p>
          </header>
          {studies.length ? <ServiceCaseStudyGallery studies={studies} /> : <ReferenceEmptyState text="No published dashboard-related case study is available yet. Explore other Vyntics projects in the meantime." href="/case-studies" label="View all case studies" />}
        </Container>
      </section>
      <MigrationEngagementOptions sectionId="dashboard-reporting-engagement" title="Choose The Right Starting Point" introduction="Start with KPI alignment, move into a scoped dashboard build, or discuss ongoing reporting support." steps={dashboardEngagements} />
      <section className={cloudStyles.context} aria-labelledby="dashboard-insights-title" data-dashboard-insights>
        <Container>
          <header className={cloudStyles.sectionHeading} data-reveal="dashboard-insights-heading">
            <p className={cloudStyles.eyebrow}>Related insights</p><h2 id="dashboard-insights-title">Dashboard And Reporting Insights</h2>
          </header>
          {insights.length ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div> : <ReferenceEmptyState text="We're adding published insights about dashboards and reporting. Browse the latest from our blog in the meantime." href="/blog" label="Visit the blog" />}
          <Link className={cloudStyles.primaryAction} href="/blog">View all insights <span aria-hidden="true">→</span></Link>
        </Container>
      </section>
      <section className={`${sectionStyles.section} ${subStyles.section}`} aria-labelledby="dashboard-reporting-faq-title" data-reveal="dashboard-reporting-faq">
        <FaqContent heading={<><h2 id="dashboard-reporting-faq-title">Frequently Asked Questions</h2><p className={subStyles.faqIntro}>Answers about dashboard development and executive reporting.</p><p className={subStyles.faqContact}>Have a question about your reporting needs? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>}
          items={dashboardFaqs} name="dashboard-reporting-faq" label="Dashboard development questions" />
      </section>
      <DraftCardSection section={dashboardSections.relatedServices} />
      <div data-reveal="dashboard-reporting-contact"><ContactCta eyebrow="Dashboard development" title="Make your reporting work harder for your team" intro="Tell us about the reports your team relies on and the decisions you want them to support. We can discuss a practical next step for your dashboards and executive reporting." submitLabel="Discuss dashboard reporting" sectionId="contact" /></div>
    </div>
    <ScrollReveals scope={`#${contentId}`} />
  </div>;
}

function ReferenceEmptyState({ text, href, label }: { text: string; href: string; label: string }) {
  return <div className={subStyles.referenceEmpty}><p>{text}</p><Link className={cloudStyles.primaryAction} href={href}>{label} <span aria-hidden="true">→</span></Link></div>;
}
