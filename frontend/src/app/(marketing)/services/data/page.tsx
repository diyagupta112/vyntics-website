import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { Container } from "@/components/ui/container";
import { articles } from "@/content/articles";
import { getProject } from "@/content/projects";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Data Engineering Services",
  description: "Data engineering consulting for reliable pipelines, integration, cloud warehousing, lakehouse architecture, data quality, and governance.",
};

const problems = [
  { title: "Manual data movement", description: "Teams still export spreadsheets, copy files, and repair recurring transfers by hand." },
  { title: "Conflicting reports", description: "The same metric produces different answers because definitions and transformation logic are scattered." },
  { title: "Slow or stale data", description: "Important decisions depend on refreshes that arrive late, fail silently, or cannot be replayed safely." },
  { title: "Unclear ownership", description: "When data breaks, nobody knows who owns the source, the pipeline, the definition, or the fix." },
] as const;

const services = [
  { title: "Data Pipelines & Integration", description: "Observable batch and streaming pipelines connecting APIs, databases, files, SaaS platforms, and internal systems.", href: "/services/data/data-pipelines-integration" },
  { title: "Data Warehousing & Lakehouse", description: "Governed cloud platforms and reusable analytical models designed around real workloads, access patterns, and growth.", href: "/services/data/data-warehousing-lakehouse" },
  { title: "Data Quality & Governance", description: "Definitions, ownership, lineage, validation, access controls, and issue workflows for critical business data.", href: "/services/data/data-quality-governance" },
] as const;

const reasons = [
  { title: "Engineering before tooling", description: "We choose technology after the workload, constraints, ownership, and recovery requirements are understood." },
  { title: "Built for failure", description: "Retries, backfills, reconciliation, observability, and runbooks are part of the system—not postponed until production." },
  { title: "Definitions with owners", description: "Important models and metrics have clear meaning, accountable owners, lineage, and a controlled change path." },
  { title: "Direct technical delivery", description: "The engineers shaping the architecture stay involved through implementation, validation, and handover." },
] as const;

const platforms = [
  { name: "Snowflake", role: "Cloud data platform", description: "Elastic warehousing, governed sharing, and workload separation for analytical teams." },
  { name: "Databricks", role: "Lakehouse", description: "Unified engineering, analytics, and machine-learning workloads over structured and unstructured data." },
  { name: "Google BigQuery", role: "Serverless warehouse", description: "Managed analytical compute for teams that need scale without operating warehouse infrastructure." },
  { name: "Amazon Redshift", role: "AWS warehousing", description: "Integrated cloud warehousing for organizations already building their data estate on AWS." },
  { name: "Microsoft Fabric", role: "Microsoft data platform", description: "Integrated engineering, warehousing, semantic models, and Power BI delivery in one ecosystem." },
  { name: "dbt", role: "Transformation", description: "Versioned SQL models, tests, documentation, and lineage for maintainable analytics engineering." },
] as const;

const process = [
  { title: "Assess", description: "Map sources, consumers, ownership, definitions, risk, data quality, and the decisions the system must support." },
  { title: "Design", description: "Define architecture, data contracts, models, security, lineage, quality rules, and operating responsibilities." },
  { title: "Build", description: "Deliver in usable increments with version control, automated tests, reconciliation, and deployment discipline." },
  { title: "Monitor", description: "Track freshness, volume, failures, quality, performance, lineage, usage, and cost in production." },
  { title: "Support", description: "Resolve incidents, maintain source integrations, improve weak points, and transfer practical ownership to your team." },
] as const;

const measures = ["Data freshness", "Pipeline reliability", "Manual work removed", "Query performance", "Quality failures caught", "Platform cost"] as const;

