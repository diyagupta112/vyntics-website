"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import styles from "./approach.module.css";

const steps = [
  {
    number: "01",
    label: "Explore",
    icon: "explore",
    title: "In-depth Research",
    description: "Before writing code, we understand your data environment, business objectives, and pain points.",
  },
  {
    number: "02",
    label: "Architect",
    icon: "architect",
    title: "Design of the System",
    description: "We create an architecture suited to your scale, avoiding unnecessary complexity while allowing room to grow.",
  },
  {
    number: "03",
    label: "Build",
    icon: "build",
    title: "Concentrated Action",
    description: "Our team turns the agreed design into a working solution, focusing on quality, testing, and reliable delivery.",
  },
  {
    number: "04",
    label: "Scale",
    icon: "scale",
    title: "Develop With You",
    description: "We help your solution evolve as your business grows, with continued improvements and support.",
  },
] as const;

type StepIconProps = {
  name: (typeof steps)[number]["icon"];
};

function StepIcon({ name }: StepIconProps) {
  if (name === "explore") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="21" cy="21" r="11" />
        <path d="m29 29 10 10M16 21h10M21 16v10" />
      </svg>
    );
  }

  if (name === "architect") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M29 7c6 1 11 6 12 12L27 33 15 21 29 7Z" />
        <path d="m15 21-6 2-3 8 10-1M27 33l-1 10 8-3 2-7M20 29l-7 7M16 38l-4 4" />
        <circle cx="31" cy="17" r="2.5" />
      </svg>
    );
  }

  if (name === "build") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="7" y="9" width="34" height="30" rx="3" />
        <path d="M7 17h34M13 33l7-8 7 5 8-10M13 14h.01M17 14h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 8v32h33M14 34l9-10 7 5 11-15" />
      <path d="M34 14h7v7" />
    </svg>
  );
}

export function Approach() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} data-in-view={inView} id="approach" className={styles.section} aria-labelledby="approach-title">
      <Container>
        <div className={styles.headingBlock}>
          <p className={styles.eyebrow}>Our delivery process</p>
          <h2 id="approach-title">How We Perform</h2>
          <p>From the initial dialog to an ongoing production system.</p>
        </div>

        <div className={styles.process} aria-label="Vyntics delivery process">
          <svg className={styles.flowMap} viewBox="0 0 1200 540" preserveAspectRatio="none" aria-hidden="true">
            <path
              className={styles.flowStem}
              d="M132 305V380 M444 160V235 M756 305V380 M1068 160V235"
            />
            <path
              className={styles.flowPath}
              pathLength="1"
              d="M30 270 Q132 340 234 270 M342 270 Q444 200 546 270 M654 270 Q756 340 858 270 M966 270 Q1068 200 1170 270"
            />
            <path
              className={styles.flowMotion}
              pathLength="1"
              d="M30 270 Q132 340 234 270 M342 270 Q444 200 546 270 M654 270 Q756 340 858 270 M966 270 Q1068 200 1170 270"
            />
            <circle className={`${styles.flowDot} ${styles.dotExplore}`} cx="30" cy="270" r="7" />
            <circle className={`${styles.flowDot} ${styles.dotExplore}`} cx="234" cy="270" r="7" />
            <circle className={`${styles.flowDot} ${styles.dotArchitect}`} cx="342" cy="270" r="7" />
            <circle className={`${styles.flowDot} ${styles.dotArchitect}`} cx="546" cy="270" r="7" />
            <circle className={`${styles.flowDot} ${styles.dotBuild}`} cx="654" cy="270" r="7" />
            <circle className={`${styles.flowDot} ${styles.dotBuild}`} cx="858" cy="270" r="7" />
            <circle className={`${styles.flowDot} ${styles.dotScale}`} cx="966" cy="270" r="7" />
            <circle className={`${styles.flowDot} ${styles.dotScale}`} cx="1170" cy="270" r="7" />
          </svg>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li
                className={styles.step}
                key={step.number}
                style={{ "--step-index": index } as CSSProperties}
              >
                <div className={styles.iconNode} aria-hidden="true">
                  <StepIcon name={step.icon} />
                </div>
                <article className={styles.stepCard}>
                  <p className={styles.stepLabel}>{step.label}</p>
                  <h3>{step.title}</h3>
                  <p className={styles.description}>{step.description}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
