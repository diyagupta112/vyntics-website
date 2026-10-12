"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import styles from "./data-platforms-hover-grid.module.css";

type DataPlatform = {
  name: string;
  role: string;
  description: string;
};

export function DataPlatformsHoverGrid({ platforms }: { platforms: readonly DataPlatform[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={styles.grid}
      onMouseLeave={() => setActiveIndex(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActiveIndex(null);
      }}
          >
      {platforms.map((platform, index) => (
        <Link
          className={styles.card}
          href="/technologies"
          key={platform.name}
          onFocus={() => setActiveIndex(index)}
          onMouseEnter={() => setActiveIndex(index)}
        >
          <AnimatePresence>
            {activeIndex === index && (
              <motion.span
                className={styles.hoverBackground}
                layoutId="data-platform-hover-background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 32 }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
          <span className={styles.content}>
            <span className={styles.meta}>
              <span className={styles.icon} aria-hidden="true">
                <svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="6.5" ry="3" /><path d="M5.5 6v6c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3V6M5.5 12v6c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3v-6" /></svg>
              </span>
              <span className={styles.role}>{platform.role}</span>
            </span>
            <strong>{platform.name}</strong>
            <span className={styles.description}>{platform.description}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
