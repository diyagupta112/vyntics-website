import { Container } from "@/components/ui/container";
import { FeaturedCaseStudySkeleton, CaseStudyListingSkeleton } from "@/components/sections/case-studies/case-study-skeleton";
import styles from "./page.module.css";

export function CaseStudySectionsSkeleton() {
  return <>
    <section id="featured-case-studies" className={styles.featuredSection} aria-labelledby="featured-title">
      <Container>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Selected work</p><h2 id="featured-title">Featured Case Studies</h2></div></div>
        <p className={styles.sectionIntro}>A selection of projects that show how we take a business problem from the first conversation to a system running in production.</p>
        <FeaturedCaseStudySkeleton />
      </Container>
    </section>
    <section className={styles.otherSection} aria-labelledby="more-title">
      <Container>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Explore further</p><h2 id="more-title">All Case Studies</h2></div></div>
        <p className={styles.sectionIntro}>Browse every project, or search and filter by technology and topic.</p>
        <CaseStudyListingSkeleton />
      </Container>
    </section>
  </>;
}
