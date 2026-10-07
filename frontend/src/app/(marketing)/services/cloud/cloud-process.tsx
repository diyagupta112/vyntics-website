"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cloudSteps } from "./cloud-foundations-content";
import styles from "./cloud-process.module.css";

export function CloudProcess() {
  const [active, setActive] = useState(0);
  const timeline = useRef<HTMLOListElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = timeline.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const stages = Array.from(root.children);
    const observer = new IntersectionObserver(() => {
      const readingLine = window.innerHeight * .45;
      let current = 0;
      stages.forEach((stage, index) => {
        if (stage.getBoundingClientRect().top <= readingLine) current = index;
      });
      setActive(previous => previous === current ? previous : current);
    }, { rootMargin: "-20% 0px -55% 0px", threshold: 0 });
    stages.forEach(stage => observer.observe(stage));
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={timeline} className={styles.timeline} aria-label="Cloud Foundations process">
      {cloudSteps.map((step, index) => (
        <li key={step.title} data-active={active === index} data-complete={index < active}
          aria-current={active === index ? "step" : undefined}>
          <span className={styles.marker} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <motion.div className={styles.copy}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            animate={reducedMotion ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, amount: .2 }}
            transition={{ duration: reducedMotion ? 0 : .35, ease: "easeOut" }}>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </motion.div>
        </li>
      ))}
    </ol>
  );
}
