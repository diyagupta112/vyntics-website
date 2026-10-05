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

    // Scroll-driven pinned panels need native page coordinates on this route.
    if (!wrapper || !content || reduceMotion.matches || pathname === "/technologies") return;

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
  }, [pathname]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      smootherRef.current?.scrollTrigger.refresh();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const trigger = event.target.closest<HTMLElement>('[data-scroll-target], a[href^="#"]');
      if (!trigger) return;

      const explicitTarget = trigger.dataset.scrollTarget;
      const href = trigger instanceof HTMLAnchorElement ? trigger.getAttribute("href") : null;
      const targetId = explicitTarget ?? (href && href !== "#" ? decodeURIComponent(href.slice(1)) : null);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      if (!explicitTarget && href && window.location.hash !== href) window.history.pushState(null, "", href);

      if (reduceMotion.matches) {
        target.scrollIntoView({ block: "start" });
        return;
      }

      const smoother = smootherRef.current;
      if (smoother) {
        smoother.scrollTo(target, true, "top 80px");
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  return (
    <div className={styles.wrapper} id="smooth-wrapper" ref={wrapperRef}>
      <div className={styles.content} id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
