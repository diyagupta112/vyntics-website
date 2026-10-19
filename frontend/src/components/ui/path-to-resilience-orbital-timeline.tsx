"use client";

import { useId, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { Workflow } from "lucide-react";
import { Container } from "@/components/ui/container";
import styles from "./path-to-resilience-orbital-timeline.module.css";

export type TimelineStep = { title: string; label?: string; description: string };
export interface PathToResilienceOrbitalTimelineProps {
  title: string;
  description?: string;
  eyebrow?: string;
  headingId?: string;
  showStepNumbers?: boolean;
  steps: readonly TimelineStep[];
}

/** Uses the same native-scroll Motion subscription as the existing service timeline. */
export function PathToResilienceOrbitalTimeline({ title, description, eyebrow, headingId, steps, showStepNumbers = false }: PathToResilienceOrbitalTimelineProps) {
  const generatedId = useId();
  const titleId = headingId ?? `${generatedId}-title`;
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 35%"] });

  // React updates only when the current step changes, never on every scroll frame.
  useMotionValueEvent(scrollYProgress, "change", value => {
    const next = Math.round(value * Math.max(0, steps.length - 1));
    if (next !== activeRef.current) { activeRef.current = next; setActive(next); }
  });

  return <section className={styles.section} aria-labelledby={titleId} data-orbital-timeline>
    <Container>
      <div className={styles.layout}>
        <header className={styles.intro} data-reveal={`${titleId}-heading`}>
          {eyebrow && <p className={styles.eyebrow}><Workflow size={18} strokeWidth={1.5} aria-hidden="true" />{eyebrow}</p>}
          <h2 id={titleId}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </header>
        <ol ref={listRef} className={styles.timeline} aria-label={title}>
          {steps.map((step, index) => <li key={step.title} className={`${styles.step}${showStepNumbers ? ` ${styles.numbered}` : ""}`}
            data-active={index <= active} data-complete={index < active}
            aria-current={index === active ? "step" : undefined}>
            {showStepNumbers && <span className={styles.stepNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}
            <span className={styles.marker} aria-hidden="true" />
            <div data-reveal={`${titleId}-step-${index}`} data-reveal-delay={Math.min(index * 90, 450)}>
              <h3>{step.title}</h3>
              {step.label && <p className={styles.label}>{step.label}</p>}
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          </li>)}
        </ol>
      </div>
    </Container>
  </section>;
}
