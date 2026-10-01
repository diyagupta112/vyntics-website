import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { ServiceContent } from "@/content/services";
import styles from "./service-page.module.css";

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export function ServicePage({ service }: { service: ServiceContent }) {
  return (
    <>
      <section className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>{service.eyebrow}</p>
          <h1>{service.title}</h1>
          <p>{service.introduction}</p>
          <Link href="/#contact">Discuss your project <ArrowIcon /></Link>
        </Container>
      </section>

      <section className={styles.promise}>
        <Container>
          <p className={styles.label}>Our approach</p>
          <h2>{service.promise}</h2>
        </Container>
      </section>

      <section className={styles.offerings} aria-labelledby={`${service.slug}-offerings`}>
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.label}>What we deliver</p>
            <h2 id={`${service.slug}-offerings`}>Focused capabilities, built as one dependable system.</h2>
          </div>
          <div className={styles.offeringGrid}>
            {service.offerings.map((offering, index) => (
              <article key={offering.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{offering.title}</h3>
                <p>{offering.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.outcomes} aria-labelledby={`${service.slug}-outcomes`}>
        <Container className={styles.outcomeGrid}>
          <div>
            <p className={styles.label}>What good looks like</p>
            <h2 id={`${service.slug}-outcomes`}>Designed for use after launch.</h2>
          </div>
          <ul>
            {service.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
          </ul>
        </Container>
      </section>

      <section className={styles.technology} aria-labelledby={`${service.slug}-technology`}>
        <Container>
          <p className={styles.label}>Technology</p>
          <h2 id={`${service.slug}-technology`}>Tools selected for the problem-not the pitch deck.</h2>
          <ul>{service.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
        </Container>
      </section>

      <section className={styles.cta}>
        <Container>
          <div>
            <p className={styles.label}>Start with the problem</p>
            <h2>Tell us what needs to work better.</h2>
          </div>
          <Link href="/#contact">Start a conversation <ArrowIcon /></Link>
        </Container>
      </section>
    </>
  );
}
