import { Suspense } from "react";
import CaseStudiesLoading from "./loading";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { CaseStudyCover } from "@/components/sections/case-studies/case-study-cover";
import { getCaseStudies, getCaseStudy, getCaseStudyHeroMedia, type CaseStudyListItem } from "@/lib/case-studies";
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
        <CaseStudyCover src={study.cover_image_url} title={study.title} />
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

async function CaseStudySections() {
  const studies = await getCaseStudies();
  const featured = studies.filter((study) => study.featured === true);
  const showcased = await Promise.all(featured.map(async (study) => ({ ...study, media: getCaseStudyHeroMedia(await getCaseStudy(study.slug)) })));

  return (
    <>
      <section id="featured-case-studies" className={styles.featuredSection} aria-labelledby="featured-title">
        <Container>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Selected work</p><h2 id="featured-title">Featured Case Studies</h2></div></div>
          {featured.length > 0 ? <FeaturedCaseStudyCarousel studies={showcased} /> : <p className={styles.otherEmpty}>{studies.length ? "Explore our published work below." : "No case studies available yet."}</p>}
        </Container>
      </section>
      <section className={styles.otherSection} aria-labelledby="more-title">
        <Container>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Explore further</p><h2 id="more-title">All Case Studies</h2></div></div>
          {studies.length > 0 ? <div className={styles.otherGrid}>{studies.map(study => <StudyCard study={study} key={study.id} />)}</div> : <p className={styles.otherEmpty}>No case studies available yet.</p>}
        </Container>
      </section>
    </>
  );
}

export default function CaseStudiesPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="case-studies-title">
        <div className={styles.heroCarousel} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.heroImage} src="/images/case-studies/4.jpg" alt="" fetchPriority="high" />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <Container className={styles.heroInner}>
          <p className={styles.eyebrow}>Case studies</p>
          <h1 id="case-studies-title">Real challenges transformed into production-grade systems.</h1>
          <p className={styles.heroLead}>A look inside the custom architectures, software, and infrastructure we engineer to solve critical business problems.</p>
          <a className={styles.heroAction} href="#featured-case-studies">View Case Studies <ArrowIcon /></a>
        </Container>
      </section>
      <div className={styles.workIntro}>
        <Container>
          <div className={styles.workIntroContent}>
          <p className={styles.eyebrow}>Our work</p>
          <h2>Problems we&apos;ve helped solve.</h2>
          <p className={styles.workIntroCopy}>Every enterprise challenge demands a tailored approach, but the objective remains constant: turning operational friction into reliable, scalable systems. We partner directly with client teams to engineer the custom infrastructure, software, and intelligence required to support long-term growth.</p>
          </div>
        </Container>
      </div>
      <Suspense fallback={<div id="featured-case-studies"><CaseStudiesLoading /></div>}>
        <CaseStudySections />
      </Suspense>
      <ContactCta />
    </>
  );
}
