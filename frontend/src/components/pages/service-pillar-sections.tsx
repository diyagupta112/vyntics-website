import Link from "next/link";
import { Container } from "@/components/ui/container";
import styles from "@/app/(marketing)/services/data/page.module.css";

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}

// Presentations extracted unchanged from the Data Engineering pillar.
export function ServicePillarPlatforms({ platforms, eyebrow, heading, introduction, headingId = "platforms-title", sectionName }: {
  platforms: readonly { name: string; role: string; description: string }[];
  eyebrow: string; heading: string; introduction: string; headingId?: string; sectionName?: string;
}) {
  return <section className={`${styles.section} ${styles.platformSection}`} aria-labelledby={headingId} data-cloud-section={sectionName}>
    <Container>
      <div className={styles.sectionHeading}><p className={styles.label}>{eyebrow}</p><h2 id={headingId}>{heading}</h2><p>{introduction}</p></div>
          <div className={styles.platformGrid}>{platforms.map((platform) => <article key={platform.name}><p>{platform.role}</p><h3>{platform.name}</h3><span>{platform.description}</span></article>)}</div>
      <Link className={styles.inlineLink} href="/technologies">View all technologies <ArrowIcon /></Link>
    </Container>
  </section>;
}

export function ServicePillarApproach({ process, eyebrow = "How we work", heading, introduction, headingId = "process-title", sectionName }: {
  process: readonly { title: string; visual: string; description: string }[];
  eyebrow?: string; heading: string; introduction: string; headingId?: string; sectionName?: string;
}) {
  return <section className={`${styles.section} ${styles.processSection}`} aria-labelledby={headingId} data-cloud-section={sectionName}>
    <Container>
      <div className={`${styles.sectionHeading} ${styles.processHeading}`}><p className={styles.label}>{eyebrow}</p><h2 id={headingId}>{heading}</h2><p>{introduction}</p></div>
          <ol className={styles.processList}>
            {process.map((step, index) => (
              <li key={step.title}>
                <article className={styles.processCard}>
                  <span>Step {String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
                <span className={styles.processMarker} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div className={styles.processVisual} aria-hidden="true">
                  <svg viewBox="0 0 180 100">
                    <path d="M26 50h30m68 0h30M56 50l18-24m-18 24 18 24m50-24-18-24m18 24-18 24" />
                    <circle cx="20" cy="50" r="6" />
                    <circle cx="82" cy="20" r="8" />
                    <circle cx="82" cy="80" r="8" />
                    <rect x="76" y="41" width="28" height="18" rx="4" />
                    <circle cx="112" cy="20" r="8" />
                    <circle cx="112" cy="80" r="8" />
                    <circle cx="160" cy="50" r="6" />
                  </svg>
                  <span>{step.visual}</span>
                </div>
              </li>
            ))}
          </ol>
    </Container>
  </section>;
}
