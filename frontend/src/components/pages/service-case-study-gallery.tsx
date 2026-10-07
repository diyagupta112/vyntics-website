"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import type { CaseStudyListItem } from "@/lib/case-studies";
import { CaseStudyCover } from "@/components/sections/case-studies/case-study-cover";
import styles from "./service-case-study-gallery.module.css";

export function ServiceCaseStudyGallery({ studies }: { studies: CaseStudyListItem[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const current = studies.length ? index % studies.length : 0;
  const stopped = hovered || focused || hidden || paused || reducedMotion;

  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (studies.length < 2 || stopped) return;
    const timer = window.setTimeout(() => setIndex(value => (value + 1) % studies.length), 6000);
    return () => window.clearTimeout(timer);
  }, [index, studies.length, stopped]);

  function move(direction: number) {
    if (studies.length > 1) setIndex(value => (value + direction + studies.length) % studies.length);
  }
  if (!studies.length) return <p className={styles.empty} role="status">Case studies will appear here when available.</p>;

  return <div className={styles.gallery} role="region" aria-roledescription={studies.length > 1 ? "carousel" : undefined} aria-label="Published case studies"
    onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
    onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false); }}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}
    onTouchStart={event => { swiped.current = false; touch.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }}
    onTouchCancel={() => { touch.current = null; }}
    onTouchEnd={event => {
      if (touch.current && event.changedTouches.length) {
        const dx = event.changedTouches[0].clientX - touch.current.x;
        const dy = event.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped.current = true; move(dx < 0 ? 1 : -1); }
      }
      touch.current = null;
    }}
    onClickCapture={event => { if (swiped.current) { event.preventDefault(); swiped.current = false; } }}>
    <div id="service-case-study-slides" className={styles.slides} aria-live={stopped ? "polite" : "off"}>
      {studies.map((study, position) => <article key={study.id} className={styles.slide} data-active={position === current} aria-hidden={position !== current} inert={position !== current} aria-roledescription="slide" aria-label={`${position + 1} of ${studies.length}`}>
        <Link className={styles.card} href={`/case-studies/${encodeURIComponent(study.slug)}`}>
          <div className={styles.copy}>
            <p className={styles.meta}>{[study.client_name, ...study.tags.slice(0, 2)].filter(Boolean).join(" · ")}</p>
            <h3>{study.title}</h3>
            <p className={styles.summary}>{study.excerpt}</p>
            {study.tech_stack.length > 0 && <p className={styles.technology}>{study.tech_stack.join(" · ")}</p>}
            <span className={styles.read}>View case study <span aria-hidden="true">→</span></span>
          </div>
          <div className={styles.media}><CaseStudyCover src={study.cover_image_url} title={study.title} /></div>
        </Link>
      </article>)}
    </div>
    {studies.length > 1 && <div className={styles.toolbar}>
      <div className={styles.pagination} aria-label="Choose case study">{studies.map((study, position) => <button key={study.id} type="button" aria-label={`Show case study ${position + 1}: ${study.title}`} aria-current={position === current ? "true" : undefined} onClick={() => setIndex(position)}><span /></button>)}</div>
      <div className={styles.controls}>
        {!reducedMotion && <button type="button" aria-label={paused ? "Resume automatic rotation" : "Pause automatic rotation"} onClick={() => setPaused(value => !value)}>{paused ? "▷" : "Ⅱ"}</button>}
        <button type="button" aria-label="Previous case study" aria-controls="service-case-study-slides" onClick={() => move(-1)}>←</button>
        <button type="button" aria-label="Next case study" aria-controls="service-case-study-slides" onClick={() => move(1)}>→</button>
      </div>
    </div>}
  </div>;
}
