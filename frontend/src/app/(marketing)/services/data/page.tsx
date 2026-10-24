import { dataPlatforms as platforms } from "@/content/service-platforms";
import { ServicesHero } from "@/components/pages/services-hero";
import type { Metadata } from "next";
import Link from "next/link";
import { DataEngineeringProcessTimeline } from "@/components/pages/data-engineering-process-timeline";
import { DataEngineeringServicesShowcase } from "@/components/pages/data-engineering-services-showcase";
import { ServiceTools } from "@/components/pages/service-tools";
import { FaqContent } from "@/components/pages/faq-content";
import { RelatedBlogCard } from "@/components/pages/related-blog-card";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { Container } from "@/components/ui/container";
import { NextServiceBanner } from "@/components/pages/next-service-banner";
import { Suspense } from "react";
import { PublishedServiceCaseStudies } from "@/components/pages/published-service-case-studies";
import { FeaturedCaseStudySkeleton } from "@/components/sections/case-studies/case-study-skeleton";
import { getBlogs } from "@/lib/blogs";
import { DataProblems } from "./data-problems";
import { DataWhy } from "./data-why";
import cloudStyles from "../cloud/page.module.css";
import problemStyles from "../cloud/cloud-problems.module.css";
import faqStyles from "../cloud/cloud-faq.module.css";
import shared from "../../recognitions/page.module.css";
import studyStyles from "../../case-studies/page.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Data Engineering Services & Consulting",
  description: "Data engineering consulting for reliable pipelines, integration, cloud warehousing, lakehouse architecture, data quality, and governance.",
  alternates: { canonical: "https://vyntics.com/services/data-engineering" },
};



const dataServices = [
  { number: "01", title: "Data Pipelines & Integration", slug: "data-pipelines-integration" },
  { number: "02", title: "Data Warehousing & Lakehouse", slug: "data-warehousing-lakehouse" },
  { number: "03", title: "Data Quality & Governance", slug: "data-quality-governance" },
] as const;

