"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Position = { x: number; y: number; section?: string; offset?: number };
const ENTRY_KEY = "__vynticsScrollEntry";
const STORAGE_PREFIX = "vyntics-scroll:";

/** Keep a separate position for each Back/Forward entry, including repeated URLs. */
export function ScrollRestoration() {
  const pathname = usePathname();
  const renderedPath = useRef(pathname);
  const resume = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    renderedPath.current = pathname;
    resume.current();
  }, [pathname]);

  useEffect(() => {
    const positions = new Map<string, Position>();
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    const originalRestoration = history.scrollRestoration;
    const newKey = () => crypto.randomUUID();
    let entry: string = history.state?.[ENTRY_KEY] ?? newKey();
    let lastPosition: Position | undefined;
    let captureFrame = 0;
    let restoreFrame = 0;
    let restoreTimer = 0;
    let pending: { position: Position; url: string } | undefined;
    let resize: ResizeObserver | undefined;
    let mutations: MutationObserver | undefined;

    // Preserve Next.js's own history fields and navigation state.
    const withEntry = (state: unknown, key: string) => ({
      ...(state && typeof state === "object" ? state : {}),
      [ENTRY_KEY]: key,
    });
    originalReplace.call(history, withEntry(history.state, entry), "");
    history.scrollRestoration = "manual";

    const read = (key: string): Position | undefined => {
      if (positions.has(key)) return positions.get(key);
      try {
        const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
        if (!raw) return;
        const value = JSON.parse(raw) as Position;
        if (Number.isFinite(value.x) && Number.isFinite(value.y)) return value;
      } catch { /* Storage is optional; in-memory restoration still works. */ }
    };
    const capture = () => {
      cancelAnimationFrame(captureFrame);
      captureFrame = 0;
      if (pending) return;
      const position: Position = { x: window.scrollX, y: window.scrollY };
      const headerHeight = document.querySelector("body > header")?.getBoundingClientRect().height ?? 0;
      // Anchor to a normal-flow section, never to a translated/pinned card.
      const section = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"))
        .find(element => {
          if (element.closest(".pin-spacer")) return false;
          const positioning = getComputedStyle(element).position;
          if (positioning === "sticky" || positioning === "fixed") return false;
          const rect = element.getBoundingClientRect();
          return rect.top <= headerHeight + 1 && rect.bottom > headerHeight && rect.right > 0 && rect.left < innerWidth;
        });
      if (section) {
        position.section = section.id;
        position.offset = -section.getBoundingClientRect().top;
      }
      lastPosition = position;
    };
    const save = () => {
      if (!lastPosition) return;
      positions.set(entry, lastPosition);
      try { sessionStorage.setItem(STORAGE_PREFIX + entry, JSON.stringify(lastPosition)); }
      catch { /* Continue without persistence when storage is unavailable. */ }
    };
    const stop = () => {
      pending = undefined;
      cancelAnimationFrame(restoreFrame);
      restoreFrame = 0;
      clearTimeout(restoreTimer);
      resize?.disconnect();
      mutations?.disconnect();
    };
    const apply = () => {
      restoreFrame = 0;
      if (!pending || location.href !== pending.url || renderedPath.current !== location.pathname) return;
      const { position } = pending;
      const section = position.section ? document.getElementById(position.section) : null;
      const top = section && typeof position.offset === "number"
        ? window.scrollY + section.getBoundingClientRect().top + position.offset
        : position.y;
      window.scrollTo({ left: position.x, top: Math.max(0, top), behavior: "instant" });
    };
    const schedule = () => {
      if (pending && !restoreFrame) restoreFrame = requestAnimationFrame(apply);
    };
    const restore = (position: Position) => {
      stop();
      pending = { position, url: location.href };
      // Streamed content and the Services pin may finish after the route mounts.
      resize = new ResizeObserver(schedule);
      resize.observe(document.body);
      mutations = new MutationObserver(schedule);
      mutations.observe(document.body, { childList: true, subtree: true });
      restoreTimer = window.setTimeout(stop, 8000);
      schedule();
    };

    const push: History["pushState"] = function (state, unused, url) {
      save();
      stop();
      const next = newKey();
      originalPush.call(this, withEntry(state, next), unused, url);
      entry = next;
      lastPosition = undefined;
    };
    const replace: History["replaceState"] = function (state, unused, url) {
      const key = history.state?.[ENTRY_KEY] ?? entry;
      originalReplace.call(this, withEntry(state, key), unused, url);
    };
    const onPop = (event: PopStateEvent) => {
      save();
      stop();
      entry = event.state?.[ENTRY_KEY] ?? newKey();
      if (!event.state?.[ENTRY_KEY]) originalReplace.call(history, withEntry(event.state, entry), "");
      const position = read(entry);
      lastPosition = position;
      if (position) restore(position);
    };
    const onScroll = () => {
      if (!pending && !captureFrame) captureFrame = requestAnimationFrame(capture);
    };
    const onClick = () => { capture(); save(); };
    const onPageHide = () => { capture(); save(); };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        const position = read(entry);
        if (position) restore(position);
      }
    };
    // User input always takes priority over a pending restoration.
    const onInput = () => { stop(); };

    history.pushState = push;
    history.replaceState = replace;
    resume.current = schedule;
    window.addEventListener("popstate", onPop);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("vyntics:scroll-layout-ready", schedule);
    window.addEventListener("wheel", onInput, { passive: true });
    window.addEventListener("touchstart", onInput, { passive: true });
    window.addEventListener("pointerdown", onInput, true);
    window.addEventListener("keydown", onInput);
    document.addEventListener("click", onClick, true);
    document.fonts.addEventListener("loadingdone", schedule);

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const initial = navigation?.type === "reload" || navigation?.type === "back_forward" ? read(entry) : undefined;
    if (initial) { lastPosition = initial; restore(initial); }
    else capture();

    return () => {
      save();
      stop();
      cancelAnimationFrame(captureFrame);
      resume.current = () => {};
      if (history.pushState === push) history.pushState = originalPush;
      if (history.replaceState === replace) history.replaceState = originalReplace;
      history.scrollRestoration = originalRestoration;
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("vyntics:scroll-layout-ready", schedule);
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("touchstart", onInput);
      window.removeEventListener("pointerdown", onInput, true);
      window.removeEventListener("keydown", onInput);
      document.removeEventListener("click", onClick, true);
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, []);

  return null;
}
