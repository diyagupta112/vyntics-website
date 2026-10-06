"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import styles from "./page.module.css";

export function ConsultationLink({ children }: { children: ReactNode }) {
  const [circle, setCircle] = useState({ x: 0, y: 0, diameter: 0 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();

  function setOrigin(element: HTMLAnchorElement, x: number, y: number) {
    const { width, height } = element.getBoundingClientRect();
    const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
    setCircle({ x, y, diameter: radius * 2 + 2 });
  }

  return <Link className={styles.consultationAction} href="/case-studies#contact" data-case-study-reveal="text" data-case-study-delay="0.08" data-interacting={hovered || focused ? "true" : undefined}
    onPointerEnter={event => {
      if (event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      setOrigin(event.currentTarget, event.clientX - rect.left, event.clientY - rect.top);
      setHovered(true);
    }}
    onPointerLeave={() => setHovered(false)}
    onFocus={event => {
      if (!event.currentTarget.matches(":focus-visible")) return;
      const { width, height } = event.currentTarget.getBoundingClientRect();
      setOrigin(event.currentTarget, width / 2, height / 2);
      setFocused(true);
    }}
    onBlur={() => setFocused(false)}>
    <motion.span className={styles.consultationFill} aria-hidden="true"
      style={{ left: circle.x - circle.diameter / 2, top: circle.y - circle.diameter / 2, width: circle.diameter, height: circle.diameter }}
      initial={false} animate={{ scale: hovered || focused ? 1 : 0 }}
      transition={{ duration: reducedMotion ? 0 : .5, ease: [.16, 1, .3, 1] }} />
    <span className={styles.consultationLabel}>{children}</span>
  </Link>;
}
