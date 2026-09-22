"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import styles from "./capabilities.module.css";

const capabilities = [
  {
    number: "01",
    anchor: "services-ai",
    shortLabel: "AI",
    scope: "RAG · Agents · Automation",
    title: "Custom AI Solutions",
    description:
      "RAG chatbots and assistants grounded in your own data—with verified citations, 95%+ accuracy, and agentic automation across your tools.",
  },
  {
    number: "02",
    anchor: "services-data",
    shortLabel: "DATA",
    scope: "Pipelines · ETL · Warehousing",
    title: "Data Engineering & Management",
    description:
      "Reliable pipelines, ETL, and cloud warehousing that turn scattered data into one clean, governed, query-ready source of truth.",
  },
  {
    number: "03",
    anchor: "services-analytics",
    shortLabel: "BI",
    scope: "Dashboards · Reporting · BI",
    title: "Data Analytics & BI",
    description:
      "Power BI, Tableau, and QuickSight reporting with clearly defined metrics—so your data drives decisions instead of more questions.",
  },
  {
    number: "04",
    anchor: "services-cloud",
    shortLabel: "CLOUD",
    scope: "Architecture · Migration · FinOps",
    title: "Cloud Solutions",
    description:
      "Architecture, migration, and cost optimization across AWS, GCP, and Azure—sized for your real workload, not over-provisioned.",
  },
  {
    number: "05",
    anchor: "services-others",
    shortLabel: "MORE",
    scope: "APIs · Integrations · Consulting",
    title: "More Services",
    description:
      "Backend systems, third-party integrations, workflow automation, and hands-on technical consulting tailored to your product and team.",
  },
] as const;

export function Capabilities() {
  const reduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? selectedIndex;

  return (
    <section id="services" className={styles.section} aria-labelledby="capabilities-title">
      <Container>
        <header className={styles.headingBlock}>
          <p className={styles.eyebrow}>Capabilities</p>
          <h2 id="capabilities-title">What We Build For You</h2>
          <p>From custom AI to the data foundations it runs on—end to end.</p>
        </header>

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
            <motion.article
              id={capability.anchor}
              className={styles.card}
              key={capability.number}
              tabIndex={0}
              role="button"
              aria-pressed={selectedIndex === index}
              animate={cardAnimation}
              transition={{ type: "spring", stiffness: 250, damping: 24, mass: 0.8 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              onClick={toggleSelection}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleSelection();
                }
              }}
            >
              <div className={styles.cardTop} aria-hidden="true">
                <span className={styles.number}>{capability.number}</span>
                <span className={styles.icon}>{capability.shortLabel}</span>
              </div>
              <div className={styles.cardCopy}>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </div>
              <span className={styles.detail} aria-hidden="true">
                {capability.scope}
              </span>
            </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
