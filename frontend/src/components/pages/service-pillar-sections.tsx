import Link from "next/link";
import { Container } from "@/components/ui/container";
import { DataPlatformsHoverGrid } from "./data-platforms-hover-grid";
import { DataEngineeringProcessTimeline } from "./data-engineering-process-timeline";
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
      <DataPlatformsHoverGrid platforms={platforms} />
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
      <DataEngineeringProcessTimeline steps={process} />
    </Container>
  </section>;
}
