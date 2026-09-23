"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { MouseEvent, ReactNode } from "react";

type ThreeDCardProps = {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
};

export function ThreeDCard({ children, className, wrapperClassName }: ThreeDCardProps) {
  const reduceMotion = useReducedMotion();
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(rawRotateY, { stiffness: 150, damping: 18 });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width;
    const pointerY = (event.clientY - bounds.top) / bounds.height;

    rawRotateX.set((0.5 - pointerY) * 10);
    rawRotateY.set((pointerX - 0.5) * 12);
  };

  const resetRotation = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  return (
    <div className={wrapperClassName} style={{ perspective: "1200px" }}>
      <motion.div
        className={className}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetRotation}
      >
        {children}
      </motion.div>
    </div>
  );
}
