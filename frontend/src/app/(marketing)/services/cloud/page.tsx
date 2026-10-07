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
import { isCloudContent } from "./cloud-foundations-content";
import { CloudProblems } from "./cloud-problems";
import problemStyles from "./cloud-problems.module.css";
import { CloudProcess } from "./cloud-process";
import { CloudFaq } from "./cloud-faq";
import styles from "./page.module.css";
import studyStyles from "../../case-studies/page.module.css";

export const metadata: Metadata = {
  title: "Cloud Foundations",
  description: "Explore Vyntics cloud architecture, migration, DevOps, reliability, and cost optimization services.",
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

function ReservedContent({ count, message }: { count: number; message: string }) {
  return <div><p className={styles.contentState} role="status">{message}</p><div className={count === 2 ? styles.projectGrid : styles.insightsGrid} aria-hidden="true">{Array.from({ length: count }, (_, index) => <div className={styles.reservedSlot} key={index}><span>{String(index + 1).padStart(2, "0")}</span><div /><div /></div>)}</div></div>;
}

async function CloudProjects() {
  const result = await getCaseStudies().then(data => ({ data, unavailable: false }), () => ({ data: [], unavailable: true }));
  const projects = result.data;
  if (result.unavailable) return <ReservedContent count={2} message="Case studies are temporarily unavailable. You can explore our published work on the Case Studies page." />;
  return projects.length ? <ServiceCaseStudyGallery studies={projects} /> : <ReservedContent count={2} message="Case studies will appear here when available." />;
}

async function CloudInsights() {
  const result = await getBlogs();
  // The public endpoint omits status; preview responses include it, so exclude drafts there.
  const seen = new Set<string>();
  const published = result.blogs.filter(blog => {
    if (blog.status && blog.status !== "published" || seen.has(blog.slug)) return false;
    seen.add(blog.slug);
    return true;
  });
  const relevant = (blog: (typeof published)[number]) => isCloudContent([blog.title, blog.category, blog.excerpt]);
  const posts = [...published.filter(relevant), ...published.filter(blog => !relevant(blog))].slice(0, 3);
  return posts.length ? <div className={studyStyles.otherGrid}>{posts.map(blog => <RelatedBlogCard blog={blog} variant="service" key={blog.id} />)}</div> : <ReservedContent count={3} message={result.status === "error" ? "Related insights are temporarily unavailable. You can explore our articles on the Blog page." : "Cloud insights will appear here when available."} />;
}

export default function CloudFoundationsPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="cloud-title" data-cloud-section="Hero">
        <Container className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Hero</p>
            <h1 id="cloud-title">Cloud Foundations</h1>
            <p>Cloud Architecture &amp; Migration. DevOps &amp; Reliability. Cloud Cost Optimization.</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="#contact">Discuss your cloud requirements <ArrowIcon /></Link>
              <Link className={styles.secondaryAction} href="#cloud-services">Our cloud services</Link>
            </div>
          </div>
          <nav className={styles.scopeIndex} aria-label="Cloud Foundations services">
            <p>Cloud Foundations</p>
            <div className={styles.foundationSymbol} aria-hidden="true"><svg viewBox="0 0 80 64"><path d="m40 8 28 16-28 16L12 24 40 8ZM12 34l28 16 28-16M12 44l28 16 28-16" /></svg></div>
            <ol>{canonicalCloudServices.map(service => <li key={service.slug}><Link href={`/services/cloud-foundations/${service.slug}`}><span>{service.number}</span>{service.title}</Link></li>)}</ol>
          </nav>
        </Container>
      </section>

      <section className={problemStyles.section} aria-labelledby="cloud-problems-title" data-cloud-section="Cloud problems we solve">
        <Container>
          <header className={problemStyles.intro}><p className={problemStyles.eyebrow}>Cloud Foundations</p><h2 id="cloud-problems-title">Cloud problems we solve</h2><p className={problemStyles.subtext}>From rising cloud costs to unreliable infrastructure, we help businesses solve the cloud challenges that slow them down.</p></header>
          <CloudProblems />
        </Container>
      </section>

      <section id="cloud-services" className={styles.services} aria-labelledby="cloud-services-title" data-cloud-section="Our cloud services">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>Cloud Foundations</p><h2 id="cloud-services-title">Our cloud services</h2></header>
          <div className={styles.serviceList}>{canonicalCloudServices.map((service, index) => (
            <details className={styles.serviceDisclosure} key={service.slug} open={index === 0}>
              <summary><span className={styles.serviceNumber}>{service.number}</span><h3>{service.title}</h3><span className={styles.disclosureToggle} aria-hidden="true">+</span></summary>
              <div className={styles.serviceExpanded}>
                <p>{service.summary}</p>
                <div className={styles.childOverview}><p>Includes</p><ul>{service.workAreas.slice(0, 3).map(area => <li key={area.title}>{area.title}</li>)}</ul><Link href={`/services/cloud-foundations/${service.slug}`}>Explore service <ArrowIcon /></Link></div>
              </div>
            </details>
          ))}</div>
        </Container>
      </section>

      <section className={styles.context} aria-labelledby="cloud-why-title" data-cloud-section="Why Vyntics for cloud">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>Cloud Foundations</p><h2 id="cloud-why-title">Why Vyntics for cloud</h2></header>
          <div className={styles.lifecycle}>
            <div><span>01</span><strong>Explicit decisions</strong><p>Architecture decisions, priorities, and a delivery plan with explicit tradeoffs.</p></div>
            <div><span>02</span><strong>Controlled delivery</strong><p>Build or change the environment in controlled stages, validating behavior as the work progresses.</p></div>
            <div><span>03</span><strong>Operational ownership</strong><p>Document what was built, support operational ownership, and identify the next useful improvements.</p></div>
          </div>
        </Container>
      </section>

      <section className={styles.platforms} aria-labelledby="cloud-platforms-title" data-cloud-section="Cloud platforms we work with">
        <Container className={styles.platformGrid}>
          <div><p className={styles.eyebrow}>Cloud Foundations</p><h2 id="cloud-platforms-title">Cloud platforms we work with</h2></div>
          <ul>{["AWS", "Azure", "Google Cloud"].map(platform => <li key={platform}><span aria-hidden="true" className={styles.platformMark}>{platform === "AWS" ? "↗" : platform === "Azure" ? "△" : "◌"}</span>{platform}</li>)}</ul>
        </Container>
      </section>

      <section className={styles.approach} aria-labelledby="cloud-approach-title" data-cloud-section="How we work">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>Cloud Foundations</p><h2 id="cloud-approach-title">How we work</h2></header>
          <CloudProcess />
        </Container>
      </section>

      <section className={styles.workBridge} aria-labelledby="cloud-work-title" data-cloud-section="Case studies">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>CASE STUDIES</p><h2 id="cloud-work-title">See our work in action.</h2><p className={styles.contentState}>Explore how we’ve helped businesses solve complex technology challenges and turn them into practical outcomes.</p></header>
          <Suspense fallback={<ReservedContent count={2} message="Loading case studies…" />}><CloudProjects /></Suspense>
        </Container>
      </section>

      <section className={styles.nextStage} aria-labelledby="cloud-next-title" data-cloud-section="What comes next">
        <Container className={styles.workBridgeInner}>
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>Cloud Foundations</p><h2 id="cloud-next-title">What comes next</h2><p className={styles.nextStageName}>Data Engineering</p></div>
          <div><p>Reliable pipelines, integration, and trusted data.</p><Link className={styles.secondaryAction} href="/services/data-engineering">Explore Data Engineering <ArrowIcon /></Link></div>
        </Container>
      </section>

      <section className={styles.context} aria-labelledby="cloud-insights-title" data-cloud-section="Related insights">
        <Container>
          <header className={styles.sectionHeading}><p className={styles.eyebrow}>RELATED INSIGHTS</p><h2 id="cloud-insights-title">Insights to help you move forward.</h2></header>
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
