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

const technologies = ["Python", "React", "TypeScript", "Next.js", "Node.js", "JavaScript"] as const;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function TechnologyLogo({ name }: { name: (typeof technologies)[number] }) {
  if (name === "React") {
    return (
      <svg className={styles.reactLogo} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="5" />
        <ellipse cx="32" cy="32" rx="27" ry="10.5" />
        <ellipse cx="32" cy="32" rx="27" ry="10.5" transform="rotate(60 32 32)" />
        <ellipse cx="32" cy="32" rx="27" ry="10.5" transform="rotate(120 32 32)" />
      </svg>
    );
  }

  if (name === "Python") {
    return (
      <svg className={styles.pythonLogo} viewBox="0 0 64 64" aria-hidden="true">
        <path className={styles.pythonBlue} d="M31.7 5c-13.5 0-12.6 5.9-12.6 5.9v6.2H32v1.9H14S5 18 5 31.5 12.8 44 12.8 44h4.7v-6.6s-.3-7.8 7.7-7.8h12.9s7.2.1 7.2-7V11.8S46.4 5 31.7 5Zm-7.1 4.1a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8Z" />
        <path className={styles.pythonGold} d="M32.3 59c13.5 0 12.6-5.9 12.6-5.9v-6.2H32V45h18s9 1 9-12.5S51.2 20 51.2 20h-4.7v6.6s.3 7.8-7.7 7.8H25.9s-7.2-.1-7.2 7v10.8S17.6 59 32.3 59Zm7.1-4.1a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z" />
      </svg>
    );
  }

  if (name === "TypeScript") {
    return <span className={`${styles.letterLogo} ${styles.typeScriptLogo}`}>TS</span>;
  }

  if (name === "Next.js") {
    return <span className={`${styles.letterLogo} ${styles.nextLogo}`}>N</span>;
  }

  if (name === "Node.js") {
    return <span className={`${styles.letterLogo} ${styles.nodeLogo}`}>JS</span>;
  }

  return <span className={`${styles.letterLogo} ${styles.javaScriptLogo}`}>JS</span>;
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
              We&apos;re Vyntics-a team of data scientists, engineers, and strategists helping organizations turn complex information into trusted decisions, useful automation, and systems built to last.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/#contact">Start a conversation <ArrowIcon /></Link>
            </div>
          </div>

          <div className={styles.heroVisual} aria-label="Technologies we work with">
            <div className={styles.orbit}>
              <span className={styles.orbitCore}>
                <Image src="/images/vyntics-mark.png" alt="Vyntics" width={107} height={81} />
              </span>
              <div className={styles.orbitTrack}>
                {technologies.map((technology) => (
                  <div className={styles.orbitTechnology} key={technology}>
                    <div className={styles.technologyBadge} role="img" aria-label={technology}>
                      <TechnologyLogo name={technology} />
                    </div>
                  </div>
                ))}
              </div>
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
              We work directly with business and technical leaders from discovery through delivery-bringing data foundations, decision-ready analytics, practical AI, and cloud engineering together through one accountable team.
            </p>
            <p>Explore <Link href="/recognitions">our recognitions and certifications</Link> and the credentials behind our data and AI work.</p>
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
            <h2 id="mission-title">Helping teams make better decisions with <span>data and AI.</span></h2>
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
            <h2 id="values-title">How we make the work-and the partnership-better.</h2>
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
            <p className={styles.eyebrow}>Our story</p>
            <h2 id="story-title">Created to turn data into decisions and automation teams can trust.</h2>
            <p>
              Vyntics was built as an expert-led consulting team: small enough to move quickly, experienced enough to make sound technical decisions, and direct enough to keep clients close to the people doing the work.
            </p>
            <p>
              Whether the need is a modern data platform, analytics leadership actually uses, or practical AI automation, we bring structured execution and long-term maintainability-not another deck of recommendations.
            </p>
          </div>
        </Container>
      </section>

      <TeamShowcase />

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
