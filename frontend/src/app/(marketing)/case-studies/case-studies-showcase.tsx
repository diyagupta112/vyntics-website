"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { CaseStudyListItem, CaseStudyMedia } from "@/lib/case-studies";
import styles from "./page.module.css";

type ShowcaseStudy = CaseStudyListItem & { media: CaseStudyMedia };

function Demo({ study }: { study: ShowcaseStudy }) {
  const video = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (element && !reducedMotion) void element.play().catch(() => setFailed(true));
    return () => { element?.pause(); };
  }, [reducedMotion]);
  if (study.media.type === "video" && !failed) {
    return <video ref={video} autoPlay={!reducedMotion} controls={Boolean(reducedMotion)} loop muted playsInline preload="metadata" poster={study.media.poster ?? study.cover_image_url} onError={() => setFailed(true)} aria-label={`${study.title} product demonstration`}><source src={study.media.src} /></video>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={study.cover_image_url} alt={`${study.title} project cover`} width="960" height="540" />;
}

export function FeaturedCaseStudyCarousel({ studies }: { studies: ShowcaseStudy[] }) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  if (!studies.length) return null;
  const study = studies[index % studies.length];
  const move = (direction: number) => setIndex(current => (current + direction + studies.length) % studies.length);
  return (
    <div className={styles.showcase} role="region" aria-roledescription="carousel" aria-label="Featured case studies"
      onKeyDown={event => { if (event.target instanceof HTMLVideoElement) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}
      onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={event => { if (touchStart.current !== null) { const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1); } touchStart.current = null; }}>
      <article className={styles.showcaseSlide} key={study.id} aria-roledescription="slide" aria-label={`${index + 1} of ${studies.length}`}>
        <div className={styles.showcaseMedia}><Demo study={study} /></div>
        <div className={styles.showcaseCopy}>
          <p className={styles.eyebrow}>{[study.client_name, ...study.tags.slice(0, 2)].filter(Boolean).join(" · ")}</p>
          <h3>{study.title}</h3><p>{study.excerpt}</p>
          {study.tech_stack.length > 0 && <ul className={styles.technologies} aria-label="Technologies used">{study.tech_stack.slice(0, 5).map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>}
          <Link className={styles.showcaseAction} href={`/case-studies/${encodeURIComponent(study.slug)}`}>View Case Study <span aria-hidden="true">→</span></Link>
        </div>
      </article>
      {studies.length > 1 && <div className={styles.showcaseControls}><p aria-live="polite" aria-atomic="true">{String(index + 1).padStart(2, "0")} / {String(studies.length).padStart(2, "0")}</p><div><button type="button" onClick={() => move(-1)} aria-label="Previous featured case study">←</button><button type="button" onClick={() => move(1)} aria-label="Next featured case study">→</button></div></div>}
    </div>
  );
}
