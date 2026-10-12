"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import {
  siApacheairflow,
  siApachekafka,
  siApachespark,
  siCss,
  siDatabricks,
  siDjango,
  siDocker,
  siFastapi,
  siGithub,
  siGithubactions,
  siGooglecloud,
  siGrafana,
  siHtml5,
  siJavascript,
  siKubernetes,
  siLangchain,
  siMongodb,
  siMysql,
  siN8n,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPandas,
  siPrometheus,
  siPytorch,
  siPython,
  siQdrant,
  siReact,
  siRedis,
  siSnowflake,
  siSass,
  siTailwindcss,
  siTerraform,
  siTensorflow,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";
import styles from "./technology-orb.module.css";

const technologies: readonly SimpleIcon[] = [
  siPython,
  siTypescript,
  siJavascript,
  siReact,
  siNextdotjs,
  siNodedotjs,
  siFastapi,
  siPostgresql,
  siRedis,
  siDocker,
  siKubernetes,
  siTerraform,
  siGooglecloud,
  siSnowflake,
  siDatabricks,
  siApachespark,
  siApacheairflow,
  siApachekafka,
  siGithub,
  siGithubactions,
  siLangchain,
  siQdrant,
  siN8n,
  siGrafana,
  siPrometheus,
  siHtml5,
  siCss,
  siTailwindcss,
  siSass,
  siDjango,
  siPandas,
  siTensorflow,
  siPytorch,
  siMongodb,
  siMysql,
];

const plateCount = 88;
const goldenAngle = Math.PI * (3 - Math.sqrt(5));

type SpherePoint = { x: number; y: number; z: number };

function createSpherePoints(): SpherePoint[] {
  return Array.from({ length: plateCount }, (_, index) => {
    const y = 1 - (index / (plateCount - 1)) * 2;
    const radialDistance = Math.sqrt(1 - y * y);
    const angle = goldenAngle * index;

    return {
      x: Math.cos(angle) * radialDistance,
      y,
      z: Math.sin(angle) * radialDistance,
    };
  });
}

const spherePoints = createSpherePoints();

export function TechnologyOrb() {
  const stageRef = useRef<HTMLDivElement>(null);
  const plateRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rotationRef = useRef({ x: -0.12, y: 0.2 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const hoveredPlateRef = useRef<number | null>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastFrame = performance.now();
    let visible = true;
    let scatterProgress = 0;
    let scatterAnchor: number | null = null;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0.05 });

    observer.observe(stage);

    const render = (now: number) => {
      const delta = Math.min((now - lastFrame) / 16.67, 2.5);
      lastFrame = now;

      if (visible) {
        const rotation = rotationRef.current;
        const velocity = velocityRef.current;
        const hoveredPlate = hoveredPlateRef.current;
        const scatterTarget = hoveredPlate === null ? 0 : 1;

        if (hoveredPlate !== null) scatterAnchor = hoveredPlate;
        scatterProgress += (scatterTarget - scatterProgress) * Math.min(0.18 * delta, 1);
        if (scatterTarget === 0 && scatterProgress < 0.002) scatterAnchor = null;

        if (!dragRef.current.active) {
          rotation.y += velocity.y * delta;
          rotation.x += velocity.x * delta;
          velocity.y *= 0.94;
          velocity.x *= 0.94;

          if (!reduceMotion.matches && hoveredPlate === null) rotation.y += 0.00165 * delta;
        }

        rotation.x = Math.max(-0.85, Math.min(0.85, rotation.x));

        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const radius = stage.clientWidth * 0.39;

        spherePoints.forEach((point, index) => {
          const plate = plateRefs.current[index];
          if (!plate) return;

          const xAfterY = point.x * cosY + point.z * sinY;
          const zAfterY = -point.x * sinY + point.z * cosY;
          const yAfterX = point.y * cosX - zAfterY * sinX;
          const zAfterX = point.y * sinX + zAfterY * cosX;
          const depth = (zAfterX + 1) / 2;
          const perspectiveScale = 0.62 + depth * 0.56;
          const shouldScatter = scatterAnchor !== null && scatterAnchor !== index;
          const projectedDistance = Math.hypot(xAfterY, yAfterX);
          const fallbackAngle = goldenAngle * index;
          const directionX = projectedDistance > 0.08 ? xAfterY / projectedDistance : Math.cos(fallbackAngle);
          const directionY = projectedDistance > 0.08 ? yAfterX / projectedDistance : Math.sin(fallbackAngle);
          const scatterDistance = radius * (0.05 + (index % 5) * 0.006) * scatterProgress;
          const scatterX = shouldScatter ? directionX * scatterDistance : 0;
          const scatterY = shouldScatter ? directionY * scatterDistance : 0;
          const opacity = (0.55 + depth * 0.45) * (shouldScatter ? 1 - scatterProgress * 0.36 : 1);
          const rotateY = xAfterY * 34;
          const rotateX = -yAfterX * 30;

          const transform = [
            "translate(-50%, -50%)",
            `translate3d(${(xAfterY * radius + scatterX).toFixed(2)}px, ${(yAfterX * radius + scatterY).toFixed(2)}px, 0)`,
            `rotateY(${rotateY.toFixed(2)}deg)`,
            `rotateX(${rotateX.toFixed(2)}deg)`,
            `scale(${perspectiveScale.toFixed(3)})`,
          ].join(" ");

          const zIndex = hoveredPlate === index ? 200 : Math.round(depth * 100);

          plate.style.cssText = `--plate-opacity:${opacity.toFixed(3)};z-index:${zIndex};transform:${transform}`;
        });
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
    velocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;

    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    const nextVelocity = { x: deltaY * 0.00042, y: deltaX * 0.00055 };

    rotationRef.current.x += deltaY * 0.0045;
    rotationRef.current.y += deltaX * 0.0055;
    velocityRef.current = nextVelocity;
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current.active = false;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const movement = 0.14;

    if (event.key === "ArrowLeft") rotationRef.current.y -= movement;
    else if (event.key === "ArrowRight") rotationRef.current.y += movement;
    else if (event.key === "ArrowUp") rotationRef.current.x -= movement;
    else if (event.key === "ArrowDown") rotationRef.current.x += movement;
    else return;

    event.preventDefault();
  };

  return (
    <div className={styles.orbShell}>
      <div className={styles.orbBackdrop} aria-hidden="true" />
      <div
        ref={stageRef}
        className={styles.orbStage}
        role="img"
        aria-label={`Interactive technology globe featuring ${technologies.map((technology) => technology.title).join(", ")}. Drag to rotate.`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {spherePoints.map((_, index) => {
          const technology = technologies[index % technologies.length];

          return (
            <div
              ref={(element) => { plateRefs.current[index] = element; }}
              className={styles.orbPlate}
              key={`${technology.slug}-${index}`}
              title={technology.title}
              aria-hidden="true"
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") hoveredPlateRef.current = index;
              }}
              onPointerLeave={() => {
                if (hoveredPlateRef.current === index) hoveredPlateRef.current = null;
              }}
            >
              <span className={styles.orbPlateInner}>
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" style={{ color: `#${technology.hex}` }}>
                  <path d={technology.path} fill="currentColor" />
                </svg>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
