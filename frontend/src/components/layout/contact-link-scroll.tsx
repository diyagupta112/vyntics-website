"use client";

import { useEffect } from "react";

/**
 * Smooth scrolling for in-page buttons.
 * - Links to a section on the same page ("#process", "#cloud-services", "#contact") scroll there smoothly.
 * - Contact buttons point to "/#contact". When the page has its own contact form they scroll to it
 *   instead of leaving for the home page; pages without one keep the normal link.
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
      const id = href === "/#contact" ? "contact" : href.startsWith("#") && href.length > 1 ? decodeURIComponent(href.slice(1)) : null;
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    };
    // Capture phase, so the framework's own link handling does not jump or navigate away first.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
