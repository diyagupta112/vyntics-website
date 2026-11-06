import { Container } from "@/components/ui/container";
import styles from "./hero.module.css";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";
import { HeroDemoButton } from "./hero-demo-button";

export function Hero() {
  return (
    <section className={styles.hero} data-home-hero>
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>For law, travel and other rule-heavy businesses</p>
          <h1>
            AI that has <span className={styles.accent}>read the fine print.</span>
          </h1>
          <p className={styles.intro}>
            We build assistants and data pipelines that answer from your contracts, policies and records, and show the
            clause behind every answer.
          </p>
          <div className={styles.actions}>
            <ArrowFillButton className={styles.cta} href="/contact-us">Book a free AI audit</ArrowFillButton>
            <HeroDemoButton className={styles.secondary} />
          </div>
        </div>

        <figure className={styles.answer} aria-label="A real answer from our compliance chatbot demo">
          <span className={styles.answerTag}>From our compliance chatbot</span>
          <p className={styles.question}>Can we disburse Title IV aid to a student who is in default on a federal loan?</p>
          <p className={styles.reply}>
            No. You cannot disburse Title IV aid to a student who is currently in default on a federal student loan,
            unless the default has been properly resolved.{" "}
            <span className={styles.cite}>[1]</span> <span className={styles.cite}>[2]</span>
          </p>
          <ol className={styles.source}>
            <li className={styles.sourceName}>Sources, ranked by authority</li>
            <li className={styles.clause}><b>[1] Statute</b> Higher Education Act, Title IV</li>
            <li className={styles.clause}><b>[2] Regulation</b> 34 CFR 668.32</li>
            <li><b>[3] Guidance</b> Dear Colleague Letter</li>
          </ol>
          <figcaption className={styles.grounded}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
            Written only from the retrieved sources
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
