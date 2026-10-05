import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cloudServiceList } from "./cloud-services";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cloud Solutions",
  description: "Explore Vyntics cloud architecture, migration, cost optimization, DevOps, infrastructure, and reliability monitoring services.",
};

const situations = [
  "You are planning a move from existing infrastructure to a cloud environment.",
  "Your current cloud setup has become difficult to understand or change safely.",
  "Infrastructure costs are rising without enough visibility into usage and ownership.",
  "Deployments vary between environments or rely on repeated manual work.",
  "System health is hard to assess until an incident is already affecting users.",
  "A new workload needs a clearer architecture before delivery begins.",
] as const;

const approach = [
  { title: "Understand the environment", text: "Begin with workloads, dependencies, constraints, ownership, and the operating issue that needs to change." },
  { title: "Set the direction", text: "Turn the findings into architecture decisions, priorities, and a delivery plan with explicit tradeoffs." },
  { title: "Implement and validate", text: "Build or change the environment in controlled stages, validating behavior as the work progresses." },
  { title: "Transfer and improve", text: "Document what was built, support operational ownership, and identify the next useful improvements." },
] as const;

const platforms = ["AWS", "Microsoft Azure", "Google Cloud", "Terraform", "Kubernetes", "Docker", "Grafana"] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

export default function CloudSolutionsPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="cloud-title">
        <Container className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Cloud Solutions</p>
            <h1 id="cloud-title">Cloud infrastructure built around the work it needs to run.</h1>
            <p>Vyntics helps organizations design, move, optimize, and operate cloud environments with reliability, maintainability, and cost kept in view.</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/#contact">Discuss your cloud requirements <ArrowIcon /></Link>
              <Link className={styles.secondaryAction} href="#cloud-services">Explore Cloud services</Link>
            </div>
          </div>
          <nav className={styles.scopeIndex} aria-label="Cloud Solutions services">
            <p>Cloud Solutions</p>
            <ol>
              {cloudServiceList.map((service) => (
                <li key={service.slug}><Link href={`/services/cloud/${service.slug}`}><span>{service.number}</span>{service.title}</Link></li>
              ))}
            </ol>
          </nav>
        </Container>
      </section>

      <section className={styles.context} aria-labelledby="cloud-context-title">
        <Container className={styles.contextGrid}>
          <p className={styles.eyebrow}>What Cloud Solutions means here</p>
          <div>
            <h2 id="cloud-context-title">One connected capability across the cloud lifecycle.</h2>
            <p>Cloud decisions rarely stay inside one category. Architecture shapes migration. Delivery workflows affect reliability. Usage patterns affect cost. Vyntics connects those concerns while giving each area the depth it needs.</p>
          </div>
        </Container>
        <Container className={styles.lifecycle} aria-label="Cloud solution lifecycle">
          <div><span>01</span><strong>Design</strong><p>Shape the environment around workloads and operating constraints.</p></div>
          <div><span>02</span><strong>Move and improve</strong><p>Transition systems and make infrastructure delivery more consistent.</p></div>
          <div><span>03</span><strong>Operate</strong><p>Make cost, system health, and ongoing change easier to manage.</p></div>
        </Container>
      </section>

      <section id="cloud-services" className={styles.services} aria-labelledby="cloud-services-title">
        <Container>
          <header className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Cloud service areas</p>
            <h2 id="cloud-services-title">Enter through the capability your environment needs.</h2>
            <p>Each service has its own focus and can also connect to the wider Cloud Solutions work.</p>
          </header>
          <div className={styles.serviceList}>
            {cloudServiceList.map((service) => (
              <Link className={styles.serviceDestination} href={`/services/cloud/${service.slug}`} key={service.slug}>
                <span className={styles.serviceNumber}>{service.number}</span>
                <div className={styles.serviceTitle}><h3>{service.title}</h3><p>{service.summary}</p></div>
                <div className={styles.childOverview}>
                  <p>Includes</p>
                  <ul>{service.workAreas.slice(0, 3).map((area) => <li key={area.title}>{area.title}</li>)}</ul>
                  <strong>Explore {service.title} <ArrowIcon /></strong>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.situations} aria-labelledby="situations-title">
        <Container className={styles.situationsGrid}>
          <div className={styles.stickyHeading}>
            <p className={styles.eyebrow}>When this work becomes useful</p>
            <h2 id="situations-title">Cloud problems usually show up as operating problems first.</h2>
            <p>The need may begin with a migration, a difficult release process, rising cost, or limited visibility into a production system.</p>
          </div>
          <ul>{situations.map((situation, index) => <li key={situation}><span>{String(index + 1).padStart(2, "0")}</span><p>{situation}</p></li>)}</ul>
        </Container>
      </section>

      <section className={styles.approach} aria-labelledby="approach-title">
        <Container>
          <header className={styles.sectionHeading}>
            <p className={styles.eyebrow}>How we approach cloud work</p>
            <h2 id="approach-title">Start with the environment. Leave with clearer ownership.</h2>
            <p>The exact engagement changes with the service, but the work stays grounded in evidence, explicit decisions, and an operable result.</p>
          </header>
          <ol className={styles.approachSteps}>
            {approach.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}
          </ol>
        </Container>
      </section>

      <section className={styles.platforms} aria-labelledby="platforms-title">
        <Container className={styles.platformGrid}>
          <div><p className={styles.eyebrow}>Platforms and tools</p><h2 id="platforms-title">Technology selected for the environment.</h2><p>These are part of the existing Vyntics cloud toolkit. The final combination depends on the workload and the systems already in place.</p></div>
          <ul>{platforms.map((platform) => <li key={platform}>{platform}</li>)}</ul>
        </Container>
      </section>

      <section className={styles.workBridge} aria-labelledby="cloud-work-title">
        <Container className={styles.workBridgeInner}>
          <div><p className={styles.eyebrow}>See the work</p><h2 id="cloud-work-title">Explore how Vyntics approaches technical problems in practice.</h2></div>
          <div><p>Our published case studies cover work across AI, data, automation, and software systems. New project stories are added as they become available.</p><Link href="/case-studies">View case studies <ArrowIcon /></Link></div>
        </Container>
      </section>

      <section className={styles.finalCta} aria-labelledby="cloud-cta-title">
        <Container className={styles.finalCtaInner}>
          <div><p className={styles.eyebrow}>Planning your next cloud initiative?</p><h2 id="cloud-cta-title">Start with the environment you have and the outcome you need.</h2></div>
          <div><p>Tell us what is changing, where the current setup creates friction, and what your team needs to operate confidently.</p><Link href="/#contact">Start a conversation <ArrowIcon /></Link></div>
        </Container>
      </section>
    </>
  );
}
