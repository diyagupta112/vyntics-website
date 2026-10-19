"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { motion, useMotionValueEvent, type MotionValue } from "motion/react";
import styles from "./cloud-workflow-timeline.module.css";

type Step = { title: string; visual: string; description: string };
type Point = { x: number; y: number };
type Geometry = { width: number; height: number; path: string; arrows: { x: number; y: number; angle: number }[] };

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeToMotionPreference(notify: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
const getMotionPreference = () => window.matchMedia(motionQuery).matches;
const getServerMotionPreference = () => false;

/** Keeps DOM reading order intact while CSS positions alternate rows in reverse. */
function cell(index: number, columns: number) {
  const row = Math.floor(index / columns);
  return { row: row + 1, column: row % 2 ? columns - index % columns : index % columns + 1 };
}

export function CloudWorkflowTimeline({ steps, progress, timelineRef, revealPrefix }: {
  steps: readonly Step[]; progress: MotionValue<number>;
  timelineRef: RefObject<HTMLDivElement | null>; revealPrefix: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [geometry, setGeometry] = useState<Geometry>({ width: 1, height: 1, path: "", arrows: [] });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const skipMotion = useSyncExternalStore(subscribeToMotionPreference, getMotionPreference, getServerMotionPreference);
  const columns = Math.max(1, Math.min(4, Math.ceil(steps.length / 2)));

  // Reuse the existing timeline's scroll progress instead of adding a second scroll listener.
  useMotionValueEvent(progress, "change", value => {
    const next = Math.round(value * Math.max(0, steps.length - 1));
    if (next !== activeRef.current) { activeRef.current = next; setActive(next); }
  });

  useLayoutEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const bounds = map.querySelector("svg")!.getBoundingClientRect();
      const points: Point[] = Array.from(map.querySelectorAll<HTMLElement>("[data-workflow-node]"), node => {
        const rect = node.getBoundingClientRect();
        return { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2 };
      });
      let path = points.length ? `M ${points[0].x} ${points[0].y}` : "";
      const arrows: Geometry["arrows"] = [];
      points.slice(1).forEach((next, index) => {
        const previous = points[index];
        if (Math.abs(previous.y - next.y) < 1) {
          path += ` L ${next.x} ${next.y}`;
          arrows.push({ x: (previous.x + next.x) / 2, y: previous.y, angle: next.x > previous.x ? 0 : 180 });
        } else if (Math.abs(previous.x - next.x) < 1 && getComputedStyle(map).getPropertyValue("--vertical-workflow").trim() === "1") {
          path += ` L ${next.x} ${next.y}`;
          arrows.push({ x: previous.x, y: (previous.y + next.y) / 2, angle: 90 });
        } else {
          const direction = index > 0 && previous.x < points[index - 1].x ? -1 : 1;
          const edge = direction > 0 ? bounds.width - 12 : 12;
          const bend = edge - direction * 12;
          path += ` L ${bend} ${previous.y} Q ${edge} ${previous.y} ${edge} ${previous.y + 12} L ${edge} ${next.y - 12} Q ${edge} ${next.y} ${bend} ${next.y} L ${next.x} ${next.y}`;
          arrows.push({ x: edge, y: (previous.y + next.y) / 2, angle: 90 });
        }
      });
      setGeometry(current => current.path === path && current.width === bounds.width && current.height === bounds.height ? current : { width: bounds.width, height: bounds.height, path, arrows });
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(measure); };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(map);
    map.querySelectorAll("li").forEach(step => observer.observe(step));
    return () => { observer.disconnect(); if (frame !== null) cancelAnimationFrame(frame); };
  }, [steps]);

  return <div ref={timelineRef} className={styles.timeline}>
    <div ref={mapRef} className={styles.map} data-cloud-workflow>
      <svg className={styles.connectors} viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={geometry.path} className={styles.rail} />
        <motion.path d={geometry.path} className={styles.progress} style={{ pathLength: skipMotion ? 1 : progress }} />
        {geometry.arrows.map((arrow, index) => <path key={`${id}-${index}`} d="M -3 -3 L 0 0 L -3 3" transform={`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`} className={styles.arrow} />)}
      </svg>
      <ol className={styles.grid} style={{ "--workflow-columns": columns } as CSSProperties}>
        {steps.map((step, index) => {
          const desktop = cell(index, columns), tablet = cell(index, 2);
          const position = { "--step-column": desktop.column, "--step-row": desktop.row, "--tablet-column": tablet.column, "--tablet-row": tablet.row } as CSSProperties;
          const number = String(index + 1).padStart(2, "0");
          return <li className={styles.step} style={position} key={step.title} data-active={skipMotion || index <= active}>
            <span className={styles.marker} data-workflow-node aria-hidden="true">{number}</span>
            <article data-reveal={`${revealPrefix}-step-${index}`} data-reveal-delay={Math.min(index * 90, 450)}>
              <p className={styles.number}>Step {number}</p>
              <h3>{step.title}</h3>
              <p className={styles.visual}>{step.visual}</p>
              <p className={styles.description}>{step.description}</p>
            </article>
          </li>;
        })}
      </ol>
    </div>
  </div>;
}
