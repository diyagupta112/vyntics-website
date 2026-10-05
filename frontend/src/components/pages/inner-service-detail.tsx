import Link from "next/link";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { Container } from "@/components/ui/container";
import styles from "./inner-service-detail.module.css";

export type InnerServiceDetailContent = {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  introduction: string;
  promise: string;
  promiseDetail: string;
  deliverables: ReadonlyArray<{ title: string; description: string }>;
  process: ReadonlyArray<{ title: string; description: string }>;
  technologies: readonly string[];
  metadataDescription: string;
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export function InnerServiceDetail({ service }: { service: InnerServiceDetailContent }) {
  return (
    <>
      <section className={styles.hero} aria-labelledby="service-title">
        <Container>
          <Link className={styles.backLink} href="/#services">← All services</Link>
          <p className={styles.eyebrow}>{service.eyebrow}</p>
          <h1 id="service-title">{service.title}</h1>
          <p className={styles.introduction}>{service.introduction}</p>
          <Link className={styles.primaryButton} href="#contact">Discuss {service.name} <ArrowIcon /></Link>
        </Container>
      </section>

      <section className={styles.about} aria-labelledby="about-title">
        <Container>
          <div className={styles.splitHeading}>
            <p className={styles.label}>About the service</p>
            <div>
              <h2 id="about-title">{service.promise}</h2>
              <p>{service.promiseDetail}</p>
            </div>
          </div>
          <div className={styles.cardGrid}>
            {service.deliverables.map((item, index) => (
              <article key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.approach} aria-labelledby="approach-title">
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.label}>Our approach</p>
            <h2 id="approach-title">Clear decisions from discovery through delivery.</h2>
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

      <section className={styles.tools} aria-labelledby="tools-title">
        <Container>
          <p className={styles.label}>Tools & platforms</p>
          <h2 id="tools-title">Technology selected for the service—not forced onto it.</h2>
          <p className={styles.toolsIntro}>We choose the stack around your existing systems, operating constraints, team skills, and long-term ownership.</p>
          <ul>{service.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
        </Container>
      </section>

      <ContactCta
        eyebrow={`${service.name} consultation`}
        title={`Let's make ${service.name} work for your business.`}
        intro={`Tell us what you need from ${service.name}. We’ll review the current process, identify the practical next step, and explain how we can help.`}
      />
    </>
  );
}
