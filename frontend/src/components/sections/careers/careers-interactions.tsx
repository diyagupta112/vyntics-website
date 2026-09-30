"use client";

import { motion, useReducedMotion } from "motion/react";
import type { MouseEvent, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function revealMotion(reduceMotion: boolean | null, delay: number) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function RevealBlock({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  return <motion.div className={className} {...revealMotion(reduceMotion, delay)}>{children}</motion.div>;
}

export function RevealArticle({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  return <motion.article className={className} {...revealMotion(reduceMotion, delay)}>{children}</motion.article>;
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
