"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { RecognitionUpdate } from "@/content/recognitions-updates";
import styles from "./stacking-feed.module.css";
import surface from "./recognition-card-surface.module.css";

function subscribeMotion(listener: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function subscribeVisibility(listener: () => void) {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
}
const tabHidden = () => document.hidden;
const serverSnapshot = () => false;

type Entry = { key: number; index: number; exiting: boolean };

function Thumbnail({ item, semantic = false }: { item: RecognitionUpdate; semantic?: boolean }) {
  return <span className={`${styles.thumbnail} ${item.type === "testimonial" && !item.image ? styles.avatar : ""}`}>
    {item.image ? <Image src={item.image} alt={semantic ? item.imageAlt ?? "" : ""} width={72} height={72} loading="eager" unoptimized />
      : item.type === "testimonial" ? <span aria-hidden="true">{item.initials ?? ""}</span>
      : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4v6c0 4-8 8-8 8s-8-4-8-8V7l8-4Zm-4 9 3 3 5-6" /></svg>}
  </span>;
}

function PixelReveal({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<{ columns: number; delays: number[] } | null>(null);
  // Independent of rotation pause: always settle, even if animationend is missed.
  useEffect(() => {
    const safety = window.setTimeout(onComplete, 800);
    return () => window.clearTimeout(safety);
  }, [onComplete]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      const columns = Math.ceil(width / 12);
      const count = columns * Math.ceil(height / 12);
      setGrid({ columns, delays: Array.from({ length: count }, (_, index) => index === count - 1 ? 450 : Math.random() * 450) });
      observer.disconnect();
    });
    observer.observe(overlay);
    return () => observer.disconnect();
  }, []);

  return <div ref={overlayRef} className={styles.pixelOverlay} aria-hidden="true" data-ready={!!grid}
    style={grid ? { gridTemplateColumns: `repeat(${grid.columns}, 12px)` } : undefined}>
    {grid?.delays.map((delay, index) => <span key={index} className={styles.pixelCell}
      style={{ animationDelay: `${delay}ms` }}
      onAnimationEnd={index === grid.delays.length - 1 ? onComplete : undefined} />)}
  </div>;
}

function Tile({ item, revealing = false }: { item: RecognitionUpdate; revealing?: boolean }) {
  return <div className={`${styles.tile} ${surface.surface}`} data-revealing={revealing}>
    {item.gradient && <div className={styles.gradient} aria-hidden="true" style={{ backgroundImage: `url("${item.gradient.src}")`, transform: item.gradient.transform }} />}
    <Thumbnail item={item} />
    <div className={styles.copy}>
      <p className={styles.title}>{item.title}</p>
      <p className={`${styles.detail} ${item.type === "badge" ? styles.badgeDetail : ""}`}>{item.detail}</p>
      <p className={styles.meta}><span>{item.tag}</span></p>
    </div>
  </div>;
}

function EnteringTile({ item, reduceMotion }: { item: RecognitionUpdate; reduceMotion: boolean }) {
  const [revealing, setRevealing] = useState(true);
  const completeReveal = useCallback(() => setRevealing(false), []);
  return <div className={styles.entrance}>
    <Tile item={item} revealing={!reduceMotion && revealing} />
    {!reduceMotion && revealing && <PixelReveal onComplete={completeReveal} />}
  </div>;
}

export function StackingFeed({ items }: { items: readonly RecognitionUpdate[] }) {
  const reduceMotion = useSyncExternalStore(subscribeMotion, reducedMotion, serverSnapshot);
  const hidden = useSyncExternalStore(subscribeVisibility, tabHidden, serverSnapshot);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [queue, setQueue] = useState<{ entries: Entry[]; cursor: number; serial: number }>({ entries: [], cursor: 0, serial: 0 });
  const stopped = hovered || focused || hidden || reduceMotion;
  const hasPaused = useRef(false);

  useEffect(() => {
    if (stopped) { hasPaused.current = true; return; }
    if (items.length === 0) return;
    const delay = queue.serial === 0 && !hasPaused.current ? 100 : 2500;
    const advance = () => setQueue(previous => {
      const entries = [{ key: previous.serial, index: previous.cursor % items.length, exiting: false }, ...previous.entries.filter(entry => !entry.exiting)];
      return {
        entries: entries.map((entry, index) => ({ ...entry, exiting: entries.length > 3 && index === entries.length - 1 })),
        cursor: (previous.cursor + 1) % items.length,
        serial: previous.serial + 1,
      };
    });
    // Pause cancels only the next step. Every resume waits a full interval.
    const next = window.setTimeout(advance, delay);
    return () => window.clearTimeout(next);
  }, [stopped, items.length, queue.serial]);

  useEffect(() => {
    if (!queue.entries.some(entry => entry.exiting)) return;
    // Let slot movement and fading finish regardless of hover/focus/pause.
    const cleanup = window.setTimeout(() => setQueue(previous => ({
      ...previous, entries: previous.entries.filter(entry => !entry.exiting),
    })), 500);
    return () => window.clearTimeout(cleanup);
  }, [queue.entries]);

  if (items.length === 0) return null;

  return <div className={styles.feed} role="region" aria-label="Vyntics recognition updates"
    data-paused={stopped}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <ul className={styles.srOnly}>
      {items.map(item => <li key={item.id}>
        {item.image && <Thumbnail item={item} semantic />}
        {item.type === "testimonial" ? <figure><blockquote>{item.fullText ?? item.title}</blockquote><figcaption>{item.name && item.fullRole ? `${item.name}, ${item.fullRole}` : item.detail}</figcaption></figure>
          : <><p>{item.title}</p><p>{item.detail}</p></>}
        <p>{item.tag}</p>
      </li>)}
    </ul>
    <div className={styles.viewport} id="recognition-updates" aria-hidden="true">
      <div className={styles.animated}>
        {queue.entries.map((entry, index) => <div key={entry.key} className={styles.slot} data-exiting={entry.exiting}
          style={{ "--slot": index } as CSSProperties}>
          <EnteringTile item={items[entry.index % items.length]} reduceMotion={reduceMotion} />
        </div>)}
      </div>
      <div className={styles.staticStack}>
        {items.slice(0, 3).map(item => <Tile item={item} key={item.id} />)}
      </div>
    </div>
  </div>;
}
