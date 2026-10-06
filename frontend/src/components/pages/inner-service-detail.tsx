import Link from "next/link";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { Container } from "@/components/ui/container";
import styles from "./inner-service-detail.module.css";
import { ServiceTools } from "./service-tools";
import { ServiceApproach } from "./service-approach";

export type InnerServiceDetailContent = {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  introduction: string;
  aboutEyebrow?: string;
  processEyebrow?: string;
  processTitle?: string;
  processIntroduction?: string;
  technologyEyebrow?: string;
  technologyTitle?: string;
  contactEyebrow?: string;
  contactTitle?: string;
  contactIntroduction?: string;
  promise: string;
  promiseDetail: string;
  deliverables: ReadonlyArray<{ title: string; description: string }>;
  process: ReadonlyArray<{ title: string; description: string }>;
  technologies: readonly string[];
  technologyIntroduction?: string;
  technologyDetails?: ReadonlyArray<{ name: string; role: string; description: string }>;
  metadataDescription: string;
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export function InnerServiceDetail({ service }: { service: InnerServiceDetailContent }) {
  return (
    <>
      <section className={`${styles.hero} ${service.slug === "rag-assistants" ? styles.sequencedHero : ""}`} aria-labelledby="service-title">
        <Container>
          <Link className={styles.backLink} href="/#services">← All services</Link>
          <p className={styles.eyebrow}>{service.eyebrow}</p>
          <h1 id="service-title" aria-label={service.slug === "rag-assistants" ? service.title : undefined}>
            {service.slug === "rag-assistants" ? service.title.split(/\s+/).map((word, index) => (
              <span className={styles.heroWord} aria-hidden="true" key={`${word}-${index}`} style={{ animationDelay: `${.45 + index * .12}s` }}>{word}{" "}</span>
            )) : service.title}
          </h1>
          <p className={styles.introduction}>{service.introduction}</p>
          <button className={styles.primaryButton} type="button" data-scroll-target="contact">Discuss {service.name} <ArrowIcon /></button>
        </Container>
      </section>

      <section className={styles.about} aria-labelledby="about-title">
        <Container className={styles.aboutGrid}>
          <div className={styles.splitHeading}>
            <p className={styles.label}>{service.aboutEyebrow ?? "About the service"}</p>
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

      <ServiceApproach steps={service.process} eyebrow={service.processEyebrow} title={service.processTitle} introduction={service.processIntroduction} />

      <ServiceTools name={service.name} technologies={service.technologies} introduction={service.technologyIntroduction} details={service.technologyDetails} eyebrow={service.technologyEyebrow} title={service.technologyTitle} />

      <ContactCta
        eyebrow={service.contactEyebrow ?? `${service.name} consultation`}
        title={service.contactTitle ?? `Let's make ${service.name} work for your business.`}
        intro={service.contactIntroduction ?? `Tell us what you need from ${service.name}. We’ll review the current process, identify the practical next step, and explain how we can help.`}
      />
    </>
  );
}
