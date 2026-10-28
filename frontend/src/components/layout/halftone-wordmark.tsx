"use client";

import { useEffect, useRef } from "react";

type HalftoneWordmarkProps = {
  text: string;
  /** Fraction of the cap height that hangs below the bottom edge. */
  crop?: number;
};

const INK: [number, number, number] = [255, 255, 255];
const WARM: [number, number, number] = [96, 165, 250];

/** Area-true dot radius for a cell coverage in [0, 1]. */
const dotRadius = (coverage: number, gap: number) => Math.sqrt(Math.min(1, Math.max(0, coverage))) * gap * 0.56;

/**
 * Draws the word as a field of halftone dots that part around the pointer and
 * spring home. Pointer input is read from the enclosing footer, so the
 * decorative layer itself can stay behind the footer content.
 */
export function HalftoneWordmark({ text, crop = 0.15 }: HalftoneWordmarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const host = canvas?.closest("footer");
    if (!canvas || !ctx || !host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 1;
    let h = 1;
    let dpr = 1;
    let px = -1e5;
    let py = -1e5;
    let raf = 0;
    let visible = true;
    let awake = true;
    let ring = { x: 0, y: 0, t: -1 };
    let dots = new Float32Array(0); // x, y, vx, vy, hx, hy, r per dot
    let count = 0;
    let rem = 16;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      const mask = document.createElement("canvas");
      mask.width = w;
      mask.height = h;
      const m = mask.getContext("2d", { willReadFrequently: true });
      if (!m) return;
      const family = getComputedStyle(canvas).fontFamily;
      m.font = `800 100px ${family}`;
      const measured = m.measureText(text).width;
      const size = measured > 0 ? (w / measured) * 100 : 0;
      m.font = `800 ${size}px ${family}`;
      const box = m.measureText(text);
      const cap = box.actualBoundingBoxAscent || size * 0.72;
      m.fillStyle = "#000";
      m.textBaseline = "alphabetic";
      m.fillText(text, (w - box.width) / 2, h + cap * crop);
      const img = m.getImageData(0, 0, w, h).data;

      const gap = Math.max(3, Math.round(rem * 0.375));
      const cols = Math.ceil(w / gap);
      const rows = Math.ceil(h / gap);
      const tmp: number[] = [];
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          let sum = 0;
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const x = Math.min(w - 1, Math.floor(gx * gap + ((sx + 0.5) * gap) / 3));
              const y = Math.min(h - 1, Math.floor(gy * gap + ((sy + 0.5) * gap) / 3));
              sum += img[(y * w + x) * 4 + 3];
            }
          }
          const coverage = sum / (9 * 255);
          if (coverage < 0.06) continue;
          const hx = gx * gap + gap / 2;
          const hy = gy * gap + gap / 2;
          tmp.push(hx, hy, 0, 0, hx, hy, dotRadius(coverage, gap));
        }
      }
      dots = new Float32Array(tmp);
      count = tmp.length / 7;
      awake = true;
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const pushRadius = reduced ? 0 : rem * 5;
      const ringAge = ring.t < 0 ? 1e9 : now - ring.t;
      const ringR = ringAge * 0.9;
      let moving = false;
      for (let i = 0; i < count; i++) {
        const j = i * 7;
        let x = dots[j];
        let y = dots[j + 1];
        let vx = dots[j + 2];
        let vy = dots[j + 3];
        const hx = dots[j + 4];
        const hy = dots[j + 5];
        if (!reduced) {
          if (ringAge < 900) {
            const dx = hx - ring.x;
            const dy = hy - ring.y;
            const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const band = 1 - Math.min(1, Math.abs(d - ringR) / 26);
            if (band > 0) {
              const f = band * 3.2 * (1 - ringAge / 900);
              vx += (dx / d) * f;
              vy += (dy / d) * f;
            }
          }
          const dx = x - px;
          const dy = y - py;
          const d2 = dx * dx + dy * dy;
          if (pushRadius > 0 && d2 < pushRadius * pushRadius) {
            const d = Math.sqrt(d2) + 0.001;
            const f = (1 - d / pushRadius) * 2.6;
            vx += (dx / d) * f;
            vy += (dy / d) * f;
          }
          vx = (vx + (hx - x) * 0.05) * 0.84;
          vy = (vy + (hy - y) * 0.05) * 0.84;
          x += vx;
          y += vy;
          if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) moving = true;
          else {
            x = hx;
            y = hy;
            vx = 0;
            vy = 0;
          }
          dots[j] = x;
          dots[j + 1] = y;
          dots[j + 2] = vx;
          dots[j + 3] = vy;
        }
        const warmth = Math.min(1, Math.hypot(x - hx, y - hy) / 28);
        const r = Math.round(INK[0] + (WARM[0] - INK[0]) * warmth);
        const g = Math.round(INK[1] + (WARM[1] - INK[1]) * warmth);
        const b = Math.round(INK[2] + (WARM[2] - INK[2]) * warmth);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.14 + warmth * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, dots[j + 6], 0, 6.2832);
        ctx.fill();
      }
      awake = moving || ringAge < 900 || px > -1e4;
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      draw(now);
      if (awake) raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      awake = true;
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const local = (event: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      return [event.clientX - b.left, event.clientY - b.top];
    };
    const onMove = (event: PointerEvent) => {
      [px, py] = local(event);
      wake();
    };
    const onLeave = () => {
      px = -1e5;
      py = -1e5;
      wake();
    };
    const onDown = (event: PointerEvent) => {
      if (reduced || (event.target as HTMLElement).closest("a,button")) return;
      const [x, y] = local(event);
      ring = { x, y, t: performance.now() };
      wake();
    };

    layout();
    draw(performance.now());
    wake();

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    const resize = new ResizeObserver(() => {
      layout();
      wake();
    });
    resize.observe(canvas);
    const intersect = new IntersectionObserver((entries) => {
      visible = entries[0] ? entries[0].isIntersecting : true;
      if (visible) wake();
    });
    intersect.observe(canvas);
    let alive = true;
    // Re-set the word once the web font has loaded.
    void document.fonts?.ready.then(() => {
      if (!alive) return;
      layout();
      wake();
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resize.disconnect();
      intersect.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    };
  }, [text, crop]);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} />;
}
