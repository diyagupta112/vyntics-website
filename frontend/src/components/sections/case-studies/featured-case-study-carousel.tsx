"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CaseStudyVideo } from "@/components/sections/case-studies/case-study-video";
import { ThreeDCard } from "@/components/ui/three-d-card";
import type { CaseStudyListItem, CaseStudyMedia } from "@/lib/case-studies";
// Share Home's presentation while keeping this carousel's data and media behavior.
import design from "@/components/sections/home/featured-work.module.css";
import styles from "./featured-case-study-carousel.module.css";

type ShowcaseStudy = CaseStudyListItem & { media: CaseStudyMedia };

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d={direction === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "m7.5 4.5 5.5 5.5-5.5 5.5"} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>;
}

export function FeaturedCaseStudyCarousel({ studies, caseStudySeo = false }: { studies: ShowcaseStudy[]; caseStudySeo?: boolean }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (studies.length < 2 || hovered || focused || paused || hidden || reducedMotion) return;
    const timer = window.setTimeout(() => { setDirection(1); setIndex(current => (current + 1) % studies.length); }, 4000);
    return () => window.clearTimeout(timer);
  }, [index, studies.length, hovered, focused, paused, hidden, reducedMotion]);
  const touchStart = useRef<number | null>(null);
  if (!studies.length) return null;
  const activeIndex = index % studies.length;
  const study = studies[activeIndex];
  const move = (step: number) => { setDirection(step); setIndex(current => (current + step + studies.length) % studies.length); };
  const choose = (next: number) => { setDirection(next > activeIndex ? 1 : -1); setIndex(next); };
  const tags = study.tags.filter(tag => !study.tech_stack.includes(tag)).slice(0, 3);
  return (
    <div className={styles.showcase} role="region" aria-roledescription="carousel" aria-label="Featured case studies"
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false); }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => { if (event.target instanceof HTMLVideoElement) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}
      onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={event => { if (touchStart.current !== null) { const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1); } touchStart.current = null; }}>
      <div className={design.carouselViewport}>
        {/* Replace the old slide immediately so an outgoing video cannot keep playing during an exit animation. */}
        <motion.article key={study.id} className={`${design.card} ${design.cardGrid} ${styles.card}`} aria-roledescription="slide" aria-label={`${activeIndex + 1} of ${studies.length}`}
          initial={reducedMotion ? false : { opacity: 0, x: direction * 72 }} animate={{ opacity: 1, x: 0 }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 29 }}
          onClick={event => {
            if (!(event.target instanceof Element) || event.target.closest("a, button, input, select, textarea") || window.getSelection()?.toString()) return;
            router.push(`/case-studies/${encodeURIComponent(study.slug)}`);
          }}>
          <ThreeDCard wrapperClassName={design.visualFrame} className={design.visual}>
            <div className={styles.media}>
              <CaseStudyVideo optimizedCover={caseStudySeo} media={study.media} fallbackSrc={study.cover_image_url} title={study.title} controls={false} interactivePreview />
            </div>
            <span className={`${design.projectType} ${styles.projectType}`}>Case study</span>
          </ThreeDCard>
          <div className={`${design.content} ${styles.content}`}>
            <div><p className={design.client}>{study.client_name}</p><h3>{study.title}</h3><p className={design.summary}>{study.excerpt}</p></div>
            {tags.length > 0 && <ul className={design.proofPoints} aria-label="Project tags">{tags.map((tag, i) => <li key={`${tag}-${i}`}>{tag}</li>)}</ul>}
            <div className={design.cardFooter}>
              {study.tech_stack.length > 0 && <ul className={design.stack} aria-label="Technology stack">{study.tech_stack.map((name, i) => <li key={`${name}-${i}`}>{name}</li>)}</ul>}
              <Link aria-label={caseStudySeo ? `Read the ${study.title} case study` : undefined} className={design.caseStudyLink} href={`/case-studies/${encodeURIComponent(study.slug)}`}>Read the full case study <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </motion.article>
      </div>
      {studies.length > 1 && <div className={`${design.bottomControls} ${styles.bottomControls}`}>
        <div className={`${design.pagination} ${styles.pagination}`} aria-label="Choose a featured case study">
          {studies.map((item, i) => <button type="button" className={i === activeIndex ? design.activeDot : ""} onClick={() => choose(i)} aria-label={`Show ${item.title}`} aria-current={i === activeIndex ? "true" : undefined} key={item.id} />)}
        </div>
        <div className={design.carouselNavigation} aria-label="Featured case study carousel controls">
          <button type="button" onClick={() => setPaused(current => !current)} aria-label={paused ? "Resume automatic rotation" : "Pause automatic rotation"}>{paused ? "▷" : "Ⅱ"}</button>
          <button type="button" onClick={() => move(-1)} aria-label="Previous featured case study"><ArrowIcon direction="left" /></button>
          <button type="button" onClick={() => move(1)} aria-label="Next featured case study"><ArrowIcon direction="right" /></button>
        </div>
      </div>}
    </div>
  );
}
