import { CrmHero } from "./crm-hero";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { getCaseStudies } from "@/lib/case-studies";
import { getBlogs } from "@/lib/blogs";
import { crmContent as content } from "./crm-revenue-ops-content";
import { PageProblems } from "./page-problems";
import problemStyles from "../cloud/cloud-problems.module.css";
import { PageServicesShowcase } from "./page-services-showcase";
import { ServicePillarPlatforms, ServicePillarApproach } from "@/components/pages/service-pillar-sections";
import dataStyles from "../data/page.module.css";
import { NextServiceBanner } from "@/components/pages/next-service-banner";
import { PageWhy } from "./page-why";
import { PageFaq } from "./page-faq";
import styles from "../cloud/page.module.css";
import studyStyles from "../../case-studies/page.module.css";

const seoTitle = content.seo.title;
const seoDescription = content.seo.description;
const canonical = content.seo.canonical;

export const metadata: Metadata = {
  title: { absolute: seoTitle },
  description: seoDescription,
  alternates: { canonical },
  openGraph: { title: seoTitle, description: seoDescription, url: canonical, type: "website", siteName: "Vyntics" },
  twitter: { card: "summary", title: seoTitle, description: seoDescription },
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

function ReservedContent({ count, message }: { count: number; message: string }) {
  return <div><p className={styles.contentState} role="status">{message}</p><div className={count === 2 ? styles.projectGrid : styles.insightsGrid} aria-hidden="true">{Array.from({ length: count }, (_, index) => <div className={styles.reservedSlot} key={index}><span>{String(index + 1).padStart(2, "0")}</span><div /><div /></div>)}</div></div>;
}

async function PageProjects() {
  const result = await getCaseStudies("crm_revenue_ops").then(data => ({ data, unavailable: false }), () => ({ data: [], unavailable: true }));
  const projects = result.data.slice(0, 2);
  if (result.unavailable) return <ReservedContent count={2} message="Case studies are temporarily unavailable. You can explore our published work on the Case Studies page." />;
  return projects.length ? <ServiceCaseStudyGallery studies={projects} /> : <ReservedContent count={2} message="Case studies will appear here when available." />;
}

async function PageInsights() {
  const result = await getBlogs("crm_revenue_ops");
  const posts = result.blogs.slice(0, 3);
  return posts.length ? <div className={studyStyles.otherGrid}>{posts.map(blog => <RelatedBlogCard blog={blog} variant="service" key={blog.id} />)}</div> : <ReservedContent count={3} message={result.status === "error" ? "Related insights are temporarily unavailable. You can explore our articles on the Blog page." : "Related insights will appear here when available."} />;
}

export default function ServicePage() {
  return (
    <>
      <CrmHero />

      <section className={problemStyles.section} aria-labelledby="crm-problems-title" data-cloud-section={content.problemsHeading}>
        <Container>
          <header className={problemStyles.intro}><p className={problemStyles.eyebrow}>{content.name}</p><h2 id="crm-problems-title">{content.problemsHeading}</h2><p className={problemStyles.subtext}>{content.problemIntroduction}</p></header>
          <PageProblems />
        </Container>
      </section>

      <section id="crm-services" className={`${dataStyles.section} ${dataStyles.servicesSection}`} aria-labelledby="crm-services-title" data-cloud-section={content.servicesHeading}>
        <Container>
          <PageServicesShowcase
            eyebrow={content.name}
            heading={content.servicesHeading}
            headingId="crm-services-title"
            idPrefix="crm-service"
            label={`${content.name} services`}
            services={content.services}
          />
        </Container>
      </section>

      <PageWhy />

      <ServicePillarPlatforms
        eyebrow={content.name}
        heading={content.platformsHeading}
        headingId="crm-platforms-title"
        sectionName={content.platformsHeading}
        introduction={content.platformsIntroduction}
        platforms={content.platforms}
      />

      <ServicePillarApproach
        eyebrow={content.approachEyebrow}
        heading={content.approachHeading}
        headingId="crm-approach-title"
        sectionName={content.approachHeading}
        introduction={content.approachIntroduction}
        process={content.steps}
      />

      <section className={styles.workBridge} aria-labelledby="crm-work-title" data-cloud-section="Case studies">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>{content.caseStudies.eyebrow}</p><h2 id="crm-work-title">{content.caseStudies.heading}</h2><p className={styles.contentState}>{content.caseStudies.introduction}</p></header>
          <Suspense fallback={<ReservedContent count={2} message="Loading case studies…" />}><PageProjects /></Suspense>
          <Link className={styles.secondaryAction} href="/case-studies">{content.caseStudies.linkLabel} <ArrowIcon /></Link>
        </Container>
      </section>

      <NextServiceBanner id="crm-next" currentService="crm-revenue-ops" sectionClassName={styles.context} />

      <section className={styles.context} aria-labelledby="crm-insights-title" data-cloud-section="Related insights">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>{content.insights.eyebrow}</p><h2 id="crm-insights-title">{content.insights.heading}</h2></header>
          <Suspense fallback={<ReservedContent count={3} message="Loading related insights…" />}><PageInsights /></Suspense>
          <Link className={styles.secondaryAction} href="/blog">{content.insights.linkLabel} <ArrowIcon /></Link>
        </Container>
      </section>

      <PageFaq />

      <ContactCta
        eyebrow={content.cta.eyebrow}
        submitLabel={content.cta.submitLabel}
        title={content.cta.heading}
        intro={content.cta.introduction}
      />
    </>
  );
}
