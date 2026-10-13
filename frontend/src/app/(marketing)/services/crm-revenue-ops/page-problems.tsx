"use client";

import { useRef, type PointerEvent } from "react";
import { crmContent as content } from "./crm-revenue-ops-content";
import styles from "../cloud/cloud-problems.module.css";

const iconPaths = [
  <g key="server"><rect x="4" y="4" width="24" height="10" rx="2" /><rect x="4" y="18" width="24" height="10" rx="2" /><path d="M9 9h.01M9 23h.01M15 9h8M15 23h8" /></g>,
  <g key="scale"><path d="M5 13V5h8M19 5h8v8M27 19v8h-8M13 27H5v-8M5 5l8 8M27 5l-8 8M27 27l-8-8M5 27l8-8" /></g>,
  <g key="maintenance"><path d="M20 5a8 8 0 0 0-9 10L4 22a4 4 0 0 0 6 6l7-7a8 8 0 0 0 10-9l-5 5-7-7 5-5Z" /></g>,
  <g key="security"><path d="m16 3 11 4v8c0 7-7 12-11 14C12 27 5 22 5 15V7l11-4ZM16 10v7M16 22h.01" /></g>,
];

export function PageProblems() {
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
    // Read bounds once on entry; movement only writes decorative CSS coordinates.
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  }
  return <ul className={styles.grid}>
    {content.problems.map((problem, index) => <li className={styles.problem} key={problem.title} tabIndex={0}
      onPointerEnter={enterSpotlight} onPointerMove={moveSpotlight}
      onPointerLeave={event => { delete event.currentTarget.dataset.spotlight; boundsRef.current = null; }}>
      <div className={styles.topline}><svg viewBox="0 0 32 32" aria-hidden="true">{iconPaths[index]}</svg><span>{String(index + 1).padStart(2, "0")}</span></div>
      <h3>{problem.title}</h3>
      <p className={styles.description}>{problem.description}</p>
    </li>)}
  </ul>;
}
