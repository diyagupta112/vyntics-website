"use client";

import { useEffect, useRef } from "react";

// Share of the gap between two columns that sits to the left of the line (0.5 is centered).
// The first two lines (AI Solutions | Data Engineering | Cloud Foundations) sit further left.
const LEFT_BIAS = [0.03, 0, 0.2, 0.2];
// Extra pixels to pull each line further left.
const SHIFT_LEFT_PX = [20, 10, 0, 0];

/**
 * Vertical separators for the footer service columns. Each line is placed by measuring the rendered text,
 * midway between the right edge of the widest label in one column and the left edge of the next column's labels.
 */
export function ServiceDividers({ count, className }: { count: number; className: string }) {
  const lines = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const list = lines.current[0]?.parentElement;
    if (!list) return;

    const place = () => {
      const listLeft = list.getBoundingClientRect().left;
      const columns = Array.from(list.children).filter(child => child.tagName === "SECTION");
      lines.current.forEach((line, index) => {
        const current = columns[index];
        const next = columns[index + 1];
        if (!line || !current || !next) return;
        const textOf = (column: Element) => Array.from(column.querySelectorAll("h3 a, li a, li span, h3")).map(el => el.getBoundingClientRect()).filter(rect => rect.width > 0);
        const right = Math.max(...textOf(current).map(rect => rect.right));
        const left = Math.min(...textOf(next).map(rect => rect.left));
        if (Number.isFinite(right) && Number.isFinite(left) && left > right) line.style.left = `${right + (left - right) * (LEFT_BIAS[index] ?? 0.2) - (SHIFT_LEFT_PX[index] ?? 0) - listLeft}px`;
      });
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(list);
    void document.fonts?.ready.then(place);
    return () => observer.disconnect();
  }, [count]);

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <span className={className} key={index} ref={element => { lines.current[index] = element; }} style={{ "--divider-k": index + 1 } as React.CSSProperties} aria-hidden="true" />
      ))}
    </>
  );
}
