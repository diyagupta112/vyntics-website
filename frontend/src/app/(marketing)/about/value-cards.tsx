"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const values = [
  {
    title: "Creativity",
    text: "We continue to research more effective techniques and cutting-edge instruments, but we only embrace technology when it yields greater results.",
    detail: "Measurable value prior to scaling, targeted experiments, and early validation.",
    icon: "spark",
  },
  {
    title: "Have confidence",
    text: "Through open communication, dependable delivery, and candid decision-making, we establish enduring relationships.",
    detail: "Clear ownership, open communication about trade-offs, shared priorities, and no delivery surprises.",
    icon: "shield",
  },
  {
    title: "Excellent",
    text: "Every system must meet our production standards in order to be practical, quantifiable, maintained, and prepared for actual work.",
    detail: "Measurable results, tested systems, practical documentation, and ownership after launch.",
    icon: "diamond",
  },
] as const;

function ValueIcon({ type }: { type: (typeof values)[number]["icon"] }) {
  if (type === "shield") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
  }

  if (type === "diamond") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 6-8 12L4 9l8-6Z" /><path d="m4 9 8 3 8-3M12 12v9" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>;
}

export function ValueCards() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  function openTemporarily(index: number, pointerType: string) {
    if (pointerType === "mouse") return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveCard(index);
    closeTimer.current = setTimeout(() => setActiveCard(null), 3200);
  }

  return (
    <div className={styles.valueGrid}>
      {values.map((value, index) => (
        <article
          className={`${styles.valueCard} ${activeCard === index ? styles.valueCardActive : ""}`}
          key={value.title}
          tabIndex={0}
          onPointerDown={(event) => openTemporarily(index, event.pointerType)}
        >
          <span className={styles.iconBox}><ValueIcon type={value.icon} /></span>
          <h3>{value.title}</h3>
          <p>{value.text}</p>
          <p className={styles.valueDetail}>{value.detail}</p>
        </article>
      ))}
    </div>
  );
}
