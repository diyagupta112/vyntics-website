"use client";

import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import styles from "./why-join-scroll.module.css";

const principles = [
  { icon: "build", position: "upperLeft", title: "Build With Purpose", text: "Turn ideas into useful, real-world solutions. Work on problems where thoughtful engineering, data, and AI can create something genuinely valuable." },
  { icon: "ownership", position: "upperRight", title: "Take Ownership", text: "Take responsibility and see your work through. You get the space to make decisions, solve problems independently, and follow your ideas from the first step to the final result." },
  { icon: "learn", position: "lowerLeft", title: "Learn by Building", text: "Grow by solving real problems hands-on. Instead of learning only through theory, you build, experiment, make mistakes, and develop your skills through the work itself." },
  { icon: "share", position: "lowerRight", title: "Share What You Know", text: "Learn from each other and make better work together. We value open discussions, shared ideas, and the habit of helping one another improve the way we build." },
  { icon: "think", position: "top", title: "Think Beyond the Obvious", text: "Look at problems from different angles and explore better ways to solve them. We encourage curiosity, experimentation, and thoughtful ideas instead of settling for the first answer." },
  { icon: "grow", position: "bottom", title: "Grow Together", text: "Build your skills while helping the people around you grow too. We value collaboration, honest feedback, and an environment where everyone can keep improving." },
] as const;

const subscribeToHydration = () => () => undefined;

function PrincipleIcon({ type }: { type: (typeof principles)[number]["icon"] }) {
  if (type === "ownership") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><path d="m16 8 4-4M16.5 4H20v3.5" /></svg>;
  if (type === "learn") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.3 15.5a7 7 0 1 1 7.4 0c-1 .7-1.4 1.4-1.4 2.5H9.7c0-1.1-.4-1.8-1.4-2.5Z" /><path d="M9.5 21h5M9.7 18h4.6" /></svg>;
  if (type === "share") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="9" r="3" /><circle cx="17" cy="8" r="2.5" /><path d="M2.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M14 13.5c3.8-.5 6.3 1.2 7 4.5" /></svg>;
  if (type === "think") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5" /><path d="m14.5 14.5 4 4M18 4v3M16.5 5.5h3" /></svg>;
  if (type === "grow") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="9" r="2.5" /><circle cx="16" cy="9" r="2.5" /><path d="M3 19c.6-3.5 2.3-5.2 5-5.2s4.4 1.7 5 5.2M12 18c.7-2.8 2-4.2 4-4.2 2.7 0 4.4 1.7 5 5.2" /><path d="M12 11V4m0 0L9.5 6.5M12 4l2.5 2.5" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 7 4v8l-7 4-7-4V7l7-4Z" /><path d="m5 7 7 4 7-4M12 11v8" /></svg>;
}

function ScrollPrinciple({
  index,
  progress,
  enabled,
  principle,
}: {
  index: number;
  progress: MotionValue<number>;
  enabled: boolean;
  principle: (typeof principles)[number];
}) {
  const start = 0.12 + index * 0.135;
  const isLeft = principle.position.endsWith("Left");
  const isRight = principle.position.endsWith("Right");
  const isUpper = principle.position.startsWith("upper") || principle.position === "top";
  const iconXStart = isLeft ? 22 : isRight ? -22 : 0;
  const iconYStart = isUpper ? 18 : -18;
  const textXStart = isLeft ? 10 : isRight ? -10 : 0;
  const textYStart = isUpper ? 8 : -8;
  const iconOpacity = useTransform(progress, [start, start + 0.06, 1], [0, 1, 1]);
  const iconScale = useTransform(progress, [start, start + 0.08, 1], [0.85, 1, 1]);
  const iconX = useTransform(progress, [start, start + 0.08, 1], [iconXStart, 0, 0]);
  const iconY = useTransform(progress, [start, start + 0.08, 1], [iconYStart, 0, 0]);
  const titleOpacity = useTransform(progress, [start + 0.05, start + 0.115, 1], [0, 1, 1]);
  const titleX = useTransform(progress, [start + 0.05, start + 0.12, 1], [textXStart, 0, 0]);
  const titleY = useTransform(progress, [start + 0.05, start + 0.12, 1], [textYStart, 0, 0]);
  const descriptionOpacity = useTransform(progress, [start + 0.105, start + 0.18, 1], [0, 1, 1]);
  const descriptionX = useTransform(progress, [start + 0.105, start + 0.18, 1], [textXStart * 0.65, 0, 0]);
  const descriptionY = useTransform(progress, [start + 0.105, start + 0.18, 1], [textYStart * 0.65, 0, 0]);

  return (
    <article className={`${styles.principle} ${styles[principle.position]}`} role="listitem">
      <motion.span
        className={styles.icon}
        style={enabled ? { opacity: iconOpacity, scale: iconScale, x: iconX, y: iconY } : undefined}
      >
        <PrincipleIcon type={principle.icon} />
      </motion.span>
      <div className={styles.copy}>
        <motion.h3 style={enabled ? { opacity: titleOpacity, x: titleX, y: titleY } : undefined}>
          {principle.title}
        </motion.h3>
        <motion.p style={enabled ? { opacity: descriptionOpacity, x: descriptionX, y: descriptionY } : undefined}>
          {principle.text}
        </motion.p>
      </div>
    </article>
  );
}

export function WhyJoinScroll() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = scrollYProgress;
  const imageRevealProgress = useMotionValue(0);
  useMotionValueEvent(progress, "change", (latest) => {
    if (latest > imageRevealProgress.get()) imageRevealProgress.set(latest);
  });
  const imageOpacity = useTransform(imageRevealProgress, [0, 0.12, 1], [0.55, 1, 1]);
  const imageScale = useTransform(imageRevealProgress, [0, 0.14, 1], [0.96, 1, 1]);
  const imageFilter = useTransform(
    imageRevealProgress,
    [0, 0.12, 1],
    ["grayscale(1) saturate(0.35)", "grayscale(0) saturate(1)", "grayscale(0) saturate(1)"],
  );
  const enabled = mounted && !reduceMotion;

  return (
    <div className={styles.track} data-enhanced={enabled ? "true" : undefined} ref={trackRef}>
      <div className={styles.sticky}>
        <div className={styles.composition}>
          <motion.div
            className={styles.image}
            style={enabled ? { filter: imageFilter, opacity: imageOpacity, scale: imageScale } : undefined}
          >
            <Image
              alt="Team members collaborating around laptops"
              fill
              sizes="(max-width: 760px) min(calc(100vw - 2rem), 20rem), (max-width: 1000px) 22rem, 27rem"
              src="/images/careers/2.jpg"
            />
          </motion.div>

          <div className={styles.principles} role="list" aria-label="Reasons to join Vyntics">
            {principles.map((principle, index) => (
              <ScrollPrinciple
                enabled={enabled}
                index={index}
                key={principle.title}
                principle={principle}
                progress={progress}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
