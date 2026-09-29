import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <Container as="section" className={styles.hero}>
      <p className={styles.eyebrow}>Data engineering, analytics and custom AI</p>
      <h1>
        Data and AI, built by experts you actually talk to.
      </h1>
      <p className={styles.intro}>
        No account managers, no handoffs. The engineers who scope your project are 
        the ones who build it. Our compliance chatbot answers across 20,000+ 
        documents with a source on every reply.
      </p>
      <Link className={styles.cta} href="/#contact">
        Book a strategy call
      </Link>
    </Container>
  );
}
