import { ServicesHero } from "@/components/pages/services-hero";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { ServiceCaseStudyGallery } from "@/components/pages/service-case-study-gallery";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { getCaseStudies } from "@/lib/case-studies";
import { getBlogs } from "@/lib/blogs";
import { analyticsContent } from "./analytics-bi-content";
import { AnalyticsProblems } from "./analytics-problems";
import problemStyles from "../cloud/cloud-problems.module.css";
import { DataEngineeringServicesShowcase } from "@/components/pages/data-engineering-services-showcase";
import { ServicePillarPlatforms, ServicePillarApproach } from "@/components/pages/service-pillar-sections";
import dataStyles from "../data/page.module.css";
import { NextServiceBanner } from "@/components/pages/next-service-banner";
import { AnalyticsWhy } from "./analytics-why";
import { AnalyticsFaq } from "./analytics-faq";
import styles from "../cloud/page.module.css";
import studyStyles from "../../case-studies/page.module.css";

const seoTitle = "Business Intelligence Services | Vyntics";
const seoDescription = analyticsContent.seoDescription;
const canonical = "https://vyntics.com/services/analytics-bi";

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

async function AnalyticsProjects() {
  const result = await getCaseStudies("analytics_bi").then(data => ({ data, unavailable: false }), () => ({ data: [], unavailable: true }));
  const projects = result.data.slice(0, 2);
  if (result.unavailable) return <ReservedContent count={2} message="Case studies are temporarily unavailable. You can explore our published work on the Case Studies page." />;
  return projects.length ? <ServiceCaseStudyGallery studies={projects} /> : <ReservedContent count={2} message="Case studies will appear here when available." />;
}

async function AnalyticsInsights() {
  const result = await getBlogs("analytics_bi");
  const posts = result.blogs.slice(0, 3);
  return posts.length ? <div className={studyStyles.otherGrid}>{posts.map(blog => <RelatedBlogCard blog={blog} variant="service" key={blog.id} />)}</div> : <ReservedContent count={3} message={result.status === "error" ? "Related insights are temporarily unavailable. You can explore our articles on the Blog page." : "Related insights will appear here when available."} />;
}

export default function AnalyticsBiPage() {
  return (
    <>
      <ServicesHero
        service="analytics-bi"
        headingId="analytics-title"
        eyebrow={analyticsContent.hero.eyebrow}
        title={analyticsContent.hero.heading}
        description={analyticsContent.hero.introduction}
        primaryAction={{ href: "/#contact", label: analyticsContent.hero.primaryLabel }}
        secondaryAction={{ href: "#analytics-services", label: "Our analytics & BI services" }}
        capabilities={analyticsContent.services.map(service => ({ label: service.name, href: service.href }))}
      />

      <section className={problemStyles.section} aria-labelledby="analytics-problems-title" data-cloud-section="Analytics problems we solve">
        <Container>
          <header className={problemStyles.intro}><p className={problemStyles.eyebrow}>Analytics &amp; BI</p><h2 id="analytics-problems-title">Analytics problems we solve</h2><p className={problemStyles.subtext}>{analyticsContent.problemIntroduction}</p></header>
          <AnalyticsProblems />
        </Container>
      </section>

      <section id="analytics-services" className={`${dataStyles.section} ${dataStyles.servicesSection}`} aria-labelledby="analytics-services-title" data-cloud-section="Our analytics & BI services">
        <Container>
          <DataEngineeringServicesShowcase
            eyebrow="Analytics & BI"
            heading="Our analytics & BI services"
            headingId="analytics-services-title"
            idPrefix="analytics-service"
            label="Analytics & BI services"
            imageLabel="Analytics & BI"
            services={analyticsContent.services}
          />
        </Container>
      </section>

      <AnalyticsWhy />

      <ServicePillarPlatforms
        eyebrow="Analytics & BI"
        heading="BI tools we work with"
        headingId="analytics-platforms-title"
        sectionName="BI tools we work with"
        introduction={analyticsContent.platformsIntroduction}
        platforms={analyticsContent.platforms}
        showTechnologyLinks={false}
      />

      <ServicePillarApproach
        eyebrow="Our approach"
        heading="How we work"
        headingId="analytics-approach-title"
        sectionName="How we work"
        introduction={analyticsContent.approachIntroduction}
        process={analyticsContent.steps}
      />

      <section className={styles.workBridge} aria-labelledby="analytics-work-title" data-cloud-section="Case studies">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>CASE STUDIES</p><h2 id="analytics-work-title">Case Studies</h2><p className={styles.contentState}>{analyticsContent.caseStudiesIntroduction}</p></header>
          <Suspense fallback={<ReservedContent count={2} message="Loading case studies…" />}><AnalyticsProjects /></Suspense>
          <Link className={styles.secondaryAction} href="/case-studies">Explore all case studies <ArrowIcon /></Link>
        </Container>
      </section>

      <NextServiceBanner id="analytics-next" currentService="analytics-bi" sectionClassName={styles.context} introduction={analyticsContent.nextIntroduction} />

      <section className={styles.context} aria-labelledby="analytics-insights-title" data-cloud-section="Related insights">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>RELATED INSIGHTS</p><h2 id="analytics-insights-title">Related Insights</h2></header>
          <Suspense fallback={<ReservedContent count={3} message="Loading related insights…" />}><AnalyticsInsights /></Suspense>
          <Link className={styles.secondaryAction} href="/blog">View all insights <ArrowIcon /></Link>
        </Container>
      </section>

      <AnalyticsFaq />

      <ContactCta
        eyebrow={analyticsContent.cta.eyebrow}
        submitLabel={analyticsContent.cta.submitLabel}
        title={analyticsContent.cta.heading}
        intro={analyticsContent.cta.introduction}
      />
    </>
  );
}
