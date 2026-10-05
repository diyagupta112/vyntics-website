"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "./states.module.css";

export default function CaseStudiesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className={styles.message} aria-labelledby="case-studies-error-title">
      <Container>
        <p>Case studies</p>
        <h1 id="case-studies-error-title">We couldn&apos;t load the work right now.</h1>
        <span>The project stories are temporarily unavailable. You can try again or continue to the contact section.</span>
        <div className={styles.actions}><button type="button" onClick={reset}>Try again</button><Link href="/#contact">Contact Vyntics</Link></div>
      </Container>
    </section>
  );
}
