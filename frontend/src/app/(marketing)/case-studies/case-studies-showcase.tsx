"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { CaseStudyVideo } from "@/components/sections/case-studies/case-study-video";
import type { CaseStudyListItem, CaseStudyMedia } from "@/lib/case-studies";
import styles from "./page.module.css";

type ShowcaseStudy = CaseStudyListItem & { media: CaseStudyMedia };

export function FeaturedCaseStudyCarousel({ studies }: { studies: ShowcaseStudy[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (studies.length < 2 || hovered || focused || paused || reducedMotion) return;
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % studies.length), 4000);
    return () => window.clearTimeout(timer);
  }, [index, studies.length, hovered, focused, paused, reducedMotion]);
  const touchStart = useRef<number | null>(null);
  if (!studies.length) return null;
  const study = studies[index % studies.length];
  const move = (direction: number) => setIndex(current => (current + direction + studies.length) % studies.length);
  return (
    <div className={styles.showcase} role="region" aria-roledescription="carousel" aria-label="Featured case studies"
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false); }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => { if (event.target instanceof HTMLVideoElement) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}
      onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={event => { if (touchStart.current !== null) { const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1); } touchStart.current = null; }}>
      <article key={study.id} className={styles.showcaseSlide} aria-roledescription="slide" aria-label={`${index + 1} of ${studies.length}`}
        onClick={event => {
          // Keep links and video controls responsible for their own interactions.
          if (!(event.target instanceof Element) || event.target.closest("a, button, input, select, textarea") || window.getSelection()?.toString()) return;
          router.push(`/case-studies/${encodeURIComponent(study.slug)}`);
        }}>
        <div className={styles.showcaseMedia}><div className={styles.showcaseMediaFrame}>
          <CaseStudyVideo key={study.id} media={study.media} fallbackSrc={study.cover_image_url} title={study.title} controls={false} interactivePreview />
        </div></div>
        <div className={styles.showcaseContentStage}>
          {studies.map(item => <div className={`${styles.showcaseCopy} ${styles.showcaseSizer}`} key={item.id} aria-hidden="true" inert>
            <p className={styles.eyebrow}>{[item.client_name, ...item.tags.slice(0, 2)].filter(Boolean).join(" · ")}</p>
            <h3>{item.title}</h3><p>{item.excerpt}</p>
            {item.tech_stack.length > 0 && <ul className={styles.technologies}>{item.tech_stack.slice(0, 5).map((name, i) => <li key={`${name}-${i}`}>{name}</li>)}</ul>}
            <span className={styles.showcaseAction}>View Case Study <span aria-hidden="true">→</span></span>
          </div>)}
        <div className={styles.showcaseCopy}>
          <p className={styles.eyebrow}>{[study.client_name, ...study.tags.slice(0, 2)].filter(Boolean).join(" · ")}</p>
          <h3>{study.title}</h3><p>{study.excerpt}</p>
          {study.tech_stack.length > 0 && <ul className={styles.technologies} aria-label="Technologies used">{study.tech_stack.slice(0, 5).map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>}
          <Link className={styles.showcaseAction} href={`/case-studies/${encodeURIComponent(study.slug)}`}>View Case Study <span aria-hidden="true">→</span></Link>
        </div></div>
      </article>
      {studies.length > 1 && <div className={styles.showcaseControls}><div><button type="button" onClick={() => setPaused(current => !current)} aria-label={paused ? "Resume automatic rotation" : "Pause automatic rotation"}>{paused ? "▷" : "Ⅱ"}</button><button type="button" onClick={() => move(-1)} aria-label="Previous featured case study">←</button><button type="button" onClick={() => move(1)} aria-label="Next featured case study">→</button></div></div>}
    </div>
  );
}
