"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import styles from "./page.module.css";

type ProcessStep = {
  readonly title: string;
  readonly description: string;
  readonly points: readonly string[];
};

type ProcessStackProps = {
  steps: readonly ProcessStep[];
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function ProcessStack({ steps }: ProcessStackProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      frameRef.current = null;
      const section = sectionRef.current;
      if (!section) return;

      const stickyOffset = 80;
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      const travel = Math.max(1, section.offsetHeight - (window.innerHeight - stickyOffset));
      setProgress(clamp((window.scrollY - sectionTop + stickyOffset) / travel));
    };

    const requestUpdate = () => {
      if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const transitions = Math.max(1, steps.length - 1);

  return (
    <section ref={sectionRef} className={styles.processSection} aria-labelledby="process-title">
      <Container className={styles.processSticky}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>How we use technology</p>
          <h2 id="process-title">Selection is part of the engineering.</h2>
          <p>The newest tool is not automatically the right one. We reduce risk first, then build the simplest dependable path to the result.</p>
        </div>

        <div className={styles.processViewport}>
          {steps.map((step, index) => {
            const start = index === 0 ? 0 : (index - 1) / transitions;
            const cardProgress = index === 0 ? 1 : clamp((progress - start) * transitions);
            const easedProgress = 1 - Math.pow(1 - cardProgress, 3);
            const translateY = index === 0 ? 0 : (1 - easedProgress) * 112;
            const scale = index === 0 ? 1 : 0.985 + easedProgress * 0.015;

            return (
              <article
                key={step.title}
                className={styles.processCard}
                style={{
                  "--stack-index": index,
                  transform: `translate3d(0, ${translateY}%, 0) scale(${scale})`,
                } as CSSProperties}
              >
                <div className={styles.processCardTop}>
                  <span className={styles.processNumber} aria-hidden="true">0{index + 1}</span>
                  <span className={styles.processStage}>Process</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <ul className={styles.processPoints}>
                  {step.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
