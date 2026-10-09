"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import styles from "./capabilities.module.css";

const capabilities = [
  {
    anchor: "services-ai",
    href: "/services/ai-solutions",
    shortLabel: "AI",
    scope: "RAG · Agents · Automation",
    title: "Custom AI Solutions",
    description:
      "AI that answers from your data and cites where it got each answer. Our RAG systems run at 95%+ accuracy in production.",
  },
  {
    anchor: "services-data",
    href: "/services/data-engineering",
    shortLabel: "DATA",
    scope: "Pipelines · ETL · Warehousing",
    title: "Data Engineering & Management",
    description:
      "We pull your scattered data into one clean, reliable place: pipelines, ETL and a cloud warehouse your team can query.",
  },
  {
    anchor: "services-analytics",
    href: "/services/analytics-bi",
    shortLabel: "BI",
    scope: "Dashboards · Reporting · BI",
    title: "Data Analytics & BI",
    description:
      "Dashboards in Power BI, Tableau or QuickSight, built around metrics your team has agreed on, so nobody argues about whose number is right.",
  },
  {
    anchor: "services-cloud",
    href: "/services/cloud-foundations",
    shortLabel: "CLOUD",
    scope: "Architecture · Migration · FinOps",
    title: "Cloud Solutions",
    description:
      "We set up, move and tune your systems on AWS, GCP or Azure, sized to what you actually run so you stop paying for idle capacity.",
  },
  {
    anchor: "services-others",
    href: "/services/crm-revenue-ops",
    shortLabel: "CRM",
    scope: "CRM · Automation · Revenue Analytics",
    title: "CRM & Revenue Operations",
    description:
      "We connect your CRM, sales workflows, and reporting so your team can follow every opportunity and act on reliable revenue data.",
  },
] as const;

export function Capabilities({ showHeading = true, linkCards = false, cardsOnly = false, sectionId = "services" }: { showHeading?: boolean; linkCards?: boolean; cardsOnly?: boolean; sectionId?: string } = {}) {
  const Card = linkCards ? motion.a : motion.article;
  const reduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? selectedIndex;

  return (
    <section id={sectionId} className={`${styles.section} ${cardsOnly ? styles.cardsOnly : ""}`} aria-labelledby={showHeading ? "capabilities-title" : undefined} aria-label={showHeading ? undefined : "Services"}>
      <Container>
        {showHeading && <header className={styles.headingBlock}>
          <p className={styles.eyebrow}>Services</p>
          <h2 id="capabilities-title">From raw data to working AI</h2>
          <p>From custom AI to the data foundations it runs on-end to end.</p>
        </header>}

        <div className={styles.grid}>
          {capabilities.map((capability, index) => {
            const relativePosition = activeIndex === null ? 0 : index - activeIndex;
            const distance = Math.abs(relativePosition);
            const direction = Math.sign(relativePosition);
            const isActive = activeIndex === index;
            const isInactive = activeIndex !== null && !isActive;

            const cardAnimation = reduceMotion
              ? { opacity: isInactive ? 0.48 : 1 }
              : {
                  x: isInactive ? direction * (12 + distance * 10) : 0,
                  y: isActive ? -8 : isInactive ? distance * 2 : 0,
                  z: isActive ? 48 : isInactive ? 16 + distance * 18 : 0,
                  rotateY: isInactive ? -direction * Math.min(26, 7 + distance * 6) : 0,
                  rotateZ: 0,
                  scale: isActive ? 1.035 : isInactive ? 1 + distance * 0.003 : 1,
                  opacity: isInactive ? Math.max(0.42, 0.62 - distance * 0.035) : 1,
                  filter: isInactive ? `blur(${Math.min(2.2, 0.8 + distance * 0.3)}px)` : "blur(0px)",
                };

            const toggleSelection = () => {
              setSelectedIndex((current) => current === index ? null : index);
            };

            return (
            <Card
              id={capability.anchor}
              className={styles.card}
              key={capability.anchor}
              tabIndex={0}
              href={linkCards ? capability.href : undefined}
              role={linkCards ? undefined : "button"}
              aria-pressed={linkCards ? undefined : selectedIndex === index}
              animate={cardAnimation}
              transition={{ type: "spring", stiffness: 250, damping: 24, mass: 0.8 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              onClick={linkCards ? undefined : toggleSelection}
              onKeyDown={linkCards ? undefined : (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleSelection();
                }
              }}
            >
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
            </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
