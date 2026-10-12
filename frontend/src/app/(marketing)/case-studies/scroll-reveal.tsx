"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function CaseStudyScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.IntersectionObserver || !element.animate) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Content already in view (including restored scroll positions) never animates on load.
    const initial = element.getBoundingClientRect();
    if (initial.top < window.innerHeight || reducedMotion.matches) return;

    let scrolled = false;
    let revealed = false;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!scrolled || revealed || !entries.some(entry => entry.isIntersecting)) return;
      reveal();
    }, { rootMargin: "0px 0px 48px 0px", threshold: 0 });

    function reveal() {
      revealed = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (reducedMotion.matches) return;
      animation = element!.animate([
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    }

    function onScroll() {
      scrolled = true;
      const rect = element!.getBoundingClientRect();
      if (!revealed && rect.top < window.innerHeight + 48 && rect.bottom > 0) reveal();
    }

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        animation?.cancel();
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
      }
    };
    // Keyboard focus must never wait for a decorative reveal to finish.
    const onFocus = () => animation?.finish();
    observer.observe(element);
    window.addEventListener("scroll", onScroll, { passive: true });
    reducedMotion.addEventListener("change", onMotionChange);
    element.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      animation?.cancel();
      window.removeEventListener("scroll", onScroll);
      reducedMotion.removeEventListener("change", onMotionChange);
      element.removeEventListener("focusin", onFocus);
    };
  }, []);

  // Visible by default for SSR, no JavaScript, and reduced motion.
  return <div ref={ref}>{children}</div>;
}
