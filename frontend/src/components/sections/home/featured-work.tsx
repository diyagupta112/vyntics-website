import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { FeaturedCaseStudyCarousel } from "@/components/sections/case-studies/featured-case-study-carousel";
import { getCaseStudies, getCaseStudy, getCaseStudyHeroMedia, type CaseStudyListItem, type CaseStudyMedia } from "@/lib/case-studies";
import styles from "./featured-work.module.css";

type FeaturedWorkProps = {
  studies?: CaseStudyListItem[];
  heading?: string;
  description?: string;
  unavailable?: boolean;
  loading?: boolean;
  children?: ReactNode;
};

export async function FeaturedWork({ studies, heading = "Give your business an edge with AI", description = "We build production AI and data systems that are accurate, useful, and ready to ship. Here's what that looks like in practice.", unavailable = false, loading = false, children }: FeaturedWorkProps = {}) {
  let showcased: (CaseStudyListItem & { media: CaseStudyMedia })[] = [];
  if (!loading && !unavailable) {
    try {
      const selected = studies ?? (await getCaseStudies()).filter(study => study.featured);
      showcased = await Promise.all(selected.map(async study => ({
        ...study, media: getCaseStudyHeroMedia(await getCaseStudy(study.slug)),
      })));
    } catch {
      unavailable = true;
    }
  }
  return (
    <section id="work" className={styles.section} aria-labelledby="featured-work-title">
      <Container>
        <div className={styles.sectionHeader}><div className={styles.headingBlock}>
          <p className={styles.eyebrow}>Featured work · Built for production</p>
          <h2 id="featured-work-title">{heading}</h2><p>{description}</p>
        </div></div>
        {showcased.length > 0 ? <FeaturedCaseStudyCarousel studies={showcased} />
          : <p role="status">{loading ? "Loading case studies…" : unavailable ? "Case studies are temporarily unavailable. Please try again later." : "No case studies available yet."}</p>}
        {children}
      </Container>
    </section>
  );
}
