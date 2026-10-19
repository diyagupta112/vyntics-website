"use client";

import { Container } from "@/components/ui/container";
import { serviceSitemap } from "@/content/service-sitemap";
import styles from "./capabilities.module.css";

type ServicePillarSlug = (typeof serviceSitemap)[number]["slug"];

const capabilityDetails: ReadonlyArray<{
  pillar: ServicePillarSlug;
  anchor: string;
  shortLabel: string;
  scope: string;
  description: string;
}> = [
  {
    pillar: "ai-solutions",
    anchor: "services-ai",
    shortLabel: "AI",
    scope: "RAG · Agents · Automation",
    description:
      "AI assistants, agents, and automation grounded in approved data and connected to the tools your teams already use.",
  },
  {
    pillar: "data-engineering",
    anchor: "services-data",
    shortLabel: "DATA",
    scope: "Pipelines · ETL · Warehousing",
    description:
      "Reliable pipelines, integrations, warehouses, and governance that turn scattered business data into a trusted foundation.",
  },
  {
    pillar: "analytics-bi",
    anchor: "services-analytics",
    shortLabel: "BI",
    scope: "Dashboards · Reporting · BI",
    description:
      "Dashboards, executive reporting, and BI consulting built around shared metrics and the decisions teams need to make.",
  },
  {
    pillar: "cloud-foundations",
    anchor: "services-cloud",
    shortLabel: "CLOUD",
    scope: "Architecture · Migration · FinOps",
    description:
      "Cloud architecture, migration, DevOps, reliability, and cost controls designed around how your workloads actually operate.",
  },
  {
    pillar: "crm-revenue-ops",
    anchor: "services-others",
    shortLabel: "CRM",
    scope: "CRM · Automation · Revenue Analytics",
    description:
      "CRM implementation, system integration, sales automation, and revenue reporting aligned with how your team works.",
  },
];

const capabilities = capabilityDetails.map((capability) => {
  const pillar = serviceSitemap.find((item) => item.slug === capability.pillar);
  if (!pillar) throw new Error(`Missing service pillar: ${capability.pillar}`);
  return { ...capability, href: `/services/${pillar.slug}`, title: pillar.name };
});

export function Capabilities({ showHeading = true, linkCards = false, cardsOnly = false, sectionId = "services" }: { showHeading?: boolean; linkCards?: boolean; cardsOnly?: boolean; sectionId?: string } = {}) {
  return (
    <section id={sectionId} className={`${styles.section} ${cardsOnly ? styles.cardsOnly : ""}`} aria-labelledby={showHeading ? "capabilities-title" : undefined} aria-label={showHeading ? undefined : "Services"}>
      <Container>
        {showHeading && <header className={styles.headingBlock}>
          <p className={styles.eyebrow}>Services</p>
          <h2 id="capabilities-title">From raw data to working AI</h2>
          <p>From custom AI to the data foundations it runs on-end to end.</p>
        </header>}

        <div className={styles.grid}>
          {capabilities.map((capability) => {
            const content = <>
              <div className={styles.cardTop} aria-hidden="true">
                <span className={styles.icon}>{capability.shortLabel}</span>
              </div>
              <div className={styles.cardCopy}>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </div>
              <span className={styles.detail} aria-hidden="true">
                {capability.scope}
              </span>
            </>;

            return linkCards ? (
              <a id={capability.anchor} className={styles.card} href={capability.href} key={capability.anchor}>{content}</a>
            ) : (
              <article id={capability.anchor} className={styles.card} key={capability.anchor}>{content}</article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
