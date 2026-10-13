"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export function DataHeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const player = video.current;
      if (!player) return;
      player.autoplay = !preference.matches;
      if (preference.matches) player.pause();
      else void player.play().catch(() => setPaused(true));
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return <>
    <video ref={video} className={styles.heroVideo} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} onPlay={() => setPaused(false)} onPause={() => setPaused(true)}>
      <source src="/images/services/videos/data-engineering.mp4" type="video/mp4" />
    </video>
    <button className={styles.videoControl} type="button" onClick={() => {
      if (video.current?.paused) void video.current.play().catch(() => setPaused(true));
      else video.current?.pause();
    }}>{paused ? "Play background video" : "Pause background video"}</button>
  </>;
}
