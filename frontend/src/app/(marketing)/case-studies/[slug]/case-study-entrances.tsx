"use client";

import { useEffect } from "react";
import { animate, inView } from "motion";
import styles from "./page.module.css";

export function CaseStudyEntrances({ slug }: { slug: string }) {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const stops: (() => void)[] = [];
    const originals = new Map<HTMLElement, { opacity: string; transform: string }>();
    const unwrap: (() => void)[] = [];
    const groups = new Map<HTMLHeadingElement, { words: HTMLElement; content: HTMLElement[] }>();
    const revealed = new Set<HTMLHeadingElement>();
    function remember(element: HTMLElement) {
      if (!originals.has(element)) originals.set(element, { opacity: element.style.opacity, transform: element.style.transform });
    }
    function restore() {
      stops.splice(0).forEach(stop => stop());
      originals.forEach((original, element) => {
        element.style.opacity = original.opacity;
        element.style.transform = original.transform;
      });
    }
    function reveal(element: HTMLElement, delay = 0, media = false) {
      if (preference.matches) return;
      remember(element);
      // Set the initial state immediately, including during the short stagger delay.
      element.style.opacity = "0";
      const distance = matchMedia("(max-width: 860px)").matches ? 16 : 24;
      const animation = animate(element, media ? { opacity: [0, 1], scale: [.985, 1] } : { opacity: [0, 1], y: [distance, 0] }, {
        duration: .65, delay, ease: [.16, 1, .3, 1],
      });
      let stopped = false;
      void animation.then(() => {
        if (stopped) return;
        const original = originals.get(element);
        if (original) { element.style.opacity = original.opacity; element.style.transform = original.transform; }
      });
      stops.push(() => { stopped = true; animation.stop(); });
    }
    function revealGroup(heading: HTMLHeadingElement) {
      const group = groups.get(heading);
      if (!group || revealed.has(heading) || preference.matches) return;
      const top = heading.getBoundingClientRect().top;
      if (top >= innerHeight || heading.getBoundingClientRect().bottom <= 0) return;
      revealed.add(heading);
      reveal(group.words);
      group.content.forEach((element, index) => {
        // Cap the delay so long articles never become a slow presentation.
        reveal(element, .08 + Math.min(index, 3) * .07, element.tagName === "FIGURE");
      });
    }
    const body = document.querySelector<HTMLElement>("[data-case-study-body]");
    const onActive = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const heading = [...groups.keys()].find(element => element.id === id);
      if (heading) revealGroup(heading);
    };
    if (!preference.matches) {
      const heroMedia = document.querySelector<HTMLElement>(`.${styles.primaryMedia}`);
      if (heroMedia) reveal(heroMedia, 0, true);
      document.querySelectorAll<HTMLElement>("[data-case-study-reveal]").forEach(element => {
        const delay = Number(element.dataset.caseStudyDelay || 0);
        if (element.dataset.caseStudyReveal === "cards") {
          Array.from(element.children).forEach((child, index) => {
            if (child instanceof HTMLElement) stops.push(inView(child, () => { reveal(child, index * .08); }, { margin: "0px 0px -80px 0px" }));
          });
          return;
        }
        if (element.classList.contains(styles.technology)) {
          stops.push(inView(element, () => {
            Array.from(element.children).forEach((child, index) => {
              if (child instanceof HTMLElement) reveal(child, index * .08);
            });
          }, { margin: "0px 0px -80px 0px" }));
          return;
        }
        stops.push(inView(element, () => { reveal(element, delay); }, { margin: "0px 0px -80px 0px" }));
      });
      const prose = body?.firstElementChild;
      if (prose) {
        let group: { words: HTMLElement; content: HTMLElement[] } | null = null;
        Array.from(prose.children).forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          if (node instanceof HTMLHeadingElement && node.tagName === "H2") {
            // Move only the heading's existing words into a presentation span;
            // preserve the H2 box, ID, authored order and scroll measurements.
            const words = document.createElement("span");
            words.style.display = "inline-block";
            words.append(...Array.from(node.childNodes));
            node.append(words);
            unwrap.push(() => { words.replaceWith(...Array.from(words.childNodes)); });
            group = { words, content: [] };
            groups.set(node, group);
          } else if (group) group.content.push(node);
        });
        body?.addEventListener("case-study-section-active", onActive);
        groups.forEach((_, heading) => {
          // Observe the same reading line as the timeline, including the first
          // section whose active index is already zero before it enters view.
          const readingLine = Math.max(112, innerHeight * .25);
          stops.push(inView(heading, () => { revealGroup(heading); }, { margin: `0px 0px ${Math.min(0, readingLine - innerHeight)}px 0px` }));
        });
      }
    }
    const onPreferenceChange = () => { if (preference.matches) restore(); };
    preference.addEventListener("change", onPreferenceChange);
    return () => {
      body?.removeEventListener("case-study-section-active", onActive);
      preference.removeEventListener("change", onPreferenceChange);
      restore();
      unwrap.forEach(cleanup => cleanup());
    };
  }, [slug]);
  return null;
}
