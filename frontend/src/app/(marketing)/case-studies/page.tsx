import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { getCaseStudies, getCaseStudy, getPrimaryMedia, type CaseStudyListItem } from "@/lib/case-studies";
import { FeaturedCaseStudyCarousel } from "./case-studies-showcase";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Case Studies",
  description: "Real client problems, practical solutions, and products delivered by Vyntics.",
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

function StudyCard({ study }: { study: CaseStudyListItem }) {
  return (
    <Link className={styles.otherCard} href={`/case-studies/${encodeURIComponent(study.slug)}`}>
      <div className={styles.otherMedia}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={study.cover_image_url} alt={`${study.title} project cover`} loading="lazy" width="960" height="540" />
      </div>
      <div className={styles.otherCopy}>
        <p>{[study.client_name, ...study.tags.slice(0, 2)].filter(Boolean).join(" · ")}</p>
        <h3>{study.title}</h3>
        <span>{study.excerpt}</span>
        <strong>View Case Study <ArrowIcon /></strong>
      </div>
    </Link>
  );
}

export default async function CaseStudiesPage() {
  const studies = await getCaseStudies();
  const featured = studies.filter((study) => study.featured === true);
  const remaining = studies.filter((study) => study.featured === false);
  const showcased = await Promise.all(featured.map(async (study) => ({ ...study, media: getPrimaryMedia(await getCaseStudy(study.slug)) })));
  const cover = featured[0] ?? studies[0];

  return (
    <>
      <section className={styles.hero} aria-labelledby="case-studies-title">
        {cover && <div className={styles.heroCarousel} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.heroImage} src={cover.cover_image_url} alt="" fetchPriority="high" />
        </div>}
        <div className={styles.heroShade} aria-hidden="true" />
        <Container className={styles.heroInner}>
          <p className={styles.eyebrow}>Case studies</p>
          <h1 id="case-studies-title">Problems solved.<br />Products delivered.</h1>
          <p className={styles.heroLead}>Explore real client challenges and the products, data systems, and automation we build to solve them.</p>
          <a className={styles.heroAction} href="#featured-case-studies">View Case Studies <ArrowIcon /></a>
        </Container>
      </section>
      <section id="featured-case-studies" className={styles.featuredSection} aria-labelledby="featured-title">
        <Container>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Selected work</p><h2 id="featured-title">Featured Case Studies</h2></div><p>A closer look at selected problems we’ve helped our clients solve.</p></div>
          {featured.length > 0 ? <FeaturedCaseStudyCarousel studies={showcased} /> : <p className={styles.otherEmpty}>{studies.length ? "Explore our published work below." : "No case studies available yet."}</p>}
        </Container>
      </section>
      <section className={styles.otherSection} aria-labelledby="more-title">
        <Container>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Explore further</p><h2 id="more-title">More Case Studies</h2></div><p>More work across technology, data, and business operations.</p></div>
          {remaining.length > 0 ? <div className={styles.otherGrid}>{remaining.map(study => <StudyCard study={study} key={study.id} />)}</div> : <p className={styles.otherEmpty}>{studies.length ? "All currently published work is featured above." : "No case studies available yet."}</p>}
        </Container>
      </section>
      <ContactCta variant="case-studies" />
    </>
  );
}
