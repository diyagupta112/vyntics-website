"use client";

import { useEffect } from "react";

/** Add data-reveal="unique-name" and optionally data-reveal-delay="90" within scope. */
export function ScrollReveals({ scope }: { scope: string }) {
  useEffect(() => {
    const root = document.querySelector(scope);
    if (!root || !window.IntersectionObserver) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    // CSS rules enhance SSR content without mutating React-owned attributes.
    const sheet = document.createElement("style");
    document.head.appendChild(sheet);
    type Entry = { selector: string; delay: number; baseTransform: string; opacity: string; state: "pending" | "running" | "done" };
    const entries = new Map<HTMLElement, Entry>();
    const timers = new Set<number>();
    let initial = true;
    const paint = () => {
      sheet.textContent = Array.from(entries.values()).map(entry => {
        if (entry.state === "done") return "";
        const properties = entry.state === "pending"
          ? "opacity:0;transform:translateY(var(--scroll-reveal-distance,20px)) var(--scroll-reveal-base-transform);"
          : `animation:scroll-reveal-enter 650ms cubic-bezier(.22,1,.36,1) ${entry.delay}ms both;`;
        return `${scope} ${entry.selector}{--scroll-reveal-base-transform:${entry.baseTransform};--scroll-reveal-opacity:${entry.opacity};${properties}will-change:opacity,transform;}`;
      }).join("\n");
    };
    const finish = (element: HTMLElement) => {
      const entry = entries.get(element);
      if (!entry) return;
      entry.state = "done";
      observer.unobserve(element);
      paint();
    };
    const reveal = (element: HTMLElement, instant = false) => {
      const entry = entries.get(element);
      if (!entry || entry.state !== "pending") return;
      observer.unobserve(element);
      if (instant || motion.matches) { finish(element); return; }
      entry.state = "running";
      paint();
      const timer = window.setTimeout(() => { timers.delete(timer); finish(element); }, 750 + entry.delay);
      timers.add(timer);
    };
    const observer = new IntersectionObserver(records => {
      records.forEach(record => {
        if (record.boundingClientRect.bottom <= 0) reveal(record.target as HTMLElement, true);
        else if (record.isIntersecting && record.intersectionRatio >= .15) reveal(record.target as HTMLElement);
      });
    }, { threshold: .15, rootMargin: "0px 0px -8% 0px" });
    const collect = () => {
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => {
        if (entries.has(element)) return;
        const name = element.dataset.reveal;
        if (!name) return;
        const rect = element.getBoundingClientRect();
        const inView = rect.top < innerHeight && rect.bottom > 0;
        const delay = Math.min(450, Math.max(0, Number(element.dataset.revealDelay) || 0) + (initial && inView ? 100 : 0));
        const style = getComputedStyle(element);
        const transform = style.transform;
        entries.set(element, { selector: `[data-reveal="${CSS.escape(name)}"]`, delay,
          baseTransform: transform === "none" ? "translateY(0)" : transform, opacity: style.opacity, state: "pending" });
        if (rect.bottom <= 0 || motion.matches) finish(element);
        else if (initial && inView) reveal(element);
        else observer.observe(element);
      });
      initial = false;
      paint();
    };
    const mutations = new MutationObserver(collect);
    mutations.observe(root, { childList: true, subtree: true });
    const showFocused = (event: Event) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-reveal]") : null;
      if (target) finish(target);
    };
    const showAnchor = () => {
      if (!location.hash) return;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
      for (const element of entries.keys()) {
        if (element.getBoundingClientRect().bottom <= 0 || target?.contains(element) || element.contains(target)) finish(element);
      }
    };
    const onMotionChange = () => { if (motion.matches) entries.forEach((_, element) => finish(element)); };
    const onEnd = (event: Event) => {
      if ((event as AnimationEvent).animationName === "scroll-reveal-enter") finish(event.target as HTMLElement);
    };
    // Some existing anchor controls use pushState, which emits no hashchange.
    const onAnchorClick = (event: Event) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!anchor || !root.contains(anchor)) return;
      const timer = window.setTimeout(() => { timers.delete(timer); showAnchor(); }, 0);
      timers.add(timer);
    };
    root.addEventListener("focusin", showFocused);
    root.addEventListener("animationend", onEnd);
    window.addEventListener("hashchange", showAnchor);
    document.addEventListener("click", onAnchorClick);
    motion.addEventListener("change", onMotionChange);
    collect();
    showAnchor();
    return () => {
      observer.disconnect(); mutations.disconnect();
      timers.forEach(timer => window.clearTimeout(timer));
      root.removeEventListener("focusin", showFocused);
      root.removeEventListener("animationend", onEnd);
      window.removeEventListener("hashchange", showAnchor);
      document.removeEventListener("click", onAnchorClick);
      motion.removeEventListener("change", onMotionChange);
      sheet.remove();
    };
  }, [scope]);
  return null;
}
