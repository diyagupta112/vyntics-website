"use client";

import { useEffect, useRef, useState } from "react";

export function useServiceRotation(itemCount: number) {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const showcase = showcaseRef.current;
    if (!showcase) return;

    let wasVisible = false;
    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting;

      if (isVisible && !wasVisible) {
        setActiveIndex(0);
        setCycle((current) => current + 1);
        setIsRunning(true);
      } else if (!isVisible && wasVisible) {
        setIsRunning(false);
      }

      wasVisible = isVisible;
    }, { threshold: 0.2 });

    observer.observe(showcase);
    return () => observer.disconnect();
  }, []);

  function selectService(index: number) {
    setActiveIndex(index);
    setCycle((current) => current + 1);
  }

  function advanceService() {
    setActiveIndex((current) => (current + 1) % itemCount);
  }

  return {
    activeIndex,
    advanceService,
    isRunning,
    progressKey: `${cycle}-${activeIndex}`,
    selectService,
    showcaseRef,
  };
}
