import Link from "next/link";
import { Container } from "@/components/ui/container";
import { aiServices, type AiServiceContent } from "@/content/ai-services";
import styles from "./ai-service-detail.module.css";
import { ServiceTools } from "./service-tools";

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export function AiServiceDetail({ service }: { service: AiServiceContent }) {
  const relatedServices = Object.values(aiServices).filter((item) => item.slug !== service.slug);

  return (
    <>
      <section className={styles.hero}>
        <Container>
          <Link className={styles.backLink} href="/#services">← All services</Link>
          <p className={styles.eyebrow}>{service.eyebrow}</p>
          <h1>{service.title}</h1>
          <p className={styles.introduction}>{service.introduction}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/#contact">Discuss your use case <ArrowIcon /></Link>
            <a className={styles.textLink} href="#deliverables">Explore what we deliver</a>
          </div>
        </Container>
      </section>

      <section className={styles.promise} aria-labelledby="service-promise">
        <Container className={styles.promiseGrid}>
          <p className={styles.label}>The objective</p>
          <div>
            <h2 id="service-promise">{service.promise}</h2>
            <p>{service.promiseDetail}</p>
          </div>
        </Container>
      </section>

      <section className={styles.deliverables} id="deliverables" aria-labelledby="deliverables-title">
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.label}>What we deliver</p>
            <h2 id="deliverables-title">The parts required to make it work in production.</h2>
          </div>
          <div className={styles.cardGrid}>
            {service.deliverables.map((deliverable, index) => (
              <article key={deliverable.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{deliverable.title}</h3>
                <p>{deliverable.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.label}>How we build it</p>
            <h2 id="process-title">A controlled path from use case to operation.</h2>
          </div>
          <ol>
            {service.process.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{step.title}</h3><p>{step.description}</p></div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className={styles.outcomes} aria-labelledby="outcomes-title">
        <Container className={styles.outcomesGrid}>
          <div>
            <p className={styles.label}>What good looks like</p>
            <h2 id="outcomes-title">Useful after launch, not just impressive in a demo.</h2>
          </div>
          <ul>{service.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
        </Container>
      </section>

      <ServiceTools name={service.name} technologies={service.technologies} introduction={service.technologyIntroduction} details={service.technologyDetails} />

      <section className={styles.related} aria-labelledby="related-title">
        <Container>
          <div className={styles.relatedHeading}>
            <div><p className={styles.label}>Custom AI services</p><h2 id="related-title">Related capabilities</h2></div>
            <Link href="/#services">View all services</Link>
          </div>
          <div className={styles.relatedGrid}>
            {relatedServices.map((item) => (
              <Link key={item.slug} href={`/services/ai/${item.slug}`}>
                <span>{item.name}</span><ArrowIcon />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.cta}>
        <Container>
          <div><p className={styles.label}>Start with the problem</p><h2>Tell us what needs to work better.</h2></div>
          <Link href="/#contact">Start a conversation <ArrowIcon /></Link>
        </Container>
      </section>
    </>
  );
}
