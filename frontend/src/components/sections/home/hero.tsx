import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <Container as="section" className={styles.hero}>
      <p className={styles.eyebrow}>AI & ANALYTICS THAT DELIVER</p>
      <h1>
        Data and AI, built by experts you actually talk to.
      </h1>
      <p className={styles.intro}>
        No handoffs, no black boxes. Our small team of data &amp; AI engineers
        builds RAG systems, pipelines, and custom models at 95%+ accuracy, and
        stays your direct point of contact through launch.
      </p>
      <Link className={styles.cta} href="/#contact">
        Book a strategy call
      </Link>
    </Container>
  );
}
