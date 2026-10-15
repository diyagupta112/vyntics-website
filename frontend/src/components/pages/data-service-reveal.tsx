"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function DataServiceReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      node.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.dataset.revealed = "true";
      observer.disconnect();
    }, { rootMargin: "0px 0px -10%", threshold: .08 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={className} data-revealed="false">{children}</div>;
}
