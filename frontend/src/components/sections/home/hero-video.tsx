"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HeroIntro } from "./hero-intro";
import styles from "./hero.module.css";

const POSTER = "/chatbot-product-poster.jpg";

// Matches the staggered entrance in hero.module.css (headline, intro line, button, then the frame).
const ENTRANCE_MS = 2000;

function Sources() {
  return (
    <>
      <source src="/chatbot-product.webm" type="video/webm" />
      <source src="/chatbot-product.mp4" type="video/mp4" />
    </>
  );
}

export function HeroVideo() {
  const stage = useRef<HTMLDivElement>(null);
  const loop = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const full = useRef<HTMLVideoElement>(null);
  const inView = useRef(false);
  const phaseRef = useRef<"intro" | "video">("intro");
  const [phase, setPhase] = useState<"intro" | "video">("intro");
  const [watching, setWatching] = useState(false);

  const finishIntro = useCallback(() => setPhase("video"), []);

  useEffect(() => {
    const element = stage.current;
    const video = loop.current;
    if (!element || !video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.style.setProperty("--p", "1");
      setPhase("video");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const top = element.getBoundingClientRect().top;
      const height = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (height * 0.7 - top) / (height * 0.6)));
      element.style.setProperty("--p", progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    // Play only while at least half of the video is on screen; pause as it scrolls away and resume
    // when it returns. The intro and the sound dialog also hold it paused.
    // The intro waits for the load sequence (headline, button, frame) to finish before it starts.
    let entranceDone = false;
    const entranceTimer = window.setTimeout(() => {
      entranceDone = true;
      if (inView.current) setWatching(true);
    }, ENTRANCE_MS);
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      setWatching(entry.isIntersecting && entranceDone);
      if (inView.current && phaseRef.current === "video" && !dialog.current?.open) void video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.5 });

    observer.observe(element);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.clearTimeout(entranceTimer);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // When the intro hands over, start the video if it is on screen.
  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "video" && inView.current && !dialog.current?.open) void loop.current?.play().catch(() => {});
  }, [phase]);

  const open = () => {
    loop.current?.pause();
    dialog.current?.showModal();
    if (full.current) {
      full.current.currentTime = 0;
      void full.current.play().catch(() => {});
    }
  };

  const close = () => {
    full.current?.pause();
    if (inView.current && phaseRef.current === "video") void loop.current?.play().catch(() => {});
  };

  return (
    <div className={styles.videoWrap}>
      <div className={styles.stage} ref={stage} data-hero-stage data-phase={phase}>
        <div className={styles.frame}>
          <video
            ref={loop}
            className={styles.video}
            poster={POSTER}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Walkthrough of how the Vyntics compliance chatbot answers a question"
          >
            <Sources />
          </video>

          <div className={styles.introLayer} data-done={phase === "video"}>
            <HeroIntro run={watching && phase === "intro"} onDone={finishIntro} />
            <button className={styles.skip} type="button" onClick={finishIntro}>
              Skip intro
            </button>
          </div>
        </div>
      </div>

      <button className={styles.sound} type="button" onClick={open}>
        <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
        Play with sound
      </button>

      <p className={styles.caption}>
        Example of our work: a compliance chatbot that answers from your own documents and cites the source. Vyntics
        delivers custom AI, data engineering, analytics, cloud, and CRM solutions.
      </p>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label="Product walkthrough video"
        onClose={close}
        onClick={(event) => { if (event.target === dialog.current) dialog.current?.close(); }}
      >
        <button className={styles.dialogClose} type="button" aria-label="Close video" onClick={() => dialog.current?.close()}>
          <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <video ref={full} className={styles.fullVideo} poster={POSTER} controls playsInline preload="none">
          <Sources />
        </video>
      </dialog>
    </div>
  );
}
