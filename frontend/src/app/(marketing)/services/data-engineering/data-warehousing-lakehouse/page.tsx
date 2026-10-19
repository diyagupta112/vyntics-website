import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { PathToResilienceOrbitalTimeline } from "@/components/ui/path-to-resilience-orbital-timeline";
import { CloudSubHero } from "@/components/service-sub/hero";
import { DraftCardSection } from "@/components/service-sub/draft-sections";
import { MigrationEngagementOptions } from "@/components/service-sub/migration-engagement-options";
import { WarehouseArchitecture } from "@/components/service-sub/warehouse-architecture";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { FaqContent } from "@/components/pages/faq-content";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { ServiceTools } from "@/components/pages/service-tools";
import { getBlogs } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import { warehouseEngagements, warehouseFaqs, warehousePlatforms, warehouseProcess, warehouseSections, warehouseService } from "./content";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import cloudStyles from "@/app/(marketing)/services/cloud/page.module.css";
import studyStyles from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./page.module.css";
import subStyles from "@/components/service-sub/service-sub.module.css";

export const metadata: Metadata = { title: warehouseService.seoTitle, description: warehouseService.seoDescription, keywords: ["data warehousing services", "data warehouse consulting", "Snowflake consulting", "BigQuery consulting", "Amazon Redshift services", "data lakehouse services", "Databricks consulting", "data warehouse modernization"], alternates: { canonical: "/services/data-engineering/data-warehousing-lakehouse" } };
const relevance = /\b(data warehouse|warehouse|lakehouse|Snowflake|BigQuery|Redshift|Databricks|Synapse|data engineering)\b/i;

export default async function DataWarehousingLakehousePage() {
  const [caseStudies, blogResult] = await Promise.all([getCaseStudies("data_engineering").catch(() => [] as CaseStudyListItem[]), getBlogs("data_engineering")]);
  const studies = caseStudies.filter(study => relevance.test([study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" "))).slice(0, 1);
  const insights = blogResult.blogs.filter(post => (!post.status || post.status === "published") && relevance.test(`${post.title} ${post.category} ${post.excerpt}`)).slice(0, 3);
  const contentId = "data-warehouse-content";
  const heroPage = { ...warehouseService, key: "data-warehousing-lakehouse" };
  return <div className={styles.page} data-data-sub-page="data-warehousing-lakehouse"><CloudSubHero page={heroPage} /><div id={contentId}>
    <DraftCardSection section={warehouseSections.signs} variant="diagnostic" signalEyebrow="" />
    <DraftCardSection section={warehouseSections.warehousing} variant="services" />
    <DraftCardSection section={warehouseSections.lakehouse} variant="services" />
    <section className={`${sectionStyles.section} ${styles.section}`} id="warehouse-process" aria-labelledby="warehouse-process-title"><PathToResilienceOrbitalTimeline showStepNumbers eyebrow="How we work" title="Our process" headingId="warehouse-process-title" description="A clear path from scattered data to a foundation your reporting and AI workloads can use." steps={warehouseProcess.map(step => ({ title: step.title, label: step.visual, description: step.description }))} /></section>
    <WarehouseArchitecture />
    <ServiceTools id="warehouse-platforms" name={warehouseService.name} eyebrow="Platforms" title="Platforms" introduction="We compare the fit with your existing systems, data requirements, team skills, and operating model."
      technologies={warehousePlatforms.map(platform => platform.name)} details={warehousePlatforms} presentation="platforms" balancedPlatforms showTechnologyLinks note={null} revealPrefix="warehouse-platform" headingReveal="warehouse-platforms-heading" />
    <DraftCardSection section={warehouseSections.results} variant="connected" visual={{ src: "/images/services/sub-services/benefits/data-warehousing-and-lakehouse.jpg", alt: "Team reviewing a central data warehouse and analytics workspace" }} />
    <section className={cloudStyles.workBridge} aria-labelledby="warehouse-case-study-title"><Container><header className={cloudStyles.sectionHeading} data-reveal="warehouse-case-study-heading"><p className={cloudStyles.eyebrow}>Case study</p><h2 id="warehouse-case-study-title">Data warehousing case study</h2><p className={cloudStyles.contentState}>Explore published work relevant to data warehouses, lakehouses, or analytics foundations.</p></header>{studies.length ? <ServiceCaseStudyGallery studies={studies} /> : <ReferenceEmptyState text="No published data warehousing case study is available yet. Explore other Vyntics projects in the meantime." href="/case-studies" label="View all case studies" />}</Container></section>
    <MigrationEngagementOptions sectionId="warehouse-engagement" title="Choose the right starting point" introduction="Start with a warehouse assessment, move into a build or migration, or discuss ongoing support." steps={warehouseEngagements} />
    <section className={cloudStyles.context} aria-labelledby="warehouse-insights-title"><Container><header className={cloudStyles.sectionHeading} data-reveal="warehouse-insights-heading"><p className={cloudStyles.eyebrow}>Related insights</p><h2 id="warehouse-insights-title">Data warehousing and lakehouse insights</h2></header>{insights.length ? <div className={studyStyles.otherGrid}>{insights.map(post => <RelatedBlogCard key={post.id} blog={post} variant="service" />)}</div> : <ReferenceEmptyState text="We're adding published insights about warehouses and lakehouses. Browse the latest from our blog in the meantime." href="/blog" label="Visit the blog" />}<Link className={cloudStyles.primaryAction} href="/blog">View all insights <span aria-hidden="true">→</span></Link></Container></section>
    <section className={`${sectionStyles.section} ${subStyles.section}`} aria-labelledby="warehouse-faq-title"><FaqContent heading={<><h2 id="warehouse-faq-title">Frequently asked questions</h2><p className={subStyles.faqIntro}>Answers about data warehousing services and lakehouse foundations.</p><p className={subStyles.faqContact}>Have a question about your data foundation? <a href="mailto:contact@vyntics.com">Contact our team</a>.</p></>} items={warehouseFaqs} name="warehouse-faq" label="Data warehouse questions" /></section>
    <DraftCardSection section={warehouseSections.related} /><div data-reveal="warehouse-contact"><ContactCta eyebrow="Data warehousing services" title="Build a trusted data foundation" intro="Tell us where your data lives, what your teams need to use, and what is preventing a shared foundation today." submitLabel="Discuss data warehousing" sectionId="contact" /></div>
  </div><ScrollReveals scope={`#${contentId}`} /></div>;
}

function ReferenceEmptyState({ text, href, label }: { text: string; href: string; label: string }) { return <div className={subStyles.referenceEmpty}><p>{text}</p><Link className={cloudStyles.primaryAction} href={href}>{label} <span aria-hidden="true">→</span></Link></div>; }
