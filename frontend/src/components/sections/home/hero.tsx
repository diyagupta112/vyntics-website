import Link from "next/link";
import { Container } from "@/components/ui/container";
import { HeroSmoke } from "./hero-smoke";
import { HeroVideo } from "./hero-video";
import styles from "./hero.module.css";

const PROOF = [
  "Scoped and built by the same engineers",
  "Every chatbot answer cites its source",
  "More than 20,000 documents covered",
];

export function Hero() {
  return (
    <section className={styles.hero} data-home-hero>
      <HeroSmoke />
      <Container className={styles.inner}>
        <h1>AI and data, built by the engineers you speak with.</h1>
        <p className={styles.intro}>
          No handoffs, no account managers. The people who scope your project build it.
        </p>
        <Link className={`${styles.cta} siteCta`} href="/contact-us">
          Book a strategy call
        </Link>
        <HeroVideo />
        <ul className={styles.proof}>
          {PROOF.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
