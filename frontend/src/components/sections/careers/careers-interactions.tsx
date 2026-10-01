"use client";

import { motion, useReducedMotion } from "motion/react";
import type { MouseEvent, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "scale";
};

function revealMotion(
  reduceMotion: boolean | null,
  delay: number,
  variant: RevealProps["variant"] = "up",
) {
  const initial = variant === "scale"
    ? { opacity: 0, scale: 0.975 }
    : variant === "left"
      ? { opacity: 0, x: -18 }
      : variant === "right"
        ? { opacity: 0, x: 18 }
        : { opacity: 0, y: 20 };

  const visible = variant === "scale"
    ? { opacity: 1, scale: 1 }
    : variant === "left" || variant === "right"
      ? { opacity: 1, x: 0 }
      : { opacity: 1, y: 0 };

  return {
    initial: reduceMotion ? false : initial,
    whileInView: visible,
    viewport: { once: true, amount: 0.18 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function RevealBlock({ children, className, delay = 0, variant = "up" }: RevealProps) {
  const reduceMotion = useReducedMotion();
  return <motion.div className={className} {...revealMotion(reduceMotion, delay, variant)}>{children}</motion.div>;
}

export function RevealArticle({ children, className, delay = 0, variant = "up" }: RevealProps) {
  const reduceMotion = useReducedMotion();
  return <motion.article className={className} {...revealMotion(reduceMotion, delay, variant)}>{children}</motion.article>;
}

export function CurrentOpeningsLink({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const reduceMotion = useReducedMotion();

  const scrollToOpenings = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("current-openings");
    if (!target) return;

    event.preventDefault();
    window.history.pushState(null, "", "#current-openings");
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <a className={className} href="#current-openings" onClick={scrollToOpenings}>
      {children}
    </a>
  );
}
