"use client";

import { useRef, type PointerEvent } from "react";
import styles from "../cloud/cloud-problems.module.css";

const problems = [
  { title: "Manual data movement", description: "We replace recurring exports, copied files, and fragile handoffs with dependable automated pipelines." },
  { title: "Conflicting reports", description: "We centralize definitions and transformation logic so teams stop getting different answers from the same metric." },
  { title: "Slow or stale data", description: "We build observable data flows with clear freshness targets, safe retries, and recovery paths when processing fails." },
  { title: "Unclear ownership", description: "We connect critical sources, pipelines, and metrics to accountable owners with practical governance and lineage." },
] as const;

const iconPaths = [
  <g key="movement"><path d="M5 8h16M17 4l4 4-4 4M27 24H11M15 20l-4 4 4 4" /><rect x="4" y="15" width="24" height="3" rx="1.5" /></g>,
  <g key="reports"><path d="M5 27V8M5 27h23M10 22l5-6 5 3 7-10" /><path d="m22 9 5-.5-.5 5" /></g>,
  <g key="freshness"><circle cx="16" cy="16" r="12" /><path d="M16 9v8l5 3M7 5l-3 4M25 5l3 4" /></g>,
  <g key="ownership"><circle cx="16" cy="10" r="5" /><path d="M7 27c1-7 4-10 9-10s8 3 9 10M4 16h4M24 16h4" /></g>,
];

export function DataProblems() {
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
