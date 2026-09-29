import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import styles from "@/components/pages/listing-page.module.css";

export const metadata: Metadata = {
  title: "Careers",
  description: "Build production AI, data, backend, and cloud systems with the Vyntics team.",
};

const reasons = [
  { title: "Production work", text: "Work on systems built for real users, operational constraints, and long-term ownership." },
  { title: "Direct mentorship", text: "Learn alongside experienced engineers through practical reviews, architecture decisions, and delivery." },
  { title: "Meaningful ownership", text: "Contribute beyond isolated tasks and understand how your work fits into the complete system." },
  { title: "Clear communication", text: "Work in a focused environment where decisions are explained and technical context is shared." },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export default function CareersPage() {
  return (
    <>
      <section className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Career at Vyntics</p>
          <h1>Build useful systems with people who care about the details.</h1>
          <p>Join a focused engineering team working across production AI, data platforms, backend systems, analytics, and cloud infrastructure.</p>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.label}>Working here</p>
            <h2>Grow through responsibility, guidance, and real delivery.</h2>
          </div>
          <div className={styles.cardGrid}>
            {reasons.map((reason) => (
              <article className={styles.card} key={reason.title}>
                <p className={styles.cardMeta}>Vyntics team</p>
                <h2>{reason.title}</h2>
                <p>{reason.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.cta}>
        <Container>
          <div><p className={styles.label}>Interested in joining?</p><h2>Introduce yourself and tell us what you want to build.</h2></div>
          <a href="mailto:contact@vyntics.com?subject=Career%20at%20Vyntics">Email your profile <ArrowIcon /></a>
        </Container>
      </section>
    </>
  );
}

