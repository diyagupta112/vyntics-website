"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import styles from "./hero.module.css";

// Where the top edge of the video frame sits inside the smoke canvas, as a fraction of its height.
const EDGE = 1 / 3;

const VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// A narrow stem rises from the top centre, then splits into strands that arc outward over the
// video and fall past its sides, like a canopy of smoke.
const FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uProgress;
  uniform float uAspect;
  varying vec2 vUv;

  const float APEX = 0.2;

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

  // Density of one strand: a gaussian band around a curve that bows out and then drops.
  float strand(float ax, float d, float scale, float phase, float t) {
    float bow = 0.2 * pow(ax, 1.2) + 0.75 * pow(ax, 5.0);
    float slope = 0.24 * pow(ax, 0.2) + 3.75 * pow(ax, 4.0);
    float curve = APEX + scale * bow + 0.01 * sin(ax * 9.0 - t * 1.1 + phase);
    float perp = (d - curve) / sqrt(1.0 + pow(scale * slope / (uAspect * 0.5), 2.0));
    float w = mix(0.018, 0.075, ax) * (0.8 + 0.4 * scale);
    return exp(-pow(perp / w, 2.0));
  }

  void main() {
    float d = 1.0 - vUv.y;
    float x = (vUv.x - 0.5) * 2.0;
    float ax = abs(x);
    float t = uTime;

    vec2 p = vec2((vUv.x - 0.5) * uAspect, d) * 2.2;
    float warp = fbm(p + vec2(0.0, -t * 0.22));
    float dens = fbm(p * 1.4 + warp * 1.6 + vec2(0.0, -t * 0.3));

    // Noise bends the strands so the edges read as smoke, not as drawn lines.
    float dd = d + (warp - 0.5) * 0.07 * (0.4 + ax);

    float strands = strand(ax, dd, 1.0, 0.0, t) * 0.9
                  + strand(ax, dd, 0.78, 2.1, t) * 0.75
                  + strand(ax, dd, 0.56, 4.2, t) * 0.6;
    float halo = exp(-pow((dd - APEX - 0.5 * (0.2 * pow(ax, 1.2) + 0.75 * pow(ax, 5.0))) / 0.16, 2.0)) * 0.28;

    // The stem: thin, bright, and brightest where the strands part.
    float stem = exp(-pow(x / (0.028 + 0.05 * smoothstep(0.1, APEX, d)), 2.0));
    stem *= smoothstep(0.1, 0.17, d) * (1.0 - smoothstep(APEX, APEX + 0.1, d));
    float apexGlow = exp(-pow(length(vec2(x * uAspect * 0.5, d - APEX)) / 0.07, 2.0));

    float shape = strands + halo * smoothstep(0.1, 0.5, ax + 0.2) + stem + apexGlow * 0.6;
    float a = shape * mix(0.35, 1.0, smoothstep(0.25, 0.75, dens));
    a *= 1.0 - smoothstep(0.9, 1.0, ax);
    a *= 1.0 - smoothstep(0.68, 1.0, d);
    a *= mix(1.0, 0.55, uProgress);
    a = clamp(a, 0.0, 0.9);

    vec3 shade = mix(vec3(0.06, 0.18, 0.62), vec3(0.82, 0.9, 1.0), smoothstep(0.4, 1.0, dens * (0.6 + shape * 0.5)));
    gl_FragColor = vec4(shade * a, a);
  }
`;

export function HeroSmoke({ stage }: { stage: RefObject<HTMLDivElement | null> }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    // Phones and reduced-motion users keep the static fog from the stylesheet.
    if (window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 640px)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr: 0.7, webgl: 1 });
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
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      program.uniforms.uAspect.value = width / height;
    };

    let frame = 0;
    let visible = false;
    const start = performance.now();

    const render = (now: number) => {
      frame = window.requestAnimationFrame(render);
      program.uniforms.uTime.value = (now - start) / 1000;
      program.uniforms.uProgress.value = Number(stage.current?.style.getPropertyValue("--p")) || 0;
      renderer.render({ scene: mesh });
    };
    const run = () => {
      if (!frame && visible && !document.hidden) frame = window.requestAnimationFrame(render);
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
    resizeObserver.observe(element);
    document.addEventListener("visibilitychange", onVisibility);
    element.dataset.live = "true";

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      delete element.dataset.live;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [stage]);

  return <div className={styles.smoke} ref={host} aria-hidden="true" />;
}