const faqs = [
  { question: "What do data engineering services include?", answer: "They typically cover source integration, batch and streaming pipelines, transformation, data modelling, cloud warehouses or lakehouses, quality controls, lineage, governance, monitoring, and production support. The right scope depends on the decisions and workloads the data must serve." },
  { question: "Why does my business need data engineering?", answer: "If teams spend time exporting data, reconciling reports, waiting for refreshes, or debating which number is correct, the underlying data system is limiting the business. Data engineering creates the dependable flow, structure, and controls that reporting and AI require." },
  { question: "How long does a data engineering project take?", answer: "A focused pipeline or assessment can take weeks; a multi-source platform or migration can take several months. A credible estimate requires the source systems, data volume, quality, security, migration risk, and operating model to be assessed first." },
  { question: "How much do data engineering services cost?", answer: "There is no honest fixed price without scope. Cost depends on source count, data volume and velocity, platform choice, transformation complexity, security, migration, service levels, and the amount of ongoing support required." },
  { question: "Which tools and platforms do you work with?", answer: "We work across Snowflake, Databricks, BigQuery, Amazon Redshift, Microsoft Fabric, DBT, Airflow, Kafka, Python, SQL, AWS, Azure, and Google Cloud. We select the smallest sensible stack for the workload instead of forcing one vendor everywhere." },
  { question: "Can you work with our existing data systems?", answer: "Yes. Most engagements begin with existing databases, SaaS tools, files, APIs, reports, and partially working pipelines. We preserve useful systems, replace weak parts deliberately, and avoid a full rebuild unless the evidence justifies one." },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

async function DataInsights() {
  const result = await getBlogs("data_engineering");
  const posts = result.blogs.slice(0, 3);
  if (!posts.length) return <p className={cloudStyles.contentState} role="status">{result.status === "error" ? "Related insights are temporarily unavailable. You can explore our articles on the Blog page." : "Data engineering insights will appear here when available."}</p>;
  return <div className={studyStyles.otherGrid}>{posts.map(blog => <RelatedBlogCard blog={blog} variant="service" key={blog.id} />)}</div>;
}

export default function DataEngineeringPage() {

  return (
    <>
      <ServicesHero
        service="data-engineering"
        headingId="data-engineering-title"
        eyebrow={"Data engineering services"}
        title={"Build a data foundation your business can trust"}
        description={"We connect scattered systems, automate reliable data movement, and create governed, query-ready foundations for analytics and AI."}
        primaryAction={{ href: "/#contact", label: "Discuss your data estate" }}
        secondaryAction={{ href: "#data-services", label: "Our data services" }}
        capabilities={dataServices.map(service => ({ label: service.title, href: `/services/data-engineering/${service.slug}` }))}
      />

      <section className={`${problemStyles.section} ${styles.noDivider}`} aria-labelledby="problems-title">
        <Container>
          <header className={problemStyles.intro}><p className={problemStyles.eyebrow}>Data Engineering</p><h2 id="problems-title">Data Problems We Solve</h2><p className={problemStyles.subtext}>From unreliable pipelines to conflicting reports, we solve the data problems that slow decisions and undermine trust.</p></header>
          <DataProblems />
        </Container>
      </section>

      <section className={`${styles.section} ${styles.servicesSection}`} id="data-services" aria-labelledby="services-title">
        <Container>
          <DataEngineeringServicesShowcase heading="Three connected capabilities, one dependable data system" />
        </Container>
      </section>

      <DataWhy />

      <ServiceTools id="data-platforms" headingId="platforms-title" sectionName="Data platforms we work with" name="Data Engineering" eyebrow="Data platforms we work with"
        title="Choose the platform around the workload" introduction="We work across the major cloud data ecosystems and keep business logic portable where that is practical."
        technologies={platforms.map(platform => platform.name)} details={platforms.map(platform => ({ ...platform, displayName: platform.name === "dbt" ? "DBT" : platform.name }))} presentation="platforms" balancedPlatforms showTechnologyLinks note={null}
        sectionLink={{ href: "/technologies", label: "View all technologies" }} />

      <section className={`${styles.section} ${styles.processSection}`} aria-labelledby="process-title">
        <Container>
          <div className={`${styles.sectionHeading} ${styles.processHeading}`}><p className={styles.label}>How we work</p><h2 id="process-title">A clear path from assessment to dependable operations</h2><p>Five focused stages. One accountable delivery process built around usable outcomes.</p></div>
          <DataEngineeringProcessTimeline />
        </Container>
      </section>

      <section className={`${cloudStyles.workBridge} ${styles.noDivider}`} aria-labelledby="case-study-title">
        <Container>
          <header className={cloudStyles.sectionHeading}><p className={cloudStyles.eyebrow}>CASE STUDIES</p><h2 id="case-study-title">Case studies</h2><p className={cloudStyles.contentState}>Explore how we’ve helped businesses turn complex data challenges into dependable, practical systems.</p></header>
          <Suspense fallback={<FeaturedCaseStudySkeleton />}><PublishedServiceCaseStudies service="data_engineering" /></Suspense>
          <Link className={cloudStyles.secondaryAction} href="/case-studies">Explore all case studies <ArrowIcon /></Link>
        </Container>
      </section>

      <NextServiceBanner id="data-next" currentService="data-engineering" sectionClassName={styles.section} />

      <section className={`${cloudStyles.context} ${styles.noDivider}`} aria-labelledby="insights-title">
        <Container>
          <header className={cloudStyles.sectionHeading}><p className={cloudStyles.eyebrow}>RELATED INSIGHTS</p><h2 id="insights-title">Related insights</h2></header>
          <Suspense fallback={<p className={cloudStyles.contentState} role="status">Loading data engineering insights…</p>}><DataInsights /></Suspense>
          <Link className={cloudStyles.secondaryAction} href="/blog">View all insights <ArrowIcon /></Link>
        </Container>
      </section>

      <section className={shared.section} aria-labelledby="faq-title">
        <FaqContent
          heading={<>
            <h2 id="faq-title">Frequently Asked Questions</h2>
            <p className={faqStyles.introduction}>Practical answers about data engineering, delivery timelines, existing systems, platforms, and project scope.</p>
            <div className={faqStyles.contactFallback}>
              <p className={faqStyles.contactPrompt}>Can’t find the answer you’re looking for?</p>
              <p className={faqStyles.contactHelp}>Reach out to us at <a className={shared.faqEmail} href="mailto:contact@vyntics.com">contact@vyntics.com</a> and we’ll be happy to help.</p>
            </div>
          </>}
          items={faqs}
          name="data-engineering-faq"
          label="Data engineering questions"
        />
      </section>

      <ContactCta eyebrow="Data engineering consultation" title="Ready to make your data dependable?" intro="Tell us where the data is stuck, unreliable, or difficult to use. We’ll identify the practical first step and the evidence needed to scope it properly." submitLabel="Discuss your data project" />
    </>
  );
}
