"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import styles from "./service-approach.module.css";

const approachVisuals = [
  ["/images/technology-data-pipeline.png", "/images/technology-data-network.png", "/images/technology-data-workspace.png"],
  ["/images/technology-data-network.png", "/images/technology-data-finance-dashboard.png", "/images/technology-cloud.png"],
  ["/images/technology-data-workspace.png", "/images/technology-data-pipeline.png", "/images/technology-analytics-connected.png"],
  ["/images/technology-analytics-dashboard.png", "/images/technology-data-team.png", "/images/technology-data.png"],
] as const;

export function ServiceApproach({
  steps,
  heading = "Clear decisions from discovery through delivery.",
  introduction = "Four focused stages. One accountable path from the first conversation to a working solution.",
  variant = "timeline",
  theme,
}: {
  steps: ReadonlyArray<{ title: string; description: string }>;
  heading?: string;
  introduction?: string;
  variant?: "timeline" | "stacked-cards";
  theme?: "pipelines" | "warehouse" | "quality";
}) {
  const timelineRef = useRef<HTMLOListElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (variant === "stacked-cards") return;
    const timeline = timelineRef.current;
    if (!timeline) return;
    let frame: number | null = null;
    const update = () => {
      const bounds = timeline.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight * .65 - bounds.top) / bounds.height));
      if (progressRef.current) progressRef.current.style.transform = `scaleY(${progress})`;
      for (const row of timeline.children) {
        if (row.getBoundingClientRect().top < window.innerHeight * .85) row.setAttribute("data-visible", "true");
      }
      frame = null;
    };
    const schedule = () => { if (frame === null) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [variant]);

  return (
    <section className={styles.section} data-theme={theme} aria-labelledby="approach-title">
      <Container>
        <header className={styles.heading}>
          <p>Our approach</p>
          <h2 id="approach-title">{heading}</h2>
          <span>{introduction}</span>
        </header>
        {variant === "stacked-cards" ? (
          <ol className={styles.animatedGrid}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <article className={styles.animatedCard}>
                  <div className={styles.cardHeading}>
                    <div><p className={styles.stage}>Step {String(index + 1).padStart(2, "0")}</p><h3>{step.title}</h3></div>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </div>
                  <div className={styles.visualStack} aria-hidden="true">
                    {approachVisuals[index % approachVisuals.length].map((image, visualIndex) => (
                      <div className={styles.visualLayer} key={image}>
                        <Image src={image} alt="" fill sizes="(max-width: 720px) 42vw, 18vw" priority={index === 0 && visualIndex === 0} />
                      </div>
                    ))}
                  </div>
                  <div className={styles.cardMeta}><span>Structured delivery</span><span>Controlled validation</span></div>
                  <p className={styles.cardDescription}>{step.description}</p>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <ol ref={timelineRef} className={styles.timeline}>
            <li className={styles.track} aria-hidden="true"><span ref={progressRef} /></li>
            {steps.map((step, index) => (
              <li className={styles.step} key={step.title}>
                <article className={styles.card}>
                  <p className={styles.stage}>Step {String(index + 1).padStart(2, "0")}</p>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
                <span className={styles.marker} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div className={styles.placeholder} aria-label={`Image placeholder for ${step.title}`}>
                  <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="6" width="22" height="20" rx="3" /><circle cx="12" cy="12" r="2" /><path d="m6 23 7-7 5 5 4-4 5 5" /></svg>
                  <span>Image placeholder</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Container>
    </section>
  );
}
