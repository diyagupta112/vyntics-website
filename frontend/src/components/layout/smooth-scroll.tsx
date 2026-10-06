"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import styles from "./smooth-scroll.module.css";

type SmoothScrollProps = {
  children: ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();
  // Keep the shared layout in normal document flow. Only intentional anchor
  // navigation is smoothed; wheel, touch and keyboard scrolling remain native.
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

      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  return (
    <div className={styles.wrapper} id="smooth-wrapper">
      <div className={styles.content} id="smooth-content">
        {children}
      </div>
    </div>
  );
}
