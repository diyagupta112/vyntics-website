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
import { getBlogs } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import { qualityEngagements, qualityFaqs, qualityProcess, qualitySections, qualityService, qualityTools } from "./content";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./page.module.css";
import subStyles from "@/components/service-sub/service-sub.module.css";

export const metadata: Metadata = { title: qualityService.seoTitle, description: qualityService.seoDescription, keywords: ["data quality services", "data governance consulting", "data quality management", "master data management", "data observability", "data catalog implementation", "data compliance services"], alternates: { canonical: "/services/data-engineering/data-quality-governance" } };
const relevance = /\b(data quality|data governance|governance|observability|catalog|lineage|master data|data compliance)\b/i;

export default async function DataQualityGovernancePage() {
  const [caseStudies, blogResult] = await Promise.all([getCaseStudies("data_engineering").catch(() => [] as CaseStudyListItem[]), getBlogs("data_engineering")]);
  const studies = caseStudies.filter(study => relevance.test([study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" "))).slice(0, 1);
  const insights = blogResult.blogs.filter(post => (!post.status || post.status === "published") && relevance.test(`${post.title} ${post.category} ${post.excerpt}`)).slice(0, 3);
  const contentId = "data-quality-content";
  const heroPage = { ...qualityService, key: "data-quality-governance" };
  return <div className={styles.page} data-data-sub-page="data-quality-governance"><CloudSubHero page={heroPage} /><div id={contentId}>
    <DraftCardSection section={qualitySections.signs} variant="diagnostic" signalEyebrow="" />
    <DraftCardSection section={qualitySections.quality} variant="services" />
    <DraftCardSection section={qualitySections.governance} variant="services" />
    <DraftCardSection section={qualitySections.observability} variant="services" />
    <section className={`${sectionStyles.section} ${styles.section}`} id="quality-process" aria-labelledby="quality-process-title"><PathToResilienceOrbitalTimeline showStepNumbers eyebrow="How we work" title="Our process" headingId="quality-process-title" description="A clear path from uncertain data to standards, controls, and monitoring your team can use." steps={qualityProcess.map(step => ({ title: step.title, label: step.visual, description: step.description }))} /></section>
    <ServiceTools id="quality-tools" name={qualityService.name} eyebrow="Tools we use" title="Tools we use" introduction="We select quality, governance, catalog, and observability tools around your data environment and operating model."
      technologies={qualityTools.map(tool => tool.name)} details={qualityTools} presentation="platforms" balancedPlatforms showTechnologyLinks note={null} revealPrefix="quality-tool" headingReveal="quality-tools-heading" />
    <DraftCardSection section={qualitySections.results} variant="connected" visual={{ src: "/images/services/sub-services/benefits/data-quality-and-governance.jpg", alt: "Team reviewing governed data quality information" }} />
    <section className={cloudStyles.workBridge} aria-labelledby="quality-case-study-title"><Container><header className={cloudStyles.sectionHeading} data-reveal="quality-case-study-heading"><p className={cloudStyles.eyebrow}>Case study</p><h2 id="quality-case-study-title">Data quality case study</h2><p className={cloudStyles.contentState}>Explore published work relevant to data quality, governance, or trusted data.</p></header>{studies.length ? <ServiceCaseStudyGallery studies={studies} /> : <ReferenceEmptyState text="No published data quality case study is available yet. Explore other Vyntics projects in the meantime." href="/case-studies" label="View all case studies" />}</Container></section>
    <MigrationEngagementOptions sectionId="quality-engagement" title="Choose the right starting point" introduction="Start with a data quality audit, establish governance, or discuss ongoing monitoring and support." steps={qualityEngagements} />
    <section className={cloudStyles.context} aria-labelledby="quality-insights-title"><Container><header className={cloudStyles.sectionHeading} data-reveal="quality-insights-heading"><p className={cloudStyles.eyebrow}>Related insights</p><h2 id="quality-insights-title">Data quality and governance insights</h2></header>{insights.length ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div> : <ReferenceEmptyState text="We're adding published insights about data quality and governance. Browse the latest from our blog in the meantime." href="/blog" label="Visit the blog" />}<Link className={cloudStyles.primaryAction} href="/blog">View all insights <span aria-hidden="true">→</span></Link></Container></section>
    <section className={`${sectionStyles.section} ${subStyles.section}`} aria-labelledby="quality-faq-title"><FaqContent heading={<><h2 id="quality-faq-title">Frequently asked questions</h2><p className={subStyles.faqIntro}>Answers about data quality services, governance, and observability.</p><p className={subStyles.faqContact}>Have a question about your data controls? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>} items={qualityFaqs} name="quality-faq" label="Data quality questions" /></section>
    <DraftCardSection section={qualitySections.related} /><div data-reveal="quality-contact"><ContactCta eyebrow="Data quality services" title="Build trust into your data" intro="Tell us where data quality, ownership, or access is getting in the way. We can discuss a practical next step." submitLabel="Discuss data quality" sectionId="contact" /></div>
  </div><ScrollReveals scope={`#${contentId}`} /></div>;
}

function ReferenceEmptyState({ text, href, label }: { text: string; href: string; label: string }) { return <div className={subStyles.referenceEmpty}><p>{text}</p><Link className={cloudStyles.primaryAction} href={href}>{label} <span aria-hidden="true">→</span></Link></div>; }
