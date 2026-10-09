import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TeamShowcase } from "@/components/pages/team-showcase";
import { Container } from "@/components/ui/container";
import styles from "./page.module.css";
import { TechnologyOrb } from "./technology-orb";
import { ValueCards } from "./value-cards";

export const metadata: Metadata = {
  title: "About Vyntics | Data Engineering & AI Consulting",
  description: "Vyntics is an expert-led data and AI consulting company helping organizations turn complex data into trusted decisions, automation, and production systems.",
};

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
            <p className={styles.eyebrow}>AI and data you can rely on</p>
            <h1>Converting data into a competitive advantage.</h1>
            <p className={styles.lead}>
              We are Vyntics, a group of data scientists, engineers, and strategists that assist businesses in transforming complicated data into reliable choices, practical automation, and long-lasting systems.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/#contact">Start a conversation <ArrowIcon /></Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <TechnologyOrb />
          </div>
        </Container>
      </section>

      <section className={styles.companyIntro} aria-labelledby="company-intro-title">
        <Container className={styles.companyIntroGrid}>
          <div className={styles.companyIntroCopy}>
            <p className={styles.introLabel}>About Vyntics</p>
            <h2 id="company-intro-title">Where actual work takes place, we make <span>data and AI</span> useful.</h2>
            <p>
              Vyntics is a data engineering and applied AI firm that assists businesses in transforming disjointed data, manual procedures, and difficult technological choices into dependable functional solutions.
            </p>
            <p>
              From discovery to delivery, we collaborate closely with business and technical executives to provide data foundations, decision-ready analytics, useful AI, and cloud engineering as a single, responsible team.
            </p>
            <blockquote>Our goal is to simplify the adoption, trust, and ownership of cutting-edge technology.</blockquote>
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
            <p className={styles.eyebrow}>Our goal</p>
            <h2 id="mission-title">Utilizing <span>AI and data</span> to assist teams in making better decisions.</h2>
          </header>
          <div className={styles.missionCopy}>
            <div className={styles.missionPanelTitle}>
              <span aria-hidden="true" />
              <h3>Purpose-driven intelligence</h3>
            </div>
            <p>
              Every company should be equipped with the knowledge and resources necessary to make data-driven, confident decisions. It is our responsibility to eliminate the needless complication that stands between a reliable technological solution and a business problem.
            </p>
            <div className={styles.principles} aria-label="How Vyntics delivers">
              <span>Delivery guided by experts</span>
              <span>Effective communication</span>
              <span>Up-to-date, manageable stack</span>
            </div>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.valuesSection}`} aria-labelledby="values-title">
        <Container>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Our beliefs</p>
            <h2 id="values-title">How we improve the work and the collaboration.</h2>
          </div>
          <ValueCards />
        </Container>
      </section>

      <section className={`${styles.section} ${styles.story}`} aria-labelledby="story-title">
        <Container className={styles.storyGrid}>
          <figure className={styles.storyMarker}>
            <Image
              src="/images/about-story-collaboration.png"
              alt="A team collaborating around a table with laptops"
              fill
              sizes="(max-width: 860px) 100vw, 38vw"
            />
            <figcaption>
              <span>Built for</span>
              <strong>real work</strong>
            </figcaption>
          </figure>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Our tale</p>
            <h2 id="story-title">Designed to transform data into trustworthy automation decisions.</h2>
            <p>
              Vyntics was designed to be an expert-led consulting team that was small enough to work quickly, knowledgeable enough to make wise technical choices, and direct enough to keep clients close to the workers.
            </p>
            <p>
              We offer organized execution and long-term maintainability—not just a list of suggestions—whether the demand is for a cutting-edge data platform, analytics leadership that is actually used, or useful AI automation.
            </p>
          </div>
        </Container>
      </section>

      <TeamShowcase />

      <section className={styles.cta}>
        <Container className={styles.ctaInner}>
          <div>
            <p className={styles.eyebrow}>Are you prepared to proceed?</p>
            <h2>Together, we can transform your data into a useful resource for your team.</h2>
          </div>
          <Link href="/#contact">Get started <ArrowIcon /></Link>
        </Container>
      </section>
    </>
  );
}
