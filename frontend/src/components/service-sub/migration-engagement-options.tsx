"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Container } from "@/components/ui/container";
import { migrationEngagementSteps, type MigrationEngagementIcon, type MigrationEngagementStep } from "./migration-engagement-options.data";
import styles from "./migration-engagement-options.module.css";

function StepIcon({ icon }: { icon: MigrationEngagementIcon }) {
  if (icon === "assess") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h6M9 3h6v4H9zM7 5H5v16h14v-7" /><circle cx="15.5" cy="10.5" r="3.5" /><path d="m18 13 3 3" /></svg>;
  if (icon === "migrate") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h11m-3-3 3 3-3 3M19 17H8m3-3-3 3 3 3M5 7c-2 2-2 8 3 10m11 0c2-2 2-8-3-10" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.2c0 4.6 3.1 8.3 7.5 9.8 4.4-1.5 7.5-5.2 7.5-9.8V6L12 3Z" /><path d="M8.5 14a4 4 0 0 1 7 0M12 13l2-2" /></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>;
}

function CheckIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10 3.2 3.2L15.5 5.8" /></svg>;
}

function Arch({ id, active }: { id: string; active: boolean }) {
  const gradientId = `engagement-arch-${id}`;
  return <span className={styles.archGraphic} aria-hidden="true">
    <svg className={styles.arch} viewBox="0 0 200 100" preserveAspectRatio="none">
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1453DB" stopOpacity=".14" /><stop offset="1" stopColor="#1453DB" stopOpacity=".02" /></linearGradient></defs>
      <path className={styles.archFill} data-active={active} d="M0 100A100 100 0 0 1 200 100H0Z" fill={`url(#${gradientId})`} />
      <path className={styles.archPath} data-active={active} pathLength="100" d="M0 100A100 100 0 0 1 200 100" vectorEffect="non-scaling-stroke" />
      <circle className={styles.baseDot} data-active={active} cx="0" cy="100" r="3" vectorEffect="non-scaling-stroke" />
      <circle className={styles.baseDot} data-active={active} cx="200" cy="100" r="3" vectorEffect="non-scaling-stroke" />
    </svg>
  </span>;
}

function IconNode({ icon, active }: { icon: MigrationEngagementIcon; active: boolean }) {
  return <span className={styles.node} data-active={active} aria-hidden="true">
    <svg className={styles.progressRing} viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" pathLength="100" /></svg>
    <StepIcon icon={icon} />
  </span>;
}

export function MigrationEngagementOptions({
  sectionId = "migration-engagements",
  title = "Choose the right starting point",
  introduction = "Every migration starts somewhere different. Find the stage that matches where you are today.",
  steps = migrationEngagementSteps,
}: {
  sectionId?: string;
  title?: string;
  introduction?: string;
  steps?: readonly MigrationEngagementStep[];
}) {
  const generatedId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => { setEnhanced(true); });
    const close = (event: Event) => {
      if (event instanceof globalThis.KeyboardEvent && event.key !== "Escape") return;
      if (event.type === "pointerdown" && rowRef.current?.contains(event.target as Node)) return;
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      setOpen(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      cancelAnimationFrame(frame);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  const hover = (index: number | null) => {
    // 1200px matches the interactive three-column layout in this component's stylesheet, so it stays component-specific.
    if (!matchMedia("(min-width:1200px) and (hover:hover) and (pointer:fine)").matches) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (index !== null) setActive(index);
      setOpen(index);
    }, index === null ? 150 : 80);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + direction + steps.length) % steps.length;
    setActive(next);
    triggerRefs.current[next]?.focus();
  };

  return <section ref={rootRef} id={sectionId} className={styles.section}
    aria-labelledby={`${generatedId}-title`} data-enhanced={enhanced} data-revealed={revealed}>
    <Container>
      <header className={styles.heading} data-reveal={`${generatedId}-heading`}>
        <p className={styles.eyebrow}>Engagement options</p>
        <h2 id={`${generatedId}-title`}>{title}</h2>
        <p className={styles.introduction}>{introduction}</p>
      </header>
      <div className={styles.flow}>
      <div ref={rowRef} className={styles.stages}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            if (hoverTimer.current) clearTimeout(hoverTimer.current);
            setOpen(null);
          }
        }} data-reveal={`${generatedId}-stages`}
        onAnimationStart={event => { if (event.target === event.currentTarget && event.animationName === "scroll-reveal-enter") setRevealed(true); }}>
        {steps.map((step, index) => {
          const selected = active === index;
          const cardId = `${generatedId}-${step.id}-card`;
          const label = <><span className={styles.number}>{step.number}.</span> {step.title}</>;
          return <article key={step.id} className={styles.stage} data-active={selected} data-open={open === index} data-engagement-stage
            style={{ "--step-index": index } as CSSProperties}
            onPointerEnter={event => { if (event.pointerType === "mouse") hover(index); }}
            onPointerLeave={event => { if (event.pointerType === "mouse") hover(null); }}>
            <span className={styles.mobileNode}><IconNode icon={step.icon} active={false} /></span>
            <h3 className={styles.title}>
              <span className={styles.staticLabel}>{label}</span>
              <button ref={node => { triggerRefs.current[index] = node; }} className={styles.trigger} type="button"
                aria-label={`${step.number}. ${step.title}`} aria-expanded={open === index} aria-controls={cardId}
                onKeyDown={event => handleKeyDown(event, index)}
                onFocus={event => {
                  if (!event.currentTarget.matches(":focus-visible")) return;
                  if (hoverTimer.current) clearTimeout(hoverTimer.current);
                  setActive(index); setOpen(index);
                }}
                onClick={() => {
                  if (hoverTimer.current) clearTimeout(hoverTimer.current);
                  setActive(index);
                  setOpen(current => current === index ? null : index);
                }}>
                <span className={styles.label}>
                  <span className={styles.labelNumber}>{step.number}</span>
                  <span className={styles.labelTitle}>{step.title}</span>
                  <span className={styles.cue} aria-hidden="true">See what you get <svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" /><path d="M9 5v8M5 9h8" /></svg></span>
                </span>
              </button>
            </h3>
            <p className={styles.problem}>{step.problem}</p>
            <div className={styles.descriptionZone}>
              <p className={styles.description}>{step.description}</p>

            </div>
            <div className={styles.archZone}>
              <Arch id={`${generatedId}-${step.id}`} active={selected} />
              <IconNode icon={step.icon} active={selected} />
              <div id={cardId} className={styles.card} role="region" aria-label={`What you get: ${step.title}`}>
                <p className={styles.cardHeading}>What you get</p>
                <ul>{step.bullets.map(bullet => <li key={bullet}><CheckIcon /><span>{bullet}</span></li>)}</ul>
              </div>
            </div>
          </article>;
        })}
      </div>
      <span className={styles.connector} aria-hidden="true" />
      <div className={styles.action}><Link href="/contact-us" className={styles.cta}>Talk to our experts <ArrowIcon /></Link></div>
      </div>
    </Container>
  </section>;
}
