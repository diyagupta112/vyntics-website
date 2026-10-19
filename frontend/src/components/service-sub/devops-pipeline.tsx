"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Container } from "@/components/ui/container";
import { DevopsPipelineDiagram } from "./devops-pipeline-diagram";
import { PIPE, PIPE_HEIGHT, devopsPipelineLegend, pipeBadges, type PipelineReference } from "./devops-pipeline-data";
import styles from "./devops-pipeline.module.css";

type PanelPlacement = "right" | "left" | "below" | "above" | "fallback";
type PanelPosition = { x: number; y: number; placement: PanelPlacement; fallback: boolean };

const PANEL_GAP = 14;
const PANEL_INSET = 8;

function intersects(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function DevopsPipeline() {
  const id = useId().replace(/:/g, "");
  const drawingRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerReference = useRef<PipelineReference | null>(null);
  const [active, setActive] = useState<PipelineReference | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const panelId = `${id}-pipeline-card`;

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const close = useCallback(() => {
    clearTimers();
    pointerReference.current = null;
    setActive(null);
  }, [clearTimers]);

  const showMobileCard = useCallback(() => {
    if (!window.matchMedia("(max-width:767px)").matches) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const bounds = panel.getBoundingClientRect();
      if (bounds.top >= 0 && bounds.bottom <= window.innerHeight) return;
      panel.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion:reduce)").matches ? "instant" : "smooth",
      });
    }));
  }, []);

  const activate = useCallback((reference: PipelineReference, scrollOnMobile = false) => {
    clearTimers();
    setActive(reference);
    if (scrollOnMobile) showMobileCard();
  }, [clearTimers, showMobileCard]);

  const scheduleOpen = useCallback((reference: PipelineReference) => {
    if (!finePointer || pointerReference.current === reference) return;
    pointerReference.current = reference;
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setActive(reference), 60);
  }, [finePointer]);

  const scheduleClose = useCallback(() => {
    if (!finePointer) return;
    pointerReference.current = null;
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 150);
  }, [finePointer]);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover:hover) and (pointer:fine)");
    const updatePointer = () => setFinePointer(pointerQuery.matches);
    const frame = requestAnimationFrame(() => {
      setEnhanced(true);
      updatePointer();
    });
    pointerQuery.addEventListener("change", updatePointer);
    return () => {
      cancelAnimationFrame(frame);
      pointerQuery.removeEventListener("change", updatePointer);
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    if (active === null || finePointer) return;
    const handleOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!drawingRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [active, close, finePointer]);

  const placePanel = useCallback(() => {
    const drawing = drawingRef.current;
    const panel = panelRef.current;
    if (!drawing || !panel || active === null || window.matchMedia("(max-width:767px)").matches) {
      setPanelPosition(null);
      return;
    }

    const wrapper = drawing.getBoundingClientRect();
    const visible = (node: Element) => node.getBoundingClientRect();
    const usable = (bounds: DOMRect) => bounds.width > 0 && bounds.height > 0;
    const members = Array.from(drawing.querySelectorAll<SVGGElement>(`g[data-ref="${active}"]`));
    const anchors = members.flatMap(node => Array.from(node.querySelectorAll("[data-anchor]"))).map(visible).filter(usable);
    const avoid = members.flatMap(node => Array.from(node.children)).map(visible).filter(usable);
    if (!anchors.length) return;

    const group = anchors.reduce((union, bounds) => new DOMRect(
      Math.min(union.left, bounds.left),
      Math.min(union.top, bounds.top),
      Math.max(union.right, bounds.right) - Math.min(union.left, bounds.left),
      Math.max(union.bottom, bounds.bottom) - Math.min(union.top, bounds.top),
    ));
    const panelBounds = panel.getBoundingClientRect();
    const width = panelBounds.width;
    const height = panelBounds.height;
    const local = {
      left: group.left - wrapper.left,
      right: group.right - wrapper.left,
      top: group.top - wrapper.top,
      bottom: group.bottom - wrapper.top,
      centerX: (group.left + group.right) / 2 - wrapper.left,
      centerY: (group.top + group.bottom) / 2 - wrapper.top,
    };
    const candidates: Array<Omit<PanelPosition, "fallback">> = [
      { placement: "right", x: local.right + PANEL_GAP, y: local.centerY - height / 2 },
      { placement: "left", x: local.left - PANEL_GAP - width, y: local.centerY - height / 2 },
      { placement: "below", x: local.centerX - width / 2, y: local.bottom + PANEL_GAP },
      { placement: "above", x: local.centerX - width / 2, y: local.top - PANEL_GAP - height },
    ];
    const badgeBounds = Array.from(drawing.querySelectorAll<HTMLButtonElement>("button[data-badge-control]"))
      .map(node => node.getBoundingClientRect())
      .filter(bounds => bounds.width > 0 && bounds.height > 0);
    const selected = candidates.find(candidate => {
      const card = new DOMRect(wrapper.left + candidate.x, wrapper.top + candidate.y, width, height);
      return candidate.x >= PANEL_INSET && candidate.y >= PANEL_INSET
        && candidate.x + width <= wrapper.width - PANEL_INSET
        && candidate.y + height <= wrapper.height - PANEL_INSET
        && !intersects(card, group) && avoid.every(part => !intersects(card, part))
        && badgeBounds.every(badge => !intersects(card, badge));
    });
    if (selected) {
      setPanelPosition({ ...selected, fallback: false });
      return;
    }
    const groupOnRight = local.centerX > wrapper.width / 2;
    setPanelPosition({
      x: groupOnRight ? PANEL_INSET : wrapper.width - width - PANEL_INSET,
      y: PANEL_INSET,
      placement: "fallback",
      fallback: true,
    });
  }, [active]);

  useLayoutEffect(() => {
    placePanel();
    if (active === null) return;
    const observer = new ResizeObserver(placePanel);
    if (drawingRef.current) observer.observe(drawingRef.current);
    window.addEventListener("resize", placePanel);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", placePanel);
    };
  }, [active, placePanel]);

  function referenceFromTarget(target: EventTarget | null) {
    const element = target instanceof Element ? target.closest<HTMLElement>("[data-ref]") : null;
    const reference = Number(element?.dataset.ref);
    return reference >= 1 && reference <= 7 ? reference as PipelineReference : null;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const reference = referenceFromTarget(event.target);
    if (reference !== null) scheduleOpen(reference);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const reference = referenceFromTarget(event.target);
    if (reference !== null) activate(reference, event.pointerType !== "mouse");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, reference: PipelineReference) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(reference, true);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      event.currentTarget.focus();
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = (reference - 1 + (event.key === "ArrowRight" ? 1 : -1) + 7) % 7;
    const next = (index + 1) as PipelineReference;
    activate(next);
    const nextButton = Array.from(drawingRef.current?.querySelectorAll<HTMLButtonElement>(`button[data-ref="${next}"]`) ?? [])
      .find(button => button.getClientRects().length > 0);
    nextButton?.focus();
  }

  function controls() {
    return pipeBadges.map(point => <button
      key={point.ref}
      type="button"
      className={styles.badgeControl}
      style={{ left: `${point.x / PIPE.width * 100}%`, top: `${point.y / PIPE_HEIGHT * 100}%`, width: `${30 / PIPE.width * 100}%` } as CSSProperties}
      aria-label={`Point ${point.ref}: ${devopsPipelineLegend[point.ref - 1].title}`}
      aria-expanded={active === point.ref}
      aria-controls={panelId}
      data-badge-control
      data-ref={point.ref}
      onFocus={() => activate(point.ref)}
      onClick={() => activate(point.ref, true)}
      onKeyDown={event => handleKeyDown(event, point.ref)}
    />);
  }

  return <section id="devops-pipeline" className={styles.section} aria-labelledby="devops-pipeline-title"
    data-active={active !== null} data-enhanced={enhanced} data-fine-pointer={finePointer}>
    <Container>
      <header className={styles.heading} data-reveal="devops-pipeline-heading">
        <p className={styles.eyebrow}>Pipeline</p>
        <h2 id="devops-pipeline-title">Sample DevOps pipeline</h2>
        <p className={styles.intro}>How a change moves from code commit to production, with checks at every stage.</p>
      </header>
      <figure className={styles.figure}>
        <div ref={drawingRef} className={styles.drawing} data-reveal="devops-pipeline-drawing"
          onPointerMove={handlePointerMove} onPointerDown={handlePointerDown} onPointerLeave={scheduleClose}
          onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
          <div className={styles.canvas}>
            <DevopsPipelineDiagram active={active} id={`${id}-pipeline`} />
            {controls()}
          </div>
          <div ref={panelRef} id={panelId} className={styles.panel} data-open={active !== null}
            data-placement={panelPosition?.placement ?? "fallback"} data-fallback={panelPosition?.fallback ?? false}
            style={panelPosition ? { "--panel-x": `${panelPosition.x}px`, "--panel-y": `${panelPosition.y}px` } as CSSProperties : undefined}
            onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}>
            <button type="button" className={styles.closeButton} aria-label="Close" onClick={close}>×</button>
            <ol className={styles.legend} aria-label="DevOps pipeline legend">
              {devopsPipelineLegend.map(item => <li key={item.id} data-active={active === item.id}>
                <span className={styles.cardHeading}>
                  <span className={styles.legendBadge} aria-hidden="true">{item.id}</span>
                  <strong>{item.title}</strong>
                </span>
                <span className={styles.chips}>{item.items.map(chip => <span key={chip}>{chip}</span>)}</span>
                <span className={styles.legendDescription}>{item.description}</span>
              </li>)}
            </ol>
            <p className={styles.feedbackRow}>Feedback and fixes: back to Commit</p>
          </div>
        </div>
        <p className={styles.hint}>{finePointer ? "Hover over a numbered point to see how it works." : "Tap a numbered point to see how it works."}</p>
        <figcaption className={styles.caption}>Illustrative example of a typical CI/CD pipeline. Every pipeline is designed around your stack, team and release process.</figcaption>
      </figure>
    </Container>
  </section>;
}
