"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.css";

// Title sequence that plays inside the frame before the walkthrough video: three slow push-in scenes.
const SCENES = [
  { duration: 1800 },
  { duration: 2600 },
  { duration: 2200 },
];
const END = SCENES.reduce((total, scene) => total + scene.duration, 0);

export function HeroIntro({ run, onDone }: { run: boolean; onDone: () => void }) {
  const [scene, setScene] = useState(0);
  const elapsed = useRef(0);

  useEffect(() => {
    if (!run) return;
    // Continue from where a pause left off.
    const began = performance.now() - elapsed.current;
    const timer = window.setInterval(() => {
      const now = performance.now() - began;
      elapsed.current = now;
      setScene(now < SCENES[0].duration ? 0 : now < SCENES[0].duration + SCENES[1].duration ? 1 : 2);
      if (now >= END) {
        window.clearInterval(timer);
        onDone();
      }
    }, 40);
    return () => window.clearInterval(timer);
  }, [run, onDone]);

  return (
    <div className={styles.cine} data-run={run} aria-hidden="true">
      <span className={styles.cineLight} />
      <span className={`${styles.cineBar} ${styles.cineBarTop}`} />
      <span className={`${styles.cineBar} ${styles.cineBarBottom}`} />

      {scene === 0 && (
        <div className={styles.cineScene} style={{ animationDuration: `${SCENES[0].duration + 400}ms` }}>
          <p className={styles.cineKicker}>Presenting</p>
        </div>
      )}

      {scene === 1 && (
        <div className={styles.cineScene} style={{ animationDuration: `${SCENES[1].duration + 400}ms` }}>
          <span className={styles.cineMark} />
          <p className={styles.cineTitle}>Vyntics AI Chatbot</p>
          <p className={styles.cineSub}>Answers from your own documents, with a source for every response</p>
        </div>
      )}

      {scene === 2 && (
        <div className={styles.cineScene} style={{ animationDuration: `${SCENES[2].duration + 400}ms` }}>
          <p className={styles.cineTitle}>How it works</p>
          <p className={styles.cineSub}>Demo: financial aid compliance</p>
        </div>
      )}
    </div>
  );
}
