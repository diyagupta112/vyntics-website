"use client";

import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import { mobileQuery } from "@/lib/breakpoints";

/**
 * Auto-rotates tabbed content. The active tab's blue line fills over `interval` ms (CSS animation on the root's
 * `data-rotating` flag) and its end advances to the next tab, so the pause on hover or focus stays in sync.
 * Paused while a mouse hovers, focus is inside, or the element is off screen. Disabled for reduced motion and on
 * phone-width screens, where the tabs open as an accordion.
 */
export function useAutoRotate(count: number, active: number, setActive: (index: number) => void, interval = 4000) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(prefers-reduced-motion:reduce), ${mobileQuery}`);
    const update = () => setEnabled(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const rotating = enabled && count > 1;
  return {
    props: {
      ref,
      "data-rotating": rotating,
      "data-paused": hovered || focused || !visible,
      style: { "--rotate-ms": `${interval}ms` } as CSSProperties,
      onPointerEnter: (event: PointerEvent<HTMLElement>) => { if (event.pointerType === "mouse") setHovered(true); },
      onPointerLeave: () => setHovered(false),
      onFocusCapture: () => setFocused(true),
      onBlurCapture: (event: FocusEvent<HTMLElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); },
      onAnimationEnd: (event: AnimationEvent<HTMLElement>) => { if (rotating && event.pseudoElement === "::after") setActive((active + 1) % count); },
    },
  };
}
