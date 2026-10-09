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
      <section className={`${styles.hero} ${service.slug === "rag-knowledge-assistants" ? styles.sequencedHero : ""}`} aria-labelledby="service-title">
        <Container>
          <Link className={styles.backLink} href="/#services">← All services</Link>
          <p className={styles.eyebrow}>{service.eyebrow}</p>
          <h1 id="service-title" aria-label={service.slug === "rag-knowledge-assistants" ? service.title : undefined}>
            {service.slug === "rag-knowledge-assistants" ? service.title.split(/\s+/).map((word, index) => (
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

      <ServiceApproach steps={service.process}
        heading={service.slug === "rag-knowledge-assistants" ? "From isolated data to production-grade AI intelligence." : service.slug === "ai-agents" ? "From scope definition to supervised agent deployment." : service.slug === "intelligent-automation" ? "From workflow discovery to production-ready automation." : undefined}
        introduction={service.slug === "rag-knowledge-assistants" ? "A structured 4-step engineering roadmap built to ensure security, high accuracy, and seamless deployment." : service.slug === "ai-agents" ? "A disciplined 4-stage development framework engineered for predictability, security, and measurable performance." : service.slug === "intelligent-automation" ? "A structured 4-step execution framework designed for precision, control, and seamless system integration." : undefined}
      />

      <ServiceTools name={service.name} technologies={service.technologies} introduction={service.technologyIntroduction} details={service.technologyDetails} />

      <ContactCta
        eyebrow={`${service.name} consultation`}
        title={service.slug === "rag-knowledge-assistants" ? "Ready to build a reliable knowledge assistant?" : service.slug === "ai-agents" ? "Ready to automate workflows with custom AI agents?" : service.slug === "intelligent-automation" ? "Ready to remove repetitive workflow work?" : `Let's make ${service.name} work for your business.`}
        intro={service.slug === "rag-knowledge-assistants" ? "Share your data challenges or AI requirements with us. Our team will evaluate your knowledge sources and deliver a practical, step-by-step technical proposal." : service.slug === "ai-agents" ? "Share your current bottleneck or operational goals. Our engineering team will review your systems and propose a scoped agent architecture." : service.slug === "intelligent-automation" ? "Share the workflow, documents, and systems involved. We’ll identify which steps need AI, deterministic rules, or human review." : `Tell us what you need from ${service.name}. We’ll review the current process, identify the practical next step, and explain how we can help.`}
        submitLabel={["rag-knowledge-assistants", "ai-agents", "intelligent-automation"].includes(service.slug) ? "Request Free AI Consultation" : undefined}
      />
    </>
  );
}
