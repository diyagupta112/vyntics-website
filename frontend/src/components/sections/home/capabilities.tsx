"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import styles from "./capabilities.module.css";

const capabilities = [
  {
    number: "01",
    anchor: "services-cloud",
    shortLabel: "CLOUD",
    scope: "DevOps, Architecture, and FinOps",
    title: "Foundations of Cloud",
    description:
      "Cloud design, migration, DevOps, and cost controls that are safe, dependable, and tailored to your actual workloads.",
  },
  {
    number: "02",
    anchor: "services-data",
    shortLabel: "DATA",
    scope: "Pipelines and Warehouses Governing",
    title: "Data Processing",
    description:
      "dependable pipelines, integrations, warehousing, quality assurance, and governance that transform disparate inputs into reliable information.",
  },
  {
    number: "03",
    anchor: "services-analytics",
    shortLabel: "BI",
    scope: "The dashboard Reporting and BI",
    title: "Data and BI",
    description:
      "BI consultancy, executive reporting, and dashboards based on agreed metrics and the choices your teams must make.",
  },
  {
    number: "04",
    anchor: "services-ai",
    shortLabel: "AI",
    scope: "Automation with RAG and Agents",
    title: "AI Approaches",
    description:
      "Intelligent automation created for actual business processes, controlled AI agents, and grounded knowledge assistants.",
  },
  {
    number: "05",
    anchor: "services-crm",
    shortLabel: "CRM",
    scope: "Sales Automation with CRM The revenue",
    title: "CRM & Income Operations",
    description:
      "CRM deployment, linked customer data, sales automation, and revenue analytics based on how your team works.",
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
          <p className={styles.eyebrow}>Services</p>
          <h2 id="capabilities-title">From unprocessed data to functional AI</h2>
          <p>Intelligent action and cloud underpinnings are all part of a single, interconnected journey.</p>
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
