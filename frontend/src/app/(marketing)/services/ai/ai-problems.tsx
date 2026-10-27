"use client";

import { useRef, type PointerEvent } from "react";
import styles from "../cloud/cloud-problems.module.css";

const problems = [
  { title: "Knowledge Stays Trapped", description: "We connect approved company knowledge to grounded assistants so teams can find useful answers with source evidence attached." },
  { title: "Manual Work Does Not Scale", description: "We combine language models, document intelligence, and workflow orchestration to remove repetitive work without hiding exceptions." },
  { title: "AI Pilots Never Reach Production", description: "We design permissions, evaluation, integration, observability, and ownership into the system before the pilot becomes operational." },
  { title: "Automation Creates Hidden Risk", description: "We constrain model and agent actions with clear limits, approval gates, traceability, and dependable recovery paths." },
] as const;

const iconPaths = [
  <g key="knowledge"><path d="M6 7h20v18H6zM10 11h12M10 16h8M10 21h10" /><path d="m22 20 4 4" /></g>,
  <g key="automation"><path d="M5 16h7M20 16h7M16 5v7M16 20v7" /><circle cx="16" cy="16" r="4" /><path d="m8 8 5 5M24 8l-5 5M8 24l5-5M24 24l-5-5" /></g>,
  <g key="production"><path d="M5 25V10l11-6 11 6v15l-11 4-11-4Z" /><path d="m5 10 11 5 11-5M16 15v14" /></g>,
  <g key="control"><path d="m16 3 11 4v8c0 7-7 12-11 14C12 27 5 22 5 15V7l11-4Z" /><path d="m11 16 3 3 7-8" /></g>,
];

export function AiProblems() {
  const boundsRef = useRef<DOMRect | null>(null);

  function enterSpotlight(event: PointerEvent<HTMLLIElement>) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    boundsRef.current = event.currentTarget.getBoundingClientRect();
    event.currentTarget.dataset.spotlight = "true";
    moveSpotlight(event);
  }

  function moveSpotlight(event: PointerEvent<HTMLLIElement>) {
    const bounds = boundsRef.current;
    if (!bounds || event.currentTarget.dataset.spotlight !== "true") return;
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  }

  return <ul className={styles.grid}>
    {problems.map((problem, index) => <li
      className={styles.problem}
      key={problem.title}
      tabIndex={0}
      onPointerEnter={enterSpotlight}
      onPointerMove={moveSpotlight}
      onPointerLeave={event => { delete event.currentTarget.dataset.spotlight; boundsRef.current = null; }}
    >
      <div className={styles.topline}><svg viewBox="0 0 32 32" aria-hidden="true">{iconPaths[index]}</svg></div>
      <h3>{problem.title}</h3>
      <p className={styles.description}>{problem.description}</p>
    </li>)}
  </ul>;
}