const faqs = [
  { question: "What do data engineering services include?", answer: "They typically cover source integration, batch and streaming pipelines, transformation, data modelling, cloud warehouses or lakehouses, quality controls, lineage, governance, monitoring, and production support. The right scope depends on the decisions and workloads the data must serve." },
  { question: "Why does my business need data engineering?", answer: "If teams spend time exporting data, reconciling reports, waiting for refreshes, or debating which number is correct, the underlying data system is limiting the business. Data engineering creates the dependable flow, structure, and controls that reporting and AI require." },
  { question: "How long does a data engineering project take?", answer: "A focused pipeline or assessment can take weeks; a multi-source platform or migration can take several months. A credible estimate requires the source systems, data volume, quality, security, migration risk, and operating model to be assessed first." },
  { question: "How much do data engineering services cost?", answer: "There is no honest fixed price without scope. Cost depends on source count, data volume and velocity, platform choice, transformation complexity, security, migration, service levels, and the amount of ongoing support required." },
  { question: "Which tools and platforms do you work with?", answer: "We work across Snowflake, Databricks, BigQuery, Amazon Redshift, Microsoft Fabric, dbt, Airflow, Kafka, Python, SQL, AWS, Azure, and Google Cloud. We select the smallest sensible stack for the workload instead of forcing one vendor everywhere." },
  { question: "Can you work with our existing data systems?", answer: "Yes. Most engagements begin with existing databases, SaaS tools, files, APIs, reports, and partially working pipelines. We preserve useful systems, replace weak parts deliberately, and avoid a full rebuild unless the evidence justifies one." },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export default function DataEngineeringPage() {
  const project = getProject("property-data-platform");
  const relatedInsights = articles.filter((article) => article.category === "Data Engineering").slice(0, 3);

  return (
    <>
      <section className={styles.hero} aria-labelledby="data-engineering-title">
        <Container>
          <Link className={styles.backLink} href="/#services">← All services</Link>
          <p className={styles.eyebrow}>Data engineering services</p>
          <h1 id="data-engineering-title">Build a data foundation your business can trust.</h1>
          <p className={styles.heroIntro}>We connect scattered systems, automate reliable data movement, and create governed, query-ready foundations for analytics and AI.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#contact">Discuss your data estate <ArrowIcon /></a>
            <a className={styles.secondaryLink} href="#data-services">Explore our services</a>
          </div>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="problems-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>Data problems we solve</p><h2 id="problems-title">The warning signs usually appear before the platform fails.</h2><p>We start with the operational problem—not a predetermined stack.</p></div>
          <div className={styles.problemGrid}>
            {problems.map((problem, index) => <article key={problem.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{problem.title}</h3><p>{problem.description}</p></article>)}
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.servicesSection}`} id="data-services" aria-labelledby="services-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>Our data engineering services</p><h2 id="services-title">Three connected capabilities, one dependable data system.</h2></div>
          <div className={styles.serviceGrid}>
            {services.map((service, index) => <Link href={service.href} key={service.href}><span className={styles.cardNumber}>{String(index + 1).padStart(2, "0")}</span><div><h3>{service.title}</h3><p>{service.description}</p></div><ArrowIcon /></Link>)}
          </div>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="why-title">
        <Container className={styles.whyLayout}>
          <div className={styles.stickyHeading}><p className={styles.label}>Why Vyntics for data</p><h2 id="why-title">Systems designed to survive real operations.</h2><p>Architecture diagrams are easy. Reliable ownership, recovery, and trust are the hard parts.</p></div>
          <div className={styles.reasonList}>{reasons.map((reason, index) => <article key={reason.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{reason.title}</h3><p>{reason.description}</p></div></article>)}</div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.platformSection}`} aria-labelledby="platforms-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>Data platforms we work with</p><h2 id="platforms-title">Choose the platform around the workload.</h2><p>We work across the major cloud data ecosystems and keep business logic portable where that is practical.</p></div>
          <div className={styles.platformGrid}>{platforms.map((platform) => <article key={platform.name}><p>{platform.role}</p><h3>{platform.name}</h3><span>{platform.description}</span></article>)}</div>
          <Link className={styles.inlineLink} href="/technologies">View all technologies <ArrowIcon /></Link>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="process-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>How we work</p><h2 id="process-title">Assess. Design. Build. Monitor. Support.</h2></div>
          <ol className={styles.processList}>{process.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol>
        </Container>
      </section>

      {project && <section className={`${styles.section} ${styles.caseStudySection}`} aria-labelledby="case-study-title">
        <Container>
          <div className={styles.caseStudyCard}>
            <div><p className={styles.label}>Data case study</p><h2 id="case-study-title">{project.title}</h2><p className={styles.caseSummary}>{project.summary}</p><ul>{project.proofPoints.map((point) => <li key={point}>{point}</li>)}</ul><Link href={`/case-studies/${project.slug}`}>Read the case study <ArrowIcon /></Link></div>
            <div className={styles.caseMeasure}><strong>{project.metric}</strong><span>{project.metricLabel}</span><p>Built with {project.stack.join(", ")}.</p></div>
          </div>
          <div className={styles.measureBar} aria-label="Measures used to evaluate data engineering results"><p>Results we measure</p><ul>{measures.map((measure) => <li key={measure}>{measure}</li>)}</ul></div>
        </Container>
      </section>}

      <section className={styles.section} aria-labelledby="journey-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>The wider journey</p><h2 id="journey-title">A data platform needs a foundation—and a purpose.</h2></div>
          <div className={styles.journeyGrid}>
            <Link href="/services/cloud/cloud-architecture-migration"><span>Previous stage</span><h3>Cloud Foundations</h3><p>Establish secure, reliable infrastructure for data workloads.</p><strong>Explore cloud services <ArrowIcon /></strong></Link>
            <Link href="/services/analytics/dashboards-executive-reporting"><span>What comes next</span><h3>Analytics & BI</h3><p>Turn trusted models into dashboards, KPIs, and reporting people can act on.</p><strong>Explore analytics services <ArrowIcon /></strong></Link>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.insightsSection}`} aria-labelledby="insights-title">
        <Container>
          <div className={styles.sectionHeading}><p className={styles.label}>Related insights</p><h2 id="insights-title">Practical guidance for data leaders.</h2></div>
          <div className={styles.insightGrid}>{relatedInsights.map((article) => <a href={article.href} key={article.href}><span>{article.category} · {article.readTime}</span><h3>{article.title}</h3><p>{article.description}</p><strong>Read article <ArrowIcon /></strong></a>)}</div>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="faq-title">
        <Container className={styles.faqLayout}>
          <div className={styles.stickyHeading}><p className={styles.label}>Frequently asked questions</p><h2 id="faq-title">Straight answers before the project starts.</h2></div>
          <div className={styles.faqList}>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
        </Container>
      </section>

      <ContactCta eyebrow="Data engineering consultation" title="Ready to make your data dependable?" intro="Tell us where the data is stuck, unreliable, or difficult to use. We’ll identify the practical first step and the evidence needed to scope it properly." submitLabel="Discuss your data project" />
    </>
  );
}
