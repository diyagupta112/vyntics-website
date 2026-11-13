"use client";

import { useEffect } from "react";

/**
 * Smooth scrolling for in-page buttons.
 * - Links to a section on the same page ("#process", "#cloud-services", "#contact") scroll there smoothly.
 * - Contact buttons point to "/contact-us". When the page has its own contact form they scroll to it;
 *   pages without one open the Contact Us page. The home page's form is never a target.
 * The "On this page" navigation on legal pages has its own scrolling and is left alone.
 */
export function ContactLinkScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.closest('nav[aria-label="On this page"]')) return;
      const href = link.getAttribute("href") ?? "";
      const onHome = window.location.pathname === "/";
      if (href === "/contact-us" && (onHome || link.closest("header, footer"))) return;
      const id = href === "/contact-us" ? "contact" : href.startsWith("#") && href.length > 1 ? decodeURIComponent(href.slice(1)) : null;
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
      if (reduce) return;
      // Pinned or horizontal scroll sections and late-loading content can cancel a smooth scroll midway.
      // Once scrolling stops short of the target, aim again, until it arrives or the visitor scrolls themselves.
      let lastY = -1;
      let retries = 0;
      let cancelled = false;
      const cancel = () => { cancelled = true; };
      window.addEventListener("wheel", cancel, { once: true, passive: true });
      window.addEventListener("touchstart", cancel, { once: true, passive: true });
      const timer = window.setInterval(() => {
        const y = window.scrollY;
        const stopped = y === lastY;
        lastY = y;
        if (cancelled || retries >= 10) { window.clearInterval(timer); return; }
        if (!stopped) return;
        const off = Math.abs(target.getBoundingClientRect().top);
        const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 2;
        if (off <= 4 || atBottom) { window.clearInterval(timer); return; }
        retries += 1;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    };
    // Capture phase, so the framework's own link handling does not jump or navigate away first.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
