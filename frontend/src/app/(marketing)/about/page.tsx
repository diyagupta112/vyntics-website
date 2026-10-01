import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TeamShowcase } from "@/components/pages/team-showcase";
import { Container } from "@/components/ui/container";
import styles from "./page.module.css";
import { ValueCards } from "./value-cards";

export const metadata: Metadata = {
  title: "About Vyntics | Data Engineering & AI Consulting",
  description: "Vyntics is an expert-led data and AI consulting company helping organizations turn complex data into trusted decisions, automation, and production systems.",
};

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
              <Link className={styles.textLink} href="#team">Meet our team <ArrowIcon /></Link>
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

      <section className={styles.companyIntro} aria-labelledby="company-intro-title">
        <Container className={styles.companyIntroGrid}>
          <div className={styles.companyIntroCopy}>
            <p className={styles.introLabel}>About Vyntics</p>
            <h2 id="company-intro-title">We make <span>data and AI</span> useful where real work happens.</h2>
            <p>
              Vyntics is a data engineering and applied AI company helping organizations turn disconnected information, manual processes, and complex technology decisions into dependable working systems.
            </p>
            <p>
              We work directly with business and technical leaders from discovery through delivery—bringing data foundations, decision-ready analytics, practical AI, and cloud engineering together through one accountable team.
            </p>
            <blockquote>Our aim: make advanced technology easier to adopt, easier to trust, and easier to own.</blockquote>
          </div>

          <figure className={styles.companyIntroVisual}>
            <Image
              src="/images/about-vyntics-team.png"
              alt="A business team collaborating during a meeting"
              fill
              sizes="(max-width: 860px) 100vw, 46vw"
            />
            <figcaption>
              <span>Built in Jaipur</span>
              <strong>Designed for real operating environments.</strong>
            </figcaption>
          </figure>
        </Container>
      </section>

      <section id="mission" className={`${styles.section} ${styles.mission}`} aria-labelledby="mission-title">
        <Container className={styles.missionInner}>
          <header className={styles.missionHeading}>
            <p className={styles.eyebrow}>Our mission</p>
            <h2 id="mission-title">Make advanced <span>data intelligence</span> useful and accessible.</h2>
          </header>
          <div className={styles.missionCopy}>
            <div className={styles.missionPanelTitle}>
              <span aria-hidden="true" />
              <h3>Intelligence with purpose</h3>
            </div>
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
          <ValueCards />
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
            <Link className={styles.storyLink} href="#team">The people behind Vyntics <ArrowIcon /></Link>
          </div>
        </Container>
      </section>

      <TeamShowcase />

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
