"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Font side bearings can make large headings look indented despite aligned boxes.
export function OpticalHeadingAlignment() {
  const pathname = usePathname();

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let disposed = false;
    const adjusted = new Set<HTMLElement>();

    function textEdge(element: HTMLElement) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const match = /\S/.exec(node.textContent ?? "");
        if (!match) continue;
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + 1);
        const style = getComputedStyle(node.parentElement ?? element);
        context!.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const character = style.textTransform === "uppercase" ? match[0].toUpperCase() : match[0];
        return range.getBoundingClientRect().left - context!.measureText(character).actualBoundingBoxLeft;
      }
      return element.getBoundingClientRect().left;
    }

    function align() {
      frame = 0;
      if (disposed) return;
      for (const heading of adjusted) heading.style.removeProperty("--heading-optical-offset");
      document.querySelectorAll<HTMLElement>("main h1, main h2, main h3").forEach(heading => {
        const style = getComputedStyle(heading);
        if (style.direction !== "ltr" || !["start", "left"].includes(style.textAlign) || !heading.getClientRects().length) return;
        const siblings = Array.from(heading.parentElement?.children ?? []);
        const eyebrow = siblings.slice(0, siblings.indexOf(heading)).findLast(element =>
          Array.from(element.classList).some(name => /eyebrow/i.test(name)),
        ) as HTMLElement | undefined;
        if (!eyebrow || !eyebrow.getClientRects().length) return;
        const eyebrowStyle = getComputedStyle(eyebrow);
        if (!["start", "left"].includes(eyebrowStyle.textAlign)) return;
        const before = getComputedStyle(eyebrow, "::before");
        const decorated = before.content !== "none" && before.content !== "normal";
        const target = decorated ? eyebrow.getBoundingClientRect().left : textEdge(eyebrow);
        const offset = target - textEdge(heading);
        // Only correct font bearings, not intentional layout offsets or indentation.
        if (Math.abs(offset) > parseFloat(style.fontSize) * .15) return;
        heading.classList.add("opticallyAlignedHeading");
        heading.style.setProperty("--heading-optical-offset", `${offset}px`);
        adjusted.add(heading);
      });
    }

    const schedule = () => {
      if (!disposed && !frame) frame = window.requestAnimationFrame(align);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    void document.fonts.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
      for (const heading of adjusted) {
        heading.style.removeProperty("--heading-optical-offset");
        heading.classList.remove("opticallyAlignedHeading");
      }
    };
  }, [pathname]);

  return null;
}
