"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

// True once the element is within rootMargin of the viewport. Fires once, then disconnects.
export function useNearViewport(ref: RefObject<Element | null>, rootMargin = "800px") {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, near]);

  return near;
}

// A wrapper div that gets data-near="true" once close to the viewport, so CSS can start loading background images.
// With `backgrounds`, it also sets data-bg-ready="true" once those images have loaded (or failed), so CSS can fade them in.
export function NearViewport({ rootMargin, className, backgrounds, children }: { rootMargin?: string; className?: string; backgrounds?: readonly string[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref, rootMargin);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!near || !backgrounds?.length) return;
    let remaining = backgrounds.length;
    let cancelled = false;
    const settle = () => { if (--remaining === 0 && !cancelled) setReady(true); };
    for (const url of backgrounds) {
      const image = new Image();
      image.onload = settle;
      image.onerror = settle;
      image.src = url;
    }
    return () => { cancelled = true; };
  }, [near, backgrounds]);

  return <div ref={ref} className={className} data-near={near ? "true" : undefined} data-bg-ready={ready ? "true" : undefined}>{children}</div>;
}
