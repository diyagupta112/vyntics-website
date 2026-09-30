import { Container } from "@/components/ui/container";
import styles from "./loading.module.css";

export default function CareerLoading() {
  return (
    <section className={styles.loading} aria-label="Loading career details" aria-busy="true">
      <Container>
        <span className={styles.short} />
        <span className={styles.title} />
        <span className={styles.copy} />
        <div className={styles.cards}><span /><span /><span /></div>
      </Container>
    </section>
  );
}
