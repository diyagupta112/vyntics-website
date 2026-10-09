import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <Container as="section" className={styles.hero}>
      <p className={styles.eyebrow}>Custom AI, analytics, and data engineering</p>
      <h1>
        AI and data created by professionals you can actually speak with.
      </h1>
      <p className={styles.intro}>
        No handoffs, no account managers. Your project is built by the engineers who
        scope it. Every response from our compliance chatbot has a source, covering
        more than 20,000 documents.
      </p>
      <Link className={styles.cta} href="/#contact">
        Book a strategy call
      </Link>
    </Container>
  );
}
