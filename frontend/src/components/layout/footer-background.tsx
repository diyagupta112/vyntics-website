"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "./footer-background.module.css";

// The shader chunk and WebGL setup are only needed once the footer is about to scroll into view.
const ShaderBackground = dynamic(() => import("../../../shader-r").then((module) => module.ShaderBackground), { ssr: false });

export function FooterBackground() {
  const container = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setNear(true);
      observer.disconnect();
    }, { rootMargin: "600px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={container} className={styles.background} aria-hidden="true">
    {near && <ShaderBackground className={styles.shader} />}
  </div>;
}
