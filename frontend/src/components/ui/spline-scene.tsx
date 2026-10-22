"use client";

import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./spline-scene.module.css";

// The scene has its own intro animation; keep the canvas hidden while it plays.
const SCENE_INTRO_MS = 2500;

const Spline = lazy(() => import("@splinetool/react-spline"));

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Dark interactive hero: content on one side, Spline stage on the other, spotlight over both. Pointer events reach the canvas untouched. */
export function SplineScene({
  scene,
  className = "",
  children,
}: {
  scene: string;
  className?: string;
  children?: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Spline only listens on its own canvas. Hand it pointer movement from the rest of the page so the scene tracks the cursor everywhere.
  useEffect(() => {
    function forward(event: PointerEvent) {
      const canvas = frameRef.current?.querySelector("canvas");
      if (!canvas || canvas.contains(event.target as Node)) return;
      const init = { bubbles: true, clientX: event.clientX, clientY: event.clientY };
      canvas.dispatchEvent(new PointerEvent("pointermove", init));
      canvas.dispatchEvent(new MouseEvent("mousemove", init));
    }
    window.addEventListener("pointermove", forward, { passive: true });
    return () => window.removeEventListener("pointermove", forward);
  }, []);

  function track(event: React.PointerEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    frame.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    frame.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={frameRef}
      className={`${styles.frame} ${className}`.trim()}
      onPointerMove={track}
      onPointerEnter={track}
    >
      <div className={styles.content}>{children}</div>
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.placeholder} data-hidden={loaded} />
        <div className={styles.canvas} data-loaded={loaded}>
          <SceneBoundary>
            <Suspense fallback={null}>
              <Spline scene={scene} onLoad={() => window.setTimeout(() => setLoaded(true), SCENE_INTRO_MS)} />
            </Suspense>
          </SceneBoundary>
        </div>
      </div>
      <div className={styles.spotlight} />
    </div>
  );
}
