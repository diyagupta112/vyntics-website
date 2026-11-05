"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import styles from "./hero.module.css";

// Matches the translateY the frame starts with and loses as it levels out (see .frame in the stylesheet).
const RISE_REM = 3;
const SCALE_MIN = 0.88;
// Entrance timing of the fog, in step with the staggered load in hero.module.css.
const FOG_DELAY_MS = 700;
const FOG_GROW_MS = 3200;

const VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fog that hangs from the top of the hero, falls behind the headline in soft vertical streaks, and
// narrows to the width of the video frame where it lands on the frame's top edge.
const FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uProgress;
  uniform float uAspect;
  uniform float uTop;
  uniform float uHalf;
  uniform float uCalm;
  uniform float uReveal;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(7.1, 3.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float d = 1.0 - vUv.y;
    float x = (vUv.x - 0.5) * 2.0;
    float ax = abs(x);
    float t = uTime;
    float px = x * uAspect * 0.5;

    // Funnel: the full width at the top of the page, narrowing to the frame at its top edge.
    float k = clamp(d / max(uTop, 0.001), 0.0, 1.0);
    float hw = mix(1.0, uHalf, pow(k, 0.85));
    float inside = 1.0 - smoothstep(hw * 0.5, hw * 1.08, ax);

    // Streaks stretched along the fall direction, bent by a slow warp.
    float warp = fbm(vec2(px * 1.6, d * 0.9 - t * 0.12));
    float n = fbm(vec2(px * 4.2 + warp * 1.2, d * 1.1 - t * 0.3));
    float fine = noise(vec2(px * 11.0, d * 2.0 - t * 0.55));
    float dens = smoothstep(0.2, 0.68, n * 0.78 + fine * 0.3);

    // Light behind the headline, stronger as it closes in on the video.
    float level = mix(0.45, 1.0, smoothstep(0.3 * uTop, uTop, d));
    float landing = 1.0 - smoothstep(uTop, uTop + 0.07, d);
    float a = inside * dens * level * landing;

    // A soft glow where the fog meets the top edge of the frame.
    float g = (d - uTop) / 0.025;
    float edge = exp(-g * g) * (1.0 - smoothstep(uHalf * 0.85, uHalf * 1.05, ax));
    a += edge * 0.4 * (0.5 + dens);

    // Entrance: the fog fades up and its leading edge travels down from the top of the page.
    float front = uReveal * (uTop + 0.4);
    a *= (1.0 - smoothstep(front - 0.22, front, d)) * smoothstep(0.0, 0.3, uReveal);

    // Thins as the frame settles, and again while the video plays.
    a *= mix(1.0, 0.35, uProgress);
    a *= mix(1.0, 0.45, uCalm);
    a = clamp(a, 0.0, 0.9);

    vec3 shade = mix(vec3(0.09, 0.26, 0.8), vec3(0.8, 0.89, 1.0), smoothstep(0.35, 0.95, dens * level + edge));
    gl_FragColor = vec4(shade * a, a);
  }
`;

export function HeroSmoke() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    const hero = element?.parentElement;
    const stage = hero?.querySelector<HTMLElement>("[data-hero-stage]");
    if (!element || !hero || !stage) return;
    // Phones and reduced-motion users keep the static fog from the stylesheet.
    if (window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 640px)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr: 0.5, webgl: 1 });
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    element.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uAspect: { value: 1 },
        uTop: { value: 0.5 },
        uHalf: { value: 0.7 },
        uCalm: { value: 0 },
        uReveal: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    // Layout of the frame inside the hero, measured on resize; the rise and scale are applied per frame.
    let baseTop = 0;
    let heroWidth = 1;
    let heroHeight = 1;
    let stageWidth = 1;
    let risePx = 0;

    const resize = () => {
      const heroRect = hero.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      if (!heroRect.width || !heroRect.height) return;
      heroWidth = heroRect.width;
      heroHeight = heroRect.height;
      stageWidth = stageRect.width;
      baseTop = stageRect.top - heroRect.top;
      risePx = RISE_REM * parseFloat(getComputedStyle(document.documentElement).fontSize);
      renderer.setSize(heroWidth, heroHeight);
      program.uniforms.uAspect.value = heroWidth / heroHeight;
    };

    let frame = 0;
    let visible = false;
    // The fog slows and dims once the intro hands over to the video, so it does not compete with it.
    let calm = 0;
    let clock = 0;
    let last = performance.now();
    // The fog starts after the headline and frame have begun to rise, then grows in from the top.
    const born = performance.now();

    const render = (now: number) => {
      frame = window.requestAnimationFrame(render);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const progress = Number(stage.style.getPropertyValue("--p")) || 0;
      calm += ((stage.dataset.phase === "video" ? 1 : 0) - calm) * Math.min(1, dt * 1.5);
      clock += dt * (1 - 0.7 * calm);
      program.uniforms.uTime.value = clock;
      program.uniforms.uCalm.value = calm;
      const reveal = Math.min(1, Math.max(0, (now - born - FOG_DELAY_MS) / FOG_GROW_MS));
      program.uniforms.uReveal.value = 1 - Math.pow(1 - reveal, 3);
      program.uniforms.uProgress.value = progress;
      program.uniforms.uTop.value = (baseTop + (1 - progress) * risePx) / heroHeight;
      program.uniforms.uHalf.value = (stageWidth * (SCALE_MIN + (1 - SCALE_MIN) * progress)) / heroWidth;
      renderer.render({ scene: mesh });
    };
    const run = () => {
      if (!frame && visible && !document.hidden) {
        last = performance.now();
        frame = window.requestAnimationFrame(render);
      }
    };
    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) run();
      else stop();
    });
    const resizeObserver = new ResizeObserver(resize);
    const onVisibility = () => (document.hidden ? stop() : run());

    resize();
    observer.observe(element);
    resizeObserver.observe(hero);
    resizeObserver.observe(stage);
    // The frame slides in on load; measure again once it has settled in place.
    stage.addEventListener("animationend", resize);
    document.addEventListener("visibilitychange", onVisibility);
    element.dataset.live = "true";

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      stage.removeEventListener("animationend", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      delete element.dataset.live;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, []);

  return <div className={styles.smoke} ref={host} aria-hidden="true" />;
}
