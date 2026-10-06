"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./case-study-story-timeline.module.css";

type Anchor = { id: string; label: string; element: HTMLHeadingElement };

export function CaseStudyStoryTimeline({ children, technology, slug, title }: { children: ReactNode; technology: ReactNode; slug: string; title: string }) {
  const body = useRef<HTMLDivElement>(null);
  const timeline = useRef<HTMLElement>(null);
  const updateProgress = useRef<(() => void) | null>(null);
  const sectionRails = useRef<HTMLDivElement>(null);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = body.current;
    if (!root) return;
    // Read the existing renderer's output; never interpret or reconstruct editor JSON.
    const sections = Array.from(root.querySelectorAll<HTMLHeadingElement>("h2"));
    const entries = sections.filter(heading => heading.textContent?.trim()).map((element, index) => {
      const id = element.id || `story-${slug}-${index + 1}`;
      element.id = id;
      element.style.scrollMarginTop = "7rem";
      return { id, label: element.textContent!.trim(), element };
    });
    let frame = 0;
    let previousSection = -1;
    const update = () => {
      frame = 0;
      const readingLine = Math.max(112, window.innerHeight * .25);
      let current = 0;
      entries.forEach((entry, index) => {
        if (entry.element.getBoundingClientRect().top <= readingLine) current = index;
      });
      setActive(previous => previous === current ? previous : current);
      if (current !== previousSection && entries[current]) {
        previousSection = current;
        root.dispatchEvent(new CustomEvent("case-study-section-active", { bubbles: true, detail: entries[current].id }));
      }
      // Presentation-only H2 ranges; authored nodes remain untouched in their renderer.
      const rootTop = root.getBoundingClientRect().top;
      const rails = sectionRails.current?.children;
      entries.forEach((entry, index) => {
        const rail = rails?.[index] as HTMLElement | undefined;
        if (!rail) return;
        const start = entry.element.getBoundingClientRect().top - rootTop;
        const next = entries[index + 1];
        const end = next ? next.element.getBoundingClientRect().top - rootTop : root.getBoundingClientRect().height;
        rail.style.top = `${start}px`;
        rail.style.height = `${Math.max(0, end - start)}px`;
      });
      const items = timeline.current?.querySelectorAll<HTMLLIElement>("li");
      entries.forEach((entry, index) => {
        const item = items?.[index];
        const next = entries[index + 1];
        if (!item || !next) return;
        const marker = item.querySelector<HTMLElement>(` .${styles.marker}`);
        const nextMarker = items?.[index + 1]?.querySelector<HTMLElement>(` .${styles.marker}`);
        if (!marker || !nextMarker) return;
        const start = entry.element.getBoundingClientRect().top;
        const end = next.element.getBoundingClientRect().top;
        const fraction = Math.max(0, Math.min(1, (readingLine - start) / Math.max(1, end - start)));
        const center = marker.getBoundingClientRect().top + marker.offsetHeight / 2;
        const nextCenter = nextMarker.getBoundingClientRect().top + nextMarker.offsetHeight / 2;
        item.style.setProperty("--track-top", `${center - item.getBoundingClientRect().top}px`);
        item.style.setProperty("--track-height", `${nextCenter - center}px`);
        item.style.setProperty("--progress", String(fraction));
      });
    };
    updateProgress.current = update;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    frame = requestAnimationFrame(() => {
      entries.forEach(entry => entry.element.classList.add(styles.sectionAnchor));
      setAnchors(entries);
      update();
    });
    const observer = new IntersectionObserver(schedule, { rootMargin: "-15% 0px -60% 0px", threshold: 0 });
    entries.forEach(entry => observer.observe(entry.element));
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(root);
    // Heading positions also cover long sections and upward scrolling between headings.
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      updateProgress.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      entries.forEach(entry => entry.element.classList.remove(styles.sectionAnchor));
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [slug, title]);

  useEffect(() => { updateProgress.current?.(); }, [anchors]);

  function goTo(anchor: Anchor) {
    anchor.element.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }

  return (
    <div className={styles.layout}>
      <nav ref={timeline} className={styles.timeline} aria-label="Project story sections">
        <h2 id="story-title" className={styles.label}>Project story</h2>
        {anchors.length > 0 && <ol>{anchors.map((anchor, index) => (
          <li key={anchor.id} className={index === active ? styles.active : index < active ? styles.completed : undefined}>
            {index < anchors.length - 1 && <span className={styles.track} aria-hidden="true"><span /></span>}
            <button type="button" onClick={() => goTo(anchor)} aria-current={index === active ? "step" : undefined}>
              <span className={styles.marker} aria-hidden="true" />{anchor.label}
            </button>
          </li>
        ))}</ol>}
      </nav>
      <div className={styles.content}>
        <div ref={body} className={styles.authoredBody} data-case-study-body>
          {children}
          <div ref={sectionRails} className={styles.sectionRails} aria-hidden="true">
            {anchors.map((anchor, index) => <span key={anchor.id} data-story-section={anchor.id} className={index === active ? styles.activeSection : undefined} />)}
          </div>
        </div>
        {technology}
      </div>
    </div>
  );
}
