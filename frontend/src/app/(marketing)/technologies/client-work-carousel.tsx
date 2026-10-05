"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Project } from "@/content/projects";
import styles from "./client-work-carousel.module.css";

export function ClientWorkCarousel({ projects }: { projects: readonly Project[] }) {
  const [active, setActive] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const move = (direction: number) => setActive((current) => (current + direction + projects.length) % projects.length);

  useEffect(() => {
    if (projects.length < 2) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      const carousel = carouselRef.current;
      if (!carousel || document.hidden || reducedMotion.matches || touchStart.current !== null || carousel.matches(":hover, :focus-within")) return;
      const bounds = carousel.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      setActive((current) => (current + 1) % projects.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [projects.length]);

  return (
    <div ref={carouselRef} className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Technology in client work"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}>
      <div className={styles.stage}
        onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
        onTouchEnd={(event) => {
          if (touchStart.current !== null) {
            const distance = event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1);
          }
          touchStart.current = null;
        }}>
        {projects.map((project, index) => {
          let offset = (index - active + projects.length) % projects.length;
          if (offset > projects.length / 2) offset -= projects.length;
          return (
            <article key={project.slug} className={styles.card} data-active={offset === 0}
              style={{ "--offset": offset, "--depth": Math.abs(offset) } as CSSProperties}
              aria-hidden={offset !== 0} inert={offset !== 0}>
              <div className={styles.cardTop}><span>{project.type}</span></div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <ul className={styles.tools}>{project.stack.slice(0, 5).map((tool) => <li key={tool}>{tool}</li>)}</ul>
              <Link href={`/case-studies/${project.slug}`}>Explore the case study <span aria-hidden="true">→</span></Link>
            </article>
          );
        })}
      </div>
      <div className={styles.controls}>
        <div className={styles.dots}>{projects.map((project, index) => <button key={project.slug} type="button"
          aria-label={`Show ${project.title}`} aria-pressed={active === index} onClick={() => setActive(index)} />)}</div>
      </div>
      <p className={styles.status}>{active + 1} / {projects.length} · {projects[active]?.title}</p>
    </div>
  );
}
