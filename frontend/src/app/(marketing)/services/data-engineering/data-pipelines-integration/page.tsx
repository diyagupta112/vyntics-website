import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { PathToResilienceOrbitalTimeline } from "@/components/ui/path-to-resilience-orbital-timeline";
import { CloudSubHero } from "@/components/service-sub/hero";
import { DraftCardSection } from "@/components/service-sub/draft-sections";
import { ServiceTools } from "@/components/pages/service-tools";
import { DataPipelineArchitecture } from "@/components/service-sub/data-pipeline-architecture";
import { MigrationEngagementOptions } from "@/components/service-sub/migration-engagement-options";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { FaqContent } from "@/components/pages/faq-content";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { getBlogs } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import { pipelineEngagements, pipelineFaqs, pipelineProcess, pipelineSections, pipelineService, pipelineToolDetails, pipelineTools } from "./content";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./page.module.css";
import subStyles from "@/components/service-sub/service-sub.module.css";

export const metadata: Metadata = { title: pipelineService.seoTitle, description: pipelineService.seoDescription, keywords: ["data pipeline services", "ETL services", "ELT development", "data integration services", "ETL pipeline development", "real-time data streaming", "API data integration"], alternates: { canonical: "/services/data-engineering/data-pipelines-integration" } };
const relevance = /\b(data pipeline|pipeline|ETL|ELT|data integration|streaming|Airflow|dbt|warehouse)\b/i;

export default async function DataPipelinesIntegrationPage() {
  const [caseStudies, blogResult] = await Promise.all([getCaseStudies("data_engineering").catch(() => [] as CaseStudyListItem[]), getBlogs("data_engineering")]);
  const studies = caseStudies.filter(study => relevance.test([study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" "))).slice(0, 1);
  const insights = blogResult.blogs.filter(post => (!post.status || post.status === "published") && relevance.test(`${post.title} ${post.category} ${post.excerpt}`)).slice(0, 3);
  const contentId = "data-pipelines-content";
  const heroPage = { ...pipelineService, key: "data-pipelines-integration" };
  return <div className={styles.page} data-data-sub-page="data-pipelines-integration"><CloudSubHero page={heroPage} processId="data-pipeline-process" showOutcome={false} /><div id={contentId}>
    <DraftCardSection section={pipelineSections.signs} variant="diagnostic" signalEyebrow="" />
    <DraftCardSection section={pipelineSections.pipelines} variant="services" />
    <DraftCardSection section={pipelineSections.integrations} variant="services" />
    <section className={`${sectionStyles.section} ${styles.section}`} id="data-pipeline-process" aria-labelledby="data-pipeline-process-title"><PathToResilienceOrbitalTimeline showStepNumbers eyebrow="How we work" title="Our Process" headingId="data-pipeline-process-title" description="A clear path from scattered sources to data flows your team can monitor and use." steps={pipelineProcess.map(step => ({ title: step.title, label: step.visual, description: step.description }))} /></section>
    <DataPipelineArchitecture />
    <ServiceTools id="data-pipelines-tools" name={pipelineService.name} eyebrow="Tools & platforms" title="Tools We Use"
      introduction="We select tools around your delivery process, application requirements, and the systems your team can maintain."
      technologies={pipelineTools} details={pipelineToolDetails} presentation="platforms" balancedPlatforms showTechnologyLinks note={null}
      revealPrefix="data-pipelines-tools" />
    <DraftCardSection section={pipelineSections.results} variant="connected" visual={{ src: "/images/services/sub-services/benefits/data-pipelines-and-integration.jpg", alt: "Three colleagues smiling and reviewing charts and a laptop together during a planning session" }} />
    <section className={cloudStyles.workBridge} aria-labelledby="pipeline-case-study-title"><Container><header className={cloudStyles.sectionHeading} data-reveal="pipeline-case-study-heading"><p className={cloudStyles.eyebrow}>Case study</p><h2 id="pipeline-case-study-title">Data Pipeline Case Study</h2><p className={cloudStyles.contentState}>Explore published work relevant to data pipelines, integration, or engineering.</p></header>{studies.length ? <ServiceCaseStudyGallery studies={studies} /> : <ReferenceEmptyState text="No published data pipeline case study is available yet. Explore other Vyntics projects in the meantime." href="/case-studies" label="View all case studies" />}</Container></section>
    <MigrationEngagementOptions sectionId="data-pipeline-engagement" title="Choose The Right Starting Point" introduction="Start with a pipeline audit, move into a scoped build, or discuss ongoing pipeline support." steps={pipelineEngagements} />
    <section className={cloudStyles.context} aria-labelledby="pipeline-insights-title"><Container><header className={cloudStyles.sectionHeading} data-reveal="pipeline-insights-heading"><p className={cloudStyles.eyebrow}>Related insights</p><h2 id="pipeline-insights-title">Data Pipeline Insights</h2></header>{insights.length ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div> : <ReferenceEmptyState text="We're adding published insights about data pipelines and integration. Browse the latest from our blog in the meantime." href="/blog" label="Visit the blog" />}<Link className={cloudStyles.primaryAction} href="/blog">View all insights <span aria-hidden="true">→</span></Link></Container></section>
    <section className={`${sectionStyles.section} ${subStyles.section}`} aria-labelledby="pipeline-faq-title"><FaqContent heading={<><h2 id="pipeline-faq-title">Frequently Asked Questions</h2><p className={subStyles.faqIntro}>Answers about data pipeline services and integration.</p><p className={subStyles.faqContact}>Have a question about your data flows? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>} items={pipelineFaqs} name="data-pipeline-faq" label="Data pipeline questions" /></section>
    <DraftCardSection section={pipelineSections.related} /><div data-reveal="pipeline-contact"><ContactCta eyebrow="Data pipeline services" title="Make your data flow work harder" intro="Tell us where your data starts, where it needs to go, and what is getting in the way. We can discuss a practical next step." submitLabel="Discuss data pipelines" sectionId="contact" /></div>
  </div><ScrollReveals scope={`#${contentId}`} /></div>;
}

function ReferenceEmptyState({ text, href, label }: { text: string; href: string; label: string }) { return <div className={subStyles.referenceEmpty}><p>{text}</p><Link className={cloudStyles.primaryAction} href={href}>{label} <span aria-hidden="true">→</span></Link></div>; }
