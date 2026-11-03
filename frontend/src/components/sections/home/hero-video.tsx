"use client";

import { useEffect, useRef } from "react";
import styles from "./hero.module.css";

const POSTER = "/chatbot-product-poster.jpg";

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

  useEffect(() => {
    const element = stage.current;
    const video = loop.current;
    if (!element || !video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.style.setProperty("--p", "1");
      video.pause();
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
    // when it returns. The sound dialog also holds it paused.
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      if (inView.current && !dialog.current?.open) void video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.5 });

    observer.observe(element);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

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
    if (inView.current) void loop.current?.play().catch(() => {});
  };

  return (
    <div className={styles.videoWrap}>
      <div className={styles.stage} ref={stage} data-hero-stage>
        <div className={styles.frame}>
          <video
            ref={loop}
            className={styles.video}
            poster={POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Walkthrough of how the Vyntics AI assistant answers a question"
          >
            <Sources />
          </video>
        </div>
      </div>

      <button className={styles.sound} type="button" onClick={open}>
        <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
        Play with sound
      </button>

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
