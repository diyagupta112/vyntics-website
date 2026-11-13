import { Container } from "@/components/ui/container";
import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";
import styles from "./loading.module.css";

/** Shown while any service page streams in: a hero (copy plus image) and two card bands, the shape shared by the service pages. */
export default function ServicesLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading service page">
      <section className={styles.hero} aria-hidden="true">
        <Container>
          <div className={styles.heroGrid}>
            <div className={styles.copy}>
              <Skeleton style={{ width: "7rem", height: ".7rem" }} />
              <Skeleton style={{ width: "90%", height: "clamp(2.2rem, 4vw, 3.5rem)" }} />
              <Skeleton style={{ width: "65%", height: "clamp(2.2rem, 4vw, 3.5rem)" }} />
              <SkeletonLines widths={["100%", "92%", "70%"]} />
              <Skeleton style={{ width: "11rem", height: "2.75rem", borderRadius: "2rem", marginTop: ".5rem" }} />
            </div>
            <Skeleton className={styles.visual} style={{ height: "auto" }} />
          </div>
        </Container>
      </section>
      {[0, 1].map((band) => (
        <section className={styles.band} key={band} aria-hidden="true">
          <Container>
            <Skeleton style={{ width: "min(24rem, 70%)", height: "2rem" }} />
            <div className={styles.cards}>{[0, 1, 2].map((index) => <Skeleton className={styles.card} key={index} style={{ height: "11rem" }} />)}</div>
          </Container>
        </section>
      ))}
    </div>
  );
}
