import { Container } from "@/components/ui/container";
import styles from "./states.module.css";

export default function CaseStudiesLoading() {
  return (
    <section className={styles.loading} aria-label="Loading case studies" aria-busy="true">
      <Container>
        <span className={styles.eyebrowSkeleton} />
        <span className={styles.titleSkeleton} />
        <span className={styles.copySkeleton} />
        <div className={styles.mediaSkeleton} />
      </Container>
    </section>
  );
}
