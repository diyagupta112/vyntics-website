"use client";

import { useLayoutEffect } from "react";

/**
 * Lines the H1's first letter up with the eyebrow's first letter. Both boxes already share one left edge, but a large
 * letter carries a built-in gap on its left that depends on the letter and the font size, so a fixed offset cannot suit
 * every title. This measures the real gap of both texts with the browser's own font metrics and cancels the difference.
 */
export function HeroOpticalAlign({ titleId }: { titleId: string }) {
  useLayoutEffect(() => {
    const title = document.getElementById(titleId);
    const eyebrow = title?.parentElement?.querySelector<HTMLElement>("p");
    const context = document.createElement("canvas").getContext("2d");
    if (!title || !eyebrow || !context) return;

    const inkGap = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      const text = (element.textContent ?? "").trim();
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const first = (style.textTransform === "uppercase" ? text.toUpperCase() : text).charAt(0);
      return -context.measureText(first).actualBoundingBoxLeft;
    };
    const align = () => { title.style.marginLeft = `${inkGap(eyebrow) - inkGap(title)}px`; };

    align();
    const observer = new ResizeObserver(align);
    observer.observe(title);
    document.fonts?.ready.then(align);
    return () => {
      observer.disconnect();
      title.style.marginLeft = "";
    };
  }, [titleId]);
  return null;
}
