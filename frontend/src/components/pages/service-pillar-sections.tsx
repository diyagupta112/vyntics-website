import { ServiceTools } from "./service-tools";
import { DataEngineeringProcessTimeline } from "./data-engineering-process-timeline";
import { Container } from "@/components/ui/container";
import styles from "@/app/(marketing)/services/data/page.module.css";

// Presentations extracted unchanged from the Data Engineering pillar.
export function ServicePillarPlatforms({ platforms, eyebrow, heading, introduction, headingId = "platforms-title", sectionName, showTechnologyLinks = true }: {
  platforms: readonly { name: string; role: string; description: string }[];
  eyebrow: string; heading: string; introduction: string; headingId?: string; sectionName?: string; showTechnologyLinks?: boolean;
}) {
  return <ServiceTools name={sectionName ?? heading} eyebrow={eyebrow} title={heading} headingId={headingId} sectionName={sectionName}
    introduction={introduction} technologies={platforms.map(platform => platform.name)} details={platforms} presentation="platforms"
    balancedPlatforms showTechnologyLinks={showTechnologyLinks} note={null}
    sectionLink={showTechnologyLinks ? { href: "/technologies", label: "View all technologies" } : undefined} />;
}

export function ServicePillarApproach({ process, eyebrow = "How we work", heading, introduction, headingId = "process-title", sectionName, presentation = "timeline" }: {
  process: readonly { title: string; visual: string; description: string }[];
  eyebrow?: string; heading: string; introduction: string; headingId?: string; sectionName?: string; presentation?: "timeline" | "workflow";
}) {
  return <section className={`${styles.section} ${styles.processSection}`} aria-labelledby={headingId} data-cloud-section={sectionName}>
    <Container>
      <div className={`${styles.sectionHeading} ${styles.processHeading}`} data-reveal={presentation === "workflow" ? `${headingId}-heading` : undefined}><p className={styles.label}>{eyebrow}</p><h2 id={headingId}>{heading}</h2><p>{introduction}</p></div>
      <DataEngineeringProcessTimeline steps={process} presentation={presentation} revealPrefix={headingId} />
    </Container>
  </section>;
}
