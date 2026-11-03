"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import styles from "./hero.module.css";

// The canvas is laid out against the video stage in CSS: it spans 130% of the stage width and
// 140% of its height, starting 30% of the height above it. These constants mirror that layout so
// the shader can line the smoke up with the frame.
const CANVAS_WIDTH = 1.3;
const CANVAS_HEIGHT = 1.4;
const EDGE = 0.3 / CANVAS_HEIGHT;
const FRAME_SPAN = 1 / CANVAS_HEIGHT;
// The frame scales from 0.88 to 1 as it levels out (see .frame in the stylesheet).
const SCALE_MIN = 0.88;

const VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// A thin stem falls from the top centre and opens into a dome whose rim lands on the frame's top
// corners, then a curtain of vertical smoke pours down over the face of the video.
const FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uProgress;
  uniform float uAspect;
  uniform float uEdge;
  uniform float uSpan;
  uniform float uHalf;
  varying vec2 vUv;

  const float APEX = 0.15;

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

  // One rim strand: a band around a curve running from the apex to the frame's top corner.
  float rim(float ax, float d, float drop, float phase, float t) {
    float u = clamp(ax / uHalf, 0.0, 1.0);
    float curve = APEX + (uEdge - APEX + drop) * pow(u, 1.5) + 0.006 * sin(ax * 10.0 - t * 1.2 + phase);
    float slope = 1.5 * (uEdge - APEX + drop) * pow(u, 0.5) / uHalf / (uAspect * 0.5);
    float perp = (d - curve) / sqrt(1.0 + slope * slope);
    float w = mix(0.012, 0.03, u);
    return exp(-pow(perp / w, 2.0)) * (1.0 - smoothstep(0.0, 0.02, ax - uHalf));
  }

  // A thin drip hanging past the corner of the frame.
  float drip(float ax, float d, float offset, float length) {
    float x = ax - uHalf * (1.0 + offset);
    float run = smoothstep(uEdge - 0.01, uEdge + 0.02, d) * (1.0 - smoothstep(uEdge + length * 0.5, uEdge + length, d));
    return exp(-pow(x * uAspect * 0.5 / 0.008, 2.0)) * run;
  }

  void main() {
    float d = 1.0 - vUv.y;
    float x = (vUv.x - 0.5) * 2.0;
    float ax = abs(x);
    float t = uTime;

    vec2 p = vec2((vUv.x - 0.5) * uAspect, d) * 2.2;
    float warp = fbm(p + vec2(0.0, -t * 0.22));
    float dens = fbm(p * 1.4 + warp * 1.6 + vec2(0.0, -t * 0.3));
    float dd = d + (warp - 0.5) * 0.03;

    float rims = rim(ax, dd, 0.0, 0.0, t) * 0.9
               + rim(ax, dd, 0.035, 2.1, t) * 0.7
               + rim(ax, dd, 0.07, 4.2, t) * 0.5;
    float drips = drip(ax, d, 0.025, 0.2 * uSpan) + drip(ax, d, 0.07, 0.34 * uSpan) * 0.8;

    // Curtain: opens from the stem to the frame's width at its top edge, then pours down the face.
    float reach = mix(0.035, uHalf * 0.98, smoothstep(APEX, uEdge, d));
    float inside = 1.0 - smoothstep(reach * 0.7, reach * 1.05, ax);
    float fall = smoothstep(APEX, APEX + 0.06, d) * (1.0 - smoothstep(uEdge + uSpan * 0.18, uEdge + uSpan * 0.55, d));
    float streak = fbm(vec2(x * uAspect * 2.6, d * 0.8 - t * 0.5)) * 0.7 + noise(vec2(x * uAspect * 7.0, d * 1.4 - t * 0.9)) * 0.5;
    float curtain = inside * fall * smoothstep(0.32, 0.85, streak) * 0.75;
    curtain *= 1.0 + 0.7 * exp(-pow((d - uEdge) / 0.035, 2.0));

    // The stem, brightest where it opens.
    float stem = exp(-pow(x * uAspect * 0.5 / (0.012 + 0.02 * smoothstep(0.06, APEX, d)), 2.0));
    stem *= smoothstep(0.07, 0.11, d) * (1.0 - smoothstep(APEX, APEX + 0.05, d));
    float apexGlow = exp(-pow(length(vec2(x * uAspect * 0.5, d - APEX)) / 0.045, 2.0));

    float shape = rims + drips + curtain + stem + apexGlow * 0.5;
    float a = shape * mix(0.4, 1.0, smoothstep(0.25, 0.75, dens));
    a *= 1.0 - smoothstep(0.93, 1.0, ax);
    a *= mix(1.0, 0.55, uProgress);
    a = clamp(a, 0.0, 0.85);

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
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr: 0.6, webgl: 1 });
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
        uEdge: { value: EDGE },
        uSpan: { value: FRAME_SPAN },
        uHalf: { value: SCALE_MIN / CANVAS_WIDTH },
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
      const progress = Number(stage.current?.style.getPropertyValue("--p")) || 0;
      program.uniforms.uTime.value = (now - start) / 1000;
      program.uniforms.uProgress.value = progress;
      // Follow the frame as it scales up while it levels out.
      program.uniforms.uHalf.value = (SCALE_MIN + (1 - SCALE_MIN) * progress) / CANVAS_WIDTH;
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
