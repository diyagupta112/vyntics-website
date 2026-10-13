/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { CaseStudyPreviewSnapshot } from "./snapshot";
import { bodyWithoutHero, heroMedia } from "./media";
import { CasePreviewContent } from "./case-content";
import styles from "./public-preview.module.css";
export function CaseStudyPreview({ snapshot: s, instanceId }: { snapshot: CaseStudyPreviewSnapshot; instanceId: string }) {
  const media = heroMedia(s.content, s.cover);
  const content = bodyWithoutHero(s.content, media);
  const body = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const elements = Array.from(body.current?.querySelectorAll<HTMLHeadingElement>("h2") ?? []).filter(h => h.textContent?.trim());
    elements.forEach((h, i) => { h.id = `preview-${instanceId}-${i}`; });
    let frame = 0;
    const initialFrame = requestAnimationFrame(() => setHeadings(elements.map(h => ({ id: h.id, label: h.textContent! }))));
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = 0;
        elements.forEach((h, i) => { if (h.getBoundingClientRect().top <= Math.max(112, window.innerHeight * .25)) current = i; });
        setActive(current);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(initialFrame); cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [s, instanceId]);
  return <article>
    <header className={styles.caseHero}><div className={styles.container}><span className={styles.caseBack}>← All case studies</span><div className={styles.caseHeroGrid}>
      <div className={styles.caseMedia}>{!media ? <p>No cover image uploaded</p> : media.type === "image" ? <img src={media.src} alt={`${s.title} project cover`} /> : media.videoId ? <iframe src={media.src} title={`${s.title} product demonstration`} allowFullScreen /> : <video src={media.src} controls playsInline preload="metadata" poster={media.poster} />}</div>
      <div className={styles.caseSummary}><h1>{s.title || "Untitled Case Study"}</h1><p>{s.excerpt}</p><dl>{s.client ? <div><dt>Client</dt><dd>{s.client}</dd></div> : null}{s.tags.length ? <div><dt>Focus</dt><dd>{s.tags.join(", ")}</dd></div> : null}</dl></div>
    </div></div></header>
    <section className={styles.story}><div className={`${styles.container} ${styles.storyGrid}`}>
      <nav className={styles.timeline} aria-label="Project story sections"><h2>Project story</h2><ol>{headings.map((h, i) => <li key={h.id}><a href={`#${h.id}`} aria-current={i === active ? "step" : undefined}><span aria-hidden="true" />{h.label}</a></li>)}</ol></nav>
      <div className={styles.storyBody}><div ref={body}><CasePreviewContent content={content} /></div>{s.techStack.length ? <div className={styles.technology}><h2>Technology</h2><ul>{s.techStack.map((t, i) => <li key={`${t}-${i}`}>{t}</li>)}</ul></div> : null}</div>
    </div></section>
    <section className={styles.consultation}><div className={styles.container}><div><h2>Have a similar business requirement?</h2><p>Talk to our team and explore how we can help you solve it.</p></div><span>Consult our team ↗</span></div></section>
  </article>;
}
