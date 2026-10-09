"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import styles from "./approach.module.css";

const steps = [
  {
    number: "01",
    label: "Explore",
    title: "In-depth Research",
    description: "Before we write a single line of code, we comprehend your data environment, business objectives, and pain issues.",
  },
  {
    number: "02",
    label: "Architect",
    title: "Design of the System",
    description: "We create architecture that is appropriate for your scale, neither over-engineered nor under-built. It is always recorded.",
  },
  {
    number: "03",
    label: "Build",
    title: "Concentrated Action",
    description: "Every task is worked on by our professionals directly. output quality from the first sprint.",
  },
  {
    number: "04",
    label: "Scale",
    title: "Develop With You",
    description: "We transition smoothly, keep track of everything, and remain accessible as your data goals expand.",
  },
] as const;

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
          <p className={styles.eyebrow}>How we perform</p>
          <h2 id="approach-title">A Successful Delivery Method</h2>
          <p>From the initial dialog to an ongoing production system.</p>
        </div>

        <div className={styles.process}>
          <svg className={styles.route} viewBox="0 0 1000 320" preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.routeBase} d="M125 50 C245 50 245 270 375 270 C505 270 505 50 625 50 C745 50 745 270 875 270" />
            <path className={styles.routeActive} pathLength="1" d="M125 50 C245 50 245 270 375 270 C505 270 505 50 625 50 C745 50 745 270 875 270" />
          </svg>

          <ol className={styles.steps}>
            {steps.map((step) => (
              <li className={styles.step} key={step.number}>
                <div className={styles.stepInner}>
                  <p className={styles.stepLabel}>{step.number} · {step.label}</p>
                  <h3>{step.title}</h3>
                  <p className={styles.description}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
