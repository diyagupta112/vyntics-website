"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { ScrollSmoother as ScrollSmootherInstance } from "gsap/ScrollSmoother";
import styles from "./smooth-scroll.module.css";

type SmoothScrollProps = {
  children: ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const smootherRef = useRef<ScrollSmootherInstance | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!wrapper || !content || reduceMotion.matches) return;

    let cancelled = false;

    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/ScrollSmoother"),
    ]).then(([gsapModule, scrollTriggerModule, scrollSmootherModule]) => {
      if (cancelled) return;

      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;
      const { ScrollSmoother } = scrollSmootherModule;

      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

      smootherRef.current = ScrollSmoother.create({
        wrapper,
        content,
        smooth: 0.7,
        smoothTouch: false,
      });
    });

    return () => {
      cancelled = true;
      smootherRef.current?.kill();
      smootherRef.current = null;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      smootherRef.current?.scrollTrigger.refresh();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className={styles.wrapper} id="smooth-wrapper" ref={wrapperRef}>
      <div className={styles.content} id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
