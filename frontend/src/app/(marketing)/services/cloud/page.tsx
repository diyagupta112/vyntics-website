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
import { canonicalCloudServices } from "./canonical-cloud-services";
import { cloudServiceIntroductions, cloudSteps } from "./cloud-foundations-content";
import { CloudProblems } from "./cloud-problems";
import problemStyles from "./cloud-problems.module.css";
import { DataEngineeringServicesShowcase } from "@/components/pages/data-engineering-services-showcase";
import { ServicePillarPlatforms, ServicePillarApproach } from "@/components/pages/service-pillar-sections";
import dataStyles from "../data/page.module.css";
import { NextServiceBanner } from "@/components/pages/next-service-banner";
import { CloudWhy } from "./cloud-why";
import { CloudFaq } from "./cloud-faq";
import styles from "./page.module.css";
import studyStyles from "../../case-studies/page.module.css";

export const metadata: Metadata = {
  title: "Cloud Consulting Services",
  description: "Vyntics provides cloud consulting services across architecture, migration, DevOps, reliability and cloud cost optimization for businesses.",
  alternates: { canonical: "/services/cloud-foundations" },
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

function ReservedContent({ count, message }: { count: number; message: string }) {
  return <div><p className={styles.contentState} role="status">{message}</p><div className={count === 2 ? styles.projectGrid : styles.insightsGrid} aria-hidden="true">{Array.from({ length: count }, (_, index) => <div className={styles.reservedSlot} key={index}><span>{String(index + 1).padStart(2, "0")}</span><div /><div /></div>)}</div></div>;
}

async function CloudProjects() {
  const result = await getCaseStudies("cloud_foundations").then(data => ({ data, unavailable: false }), () => ({ data: [], unavailable: true }));
  const projects = result.data;
  if (result.unavailable) return <ReservedContent count={2} message="Case studies are temporarily unavailable. You can explore our published work on the Case Studies page." />;
  return projects.length ? <ServiceCaseStudyGallery studies={projects} /> : <ReservedContent count={2} message="Case studies will appear here when available." />;
}

async function CloudInsights() {
  const result = await getBlogs("cloud_foundations");
  const posts = result.blogs.slice(0, 3);
  return posts.length ? <div className={studyStyles.otherGrid}>{posts.map(blog => <RelatedBlogCard blog={blog} variant="service" key={blog.id} />)}</div> : <ReservedContent count={3} message={result.status === "error" ? "Related insights are temporarily unavailable. You can explore our articles on the Blog page." : "Cloud insights will appear here when available."} />;
}

export default function CloudFoundationsPage() {
  return (
    <>
      <ServicesHero
        service="cloud-foundations"
        headingId="cloud-title"
        eyebrow={"Cloud consulting services"}
        title={"Build a stronger foundation for your cloud."}
        description={"Build, modernize, and support cloud infrastructure that works for your business. We bring architecture and migration together with reliability, security, cost optimization, and ongoing support."}
        primaryAction={{ href: "#contact", label: "Talk to our cloud experts" }}
        secondaryAction={{ href: "#cloud-services", label: "Our cloud services" }}
        capabilities={canonicalCloudServices.map(service => ({ label: service.title, href: `/services/cloud-foundations/${service.slug}` }))}
      />

      <section className={problemStyles.section} aria-labelledby="cloud-problems-title" data-cloud-section="Cloud problems we solve">
        <Container>
          <header className={problemStyles.intro}><p className={problemStyles.eyebrow}>Cloud Foundations</p><h2 id="cloud-problems-title">Cloud problems we solve</h2><p className={problemStyles.subtext}>From rising cloud costs to unreliable infrastructure, we help businesses solve the cloud challenges that slow them down.</p></header>
          <CloudProblems />
        </Container>
      </section>

      <section id="cloud-services" className={`${dataStyles.section} ${dataStyles.servicesSection}`} aria-labelledby="cloud-services-title" data-cloud-section="Our cloud services">
        <Container>
          <DataEngineeringServicesShowcase
            eyebrow="Cloud Foundations"
            heading="Our cloud services"
            headingId="cloud-services-title"
            idPrefix="cloud-service"
            label="Cloud Foundations services"
            services={canonicalCloudServices.map((service, index) => ({
              name: service.title,
              href: `/services/cloud-foundations/${service.slug}`,
              image: ["/images/services/our-services-section/cloud-migration-v2.png", "/images/services/our-services-section/devops-and-reliability-2.png", "/images/services/our-services-section/cloud-cost-optimization.png"][index],
              imageAlt: ["Team reviewing cloud migration progress on a large screen.", "Developer working with code and system monitoring on two screens.", "Laptop displaying a cloud cost dashboard with usage and spending charts."][index],
              introduction: cloudServiceIntroductions[index].summary,
              points: cloudServiceIntroductions[index].includes,
            }))}
          />
        </Container>
      </section>

      <CloudWhy />

      <ServicePillarPlatforms
        eyebrow="Cloud Foundations"
        heading="Cloud platforms we work with"
        headingId="cloud-platforms-title"
        sectionName="Cloud platforms we work with"
        introduction="We choose the cloud platform around your workloads, existing systems, security requirements, and team skills."
        platforms={[
          { name: "AWS", role: "Cloud infrastructure", description: "Architecture, workload migration, and operational tooling for applications and data on AWS." },
          { name: "Azure", role: "Microsoft cloud", description: "Cloud infrastructure services that connect Microsoft environments with secure, manageable Azure workloads." },
          { name: "Google Cloud", role: "Applications and data", description: "Cloud services for businesses building applications and data platforms on Google Cloud." },
        ]}
      />

      <ServicePillarApproach
        eyebrow="Our approach"
        heading="How we work"
        headingId="cloud-approach-title"
        sectionName="How we work"
        introduction="Five focused stages. One accountable delivery process built around usable outcomes."
        process={cloudSteps.map((step, index) => ({ ...step, visual: ["Workloads and goals", "Architecture and priorities", "Infrastructure and integrations", "Reliability and cost", "Operate and improve"][index] }))}
      />

      <section className={styles.workBridge} aria-labelledby="cloud-work-title" data-cloud-section="Case studies">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>CASE STUDIES</p><h2 id="cloud-work-title">Case studies</h2><p className={styles.contentState}>Explore how we’ve helped businesses solve complex technology challenges and turn them into practical outcomes.</p></header>
          <Suspense fallback={<ReservedContent count={2} message="Loading case studies…" />}><CloudProjects /></Suspense>
          <Link className={styles.secondaryAction} href="/case-studies">Explore all case studies <ArrowIcon /></Link>
        </Container>
      </section>

      <NextServiceBanner id="cloud-next" currentService="cloud-foundations" sectionClassName={styles.context} />

      <section className={styles.context} aria-labelledby="cloud-insights-title" data-cloud-section="Related insights">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>RELATED INSIGHTS</p><h2 id="cloud-insights-title">Related insights</h2></header>
          <Suspense fallback={<ReservedContent count={3} message="Loading cloud insights…" />}><CloudInsights /></Suspense>
          <Link className={styles.secondaryAction} href="/blog">View all insights <ArrowIcon /></Link>
        </Container>
      </section>

      <CloudFaq />

      <ContactCta
        eyebrow="CLOUD FOUNDATIONS"
        title="Build a stronger foundation for your cloud."
        intro="From architecture and migration to reliability and cost optimization, we help you build, optimize, and support cloud infrastructure that works for your business."
        submitLabel="Talk to our cloud experts"
      />
    </>
  );
}
