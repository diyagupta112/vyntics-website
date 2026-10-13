"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import styles from "./data-engineering-process-timeline.module.css";

const dataEngineeringProcess = [
  { title: "Assess", visual: "Sources and outcomes", description: "Map sources, consumers, ownership, definitions, risk, data quality, and the decisions the system must support." },
  { title: "Design", visual: "Architecture and controls", description: "Define architecture, data contracts, models, security, lineage, quality rules, and operating responsibilities." },
  { title: "Build", visual: "Pipelines and models", description: "Deliver in usable increments with version control, automated tests, reconciliation, and deployment discipline." },
  { title: "Monitor", visual: "Quality and reliability", description: "Track freshness, volume, failures, quality, performance, lineage, usage, and cost in production." },
  { title: "Support", visual: "Operate and improve", description: "Resolve incidents, maintain source integrations, improve weak points, and transfer practical ownership to your team." },
] as const;

type ProcessStep = {
  title: string;
  visual: string;
  description: string;
};

export function DataEngineeringProcessTimeline({ steps = dataEngineeringProcess }: { steps?: readonly ProcessStep[] }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start 75%", "end 35%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.35 });

  return (
    <div className={styles.timeline} ref={timelineRef}>
      <span className={styles.rail} aria-hidden="true" />
      <motion.span className={styles.progress} aria-hidden="true" style={{ scaleY: reduceMotion ? 1 : progress }} />
      <ol>
        {steps.map((step, index) => (
          <li key={step.title}>
            <span className={styles.marker} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <article>
              <div className={styles.meta}>
                <span>Step {String(index + 1).padStart(2, "0")}</span>
                <span>{step.visual}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
