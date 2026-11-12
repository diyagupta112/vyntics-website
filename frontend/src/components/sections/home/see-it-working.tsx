import { Container } from "@/components/ui/container";
import { HeroVideo } from "./hero-video";
import styles from "./see-it-working.module.css";

export function SeeItWorking() {
  return (
    <section id="see-it-working" className={styles.section} aria-labelledby="see-it-working-title">
      <Container className={styles.inner}>
        <div className={styles.head}>
          <h2 id="see-it-working-title">See it working</h2>
          <p>How one of our compliance chatbots answers a question, step by step.</p>
        </div>
        <HeroVideo />
      </Container>
    </section>
  );
}
