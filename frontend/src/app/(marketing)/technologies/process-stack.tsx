"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
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

export function ProcessStack({ steps }: ProcessStackProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let cancelled = false;
    let context: { revert: () => void } | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        context = gsap.context(() => {
          const panel = section.querySelector<HTMLElement>("[data-process-panel]");
          const cards = gsap.utils.toArray<HTMLElement>("[data-process-card]", section);
          if (!panel || !cards.length) return;

          gsap.set(cards, { y: 0, yPercent: (index) => index === 0 ? 0 : 112 });
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 80px",
              end: () => `+=${Math.max(1, section.offsetHeight - panel.offsetHeight)}`,
              pin: panel,
              pinType: "fixed",
              pinSpacing: false,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
          timeline.to({}, { duration: 0.35 });
          cards.slice(1).forEach((card) => {
            timeline.to(card, { yPercent: 0, duration: 1, ease: "none" });
            timeline.to({}, { duration: 0.3 });
          });
          ScrollTrigger.refresh();
        }, section);
      },
    );

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.processSection} aria-labelledby="process-title">
      <Container className={styles.processSticky} data-process-panel>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>How we utilize technology</p>
          <h2 id="process-title">Engineering includes selection.</h2>
          <p>The newest tool isn&apos;t always the best one. After lowering risk, we create the most straightforward, reliable route to the outcome.</p>
        </div>

        <div className={styles.processViewport}>
          {steps.map((step, index) => {
            return (
              <article
                data-process-card
                key={step.title}
                className={styles.processCard}
                style={{
                  "--stack-index": index,
                  transform: `translate3d(0, ${index === 0 ? 0 : 112}%, 0)`,
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
