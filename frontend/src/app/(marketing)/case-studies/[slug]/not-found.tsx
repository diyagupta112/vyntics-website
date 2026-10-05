import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "../states.module.css";

export default function CaseStudyNotFound() {
  return (
    <section className={styles.message} aria-labelledby="case-study-not-found-title">
      <Container>
        <p>Case study not found</p>
        <h1 id="case-study-not-found-title">This project story isn&apos;t available.</h1>
        <span>It may have moved or no longer be published. Return to the collection to explore the work currently available.</span>
        <div className={styles.actions}><Link href="/case-studies">View all case studies</Link></div>
      </Container>
    </section>
  );
}
