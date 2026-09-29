import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About Vyntics | Data Engineering & AI Consulting",
  description: "Vyntics is an expert-led data and AI consulting company helping organizations turn complex data into trusted decisions, automation, and production systems.",
};

const values = [
  {
    title: "Innovation",
    text: "We keep exploring better methods and modern tools—but only adopt technology when it improves the outcome.",
    icon: "spark",
  },
  {
    title: "Trust",
    text: "We earn long-term partnerships through transparent decisions, reliable delivery, and direct communication.",
    icon: "shield",
  },
  {
    title: "Excellence",
    text: "We hold every system to a production standard: useful, maintainable, measurable, and ready for real work.",
    icon: "diamond",
  },
] as const;

const capabilities = [
  {
    title: "Custom AI",
    text: "Grounded assistants, RAG systems, intelligent automation, and practical AI integrations.",
    href: "/services/ai",
  },
  {
    title: "Data engineering",
    text: "Reliable pipelines, integrations, warehouses, and governed foundations for analytics and AI.",
    href: "/services/data",
  },
  {
    title: "Analytics & BI",
    text: "Decision-ready dashboards and reporting built around metrics your teams can agree on.",
    href: "/services/data",
  },
  {
    title: "Cloud solutions",
    text: "Architecture, migration, reliability, and cost-conscious infrastructure across leading clouds.",
    href: "/services/cloud",
  },
] as const;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function ValueIcon({ type }: { type: (typeof values)[number]["icon"] }) {
  if (type === "shield") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
  }

  if (type === "diamond") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 6-8 12L4 9l8-6Z" /><path d="m4 9 8 3 8-3M12 12v9" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>;
}

export default function AboutPage() {
  return (
    <>
      <section className={styles.hero}>
        <Container className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Data and AI you can trust</p>
            <h1>Transforming data into strategic advantage.</h1>
            <p className={styles.lead}>
              We&apos;re Vyntics—a team of data scientists, engineers, and strategists helping organizations turn complex information into trusted decisions, useful automation, and systems built to last.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/#contact">Start a conversation <ArrowIcon /></Link>
              <Link className={styles.textLink} href="/team">Meet our team <ArrowIcon /></Link>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.orbit}>
              <span className={styles.orbitCore}>V</span>
              <span className={`${styles.orbitNode} ${styles.dataNode}`}>Data</span>
              <span className={`${styles.orbitNode} ${styles.aiNode}`}>AI</span>
              <span className={`${styles.orbitNode} ${styles.decisionNode}`}>Decisions</span>
            </div>
            <p>Structured data. Practical intelligence. Clear outcomes.</p>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.mission}`} aria-labelledby="mission-title">
        <Container className={styles.split}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Our mission</p>
            <h2 id="mission-title">Make advanced data intelligence useful and accessible.</h2>
          </div>
          <div className={styles.missionCopy}>
            <p>
              Every organization should have the tools and insight to make confident, data-driven decisions. Our job is to remove the unnecessary complexity between a business problem and a dependable technical solution.
            </p>
            <div className={styles.principles} aria-label="How Vyntics delivers">
              <span>Expert-led delivery</span>
              <span>Clear communication</span>
              <span>Modern, maintainable stack</span>
            </div>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.valuesSection}`} aria-labelledby="values-title">
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Our values</p>
            <h2 id="values-title">How we make the work—and the partnership—better.</h2>
          </div>
          <div className={styles.valueGrid}>
            {values.map((value) => (
              <article className={styles.valueCard} key={value.title}>
                <span className={styles.iconBox}><ValueIcon type={value.icon} /></span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.story}`} aria-labelledby="story-title">
        <Container className={styles.storyGrid}>
          <div className={styles.storyMarker} aria-hidden="true">
            <span>Built for</span>
            <strong>real work</strong>
          </div>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Our story</p>
            <h2 id="story-title">Created to turn data into decisions and automation teams can trust.</h2>
            <p>
              Vyntics was built as an expert-led consulting team: small enough to move quickly, experienced enough to make sound technical decisions, and direct enough to keep clients close to the people doing the work.
            </p>
            <p>
              Whether the need is a modern data platform, analytics leadership actually uses, or practical AI automation, we bring structured execution and long-term maintainability—not another deck of recommendations.
            </p>
            <Link className={styles.storyLink} href="/team">The people behind Vyntics <ArrowIcon /></Link>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.capabilities}`} aria-labelledby="capabilities-title">
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>What we build</p>
            <h2 id="capabilities-title">One technical partner from data foundations to working AI.</h2>
          </div>
          <div className={styles.capabilityGrid}>
            {capabilities.map((capability) => (
              <Link href={capability.href} className={styles.capabilityCard} key={capability.title}>
                <div>
                  <h3>{capability.title}</h3>
                  <p>{capability.text}</p>
                </div>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.cta}>
        <Container className={styles.ctaInner}>
          <div>
            <p className={styles.eyebrow}>Ready to move forward?</p>
            <h2>Let&apos;s turn your data into something your team can use.</h2>
          </div>
          <Link href="/#contact">Get started <ArrowIcon /></Link>
        </Container>
      </section>
    </>
  );
}

