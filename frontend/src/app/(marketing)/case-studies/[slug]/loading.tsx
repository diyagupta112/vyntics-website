import { Container } from "@/components/ui/container";
import styles from "../states.module.css";

export default function CaseStudyDetailLoading() {
  return (
    <section className={styles.loading} aria-label="Loading case study" aria-busy="true">
      <Container>
        <span className={styles.eyebrowSkeleton} />
        <span className={styles.titleSkeleton} />
        <span className={styles.copySkeleton} />
        <div className={styles.mediaSkeleton} />
      </Container>
    </section>
  );
}
