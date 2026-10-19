"use client";

import {
  Fragment,
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
import { AutomationFlowDiagram, AutomationFlowIconGlyph } from "./automation-flow-diagram";
import { VIEW_H, VIEW_W, automationFlowBadges, automationFlowLegend, automationFlowTiles, type AutomationFlowReference } from "./automation-flow-data";
import styles from "./automation-flow.module.css";

type PanelPosition = { x: number; y: number; arrow: number; placement: "below"; fallback: boolean };

const PANEL_GAP = 14;
const PANEL_INSET = 8;
const COUNT = automationFlowLegend.length;

function MobileStack() {
  return <ol className={styles.mobile}>
    {automationFlowTiles.map((tile, index) => <Fragment key={tile.ref}>
      {index > 0 && <li className={`${styles.stackArrow}${tile.exception ? ` ${styles.stackArrowDashed}` : ""}`} aria-hidden="true" />}
      <li className={`${styles.step}${tile.exception ? ` ${styles.exception}` : ""}`}>
        {tile.exception && <span className={styles.exceptionTag}>Exceptions only</span>}
        <span className={styles.stepHead}>
          <span className={styles.legendBadge}>{tile.ref}</span>
          <AutomationFlowIconGlyph name={tile.icon} />
          <span><strong>{tile.titleLines.join(" ")}</strong><small>{tile.subtitleLines.join(" ")}</small></span>
        </span>
        <span className={styles.stepText} aria-hidden="true">{automationFlowLegend[index].description}</span>
      </li>
    </Fragment>)}
  </ol>;
}

export function AutomationFlow() {
  const id = useId().replace(/:/g, "");
  const drawingRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerReference = useRef<AutomationFlowReference | null>(null);
  const [active, setActive] = useState<AutomationFlowReference | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const panelId = `${id}-flow-card`;

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

  const activate = useCallback((reference: AutomationFlowReference) => {
    clearTimers();
    setActive(reference);
  }, [clearTimers]);

  const scheduleOpen = useCallback((reference: AutomationFlowReference) => {
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
    if (active === null) return;
    const handleKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") close(); };
    const handleOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!drawingRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", handleKey);
    if (!finePointer) document.addEventListener("pointerdown", handleOutsidePointer);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("pointerdown", handleOutsidePointer);
    };
  }, [active, close, finePointer]);

  const placePanel = useCallback(() => {
    const drawing = drawingRef.current;
    const panel = panelRef.current;
    if (!drawing || !panel || active === null || window.matchMedia("(max-width:767px)").matches) {
      setPanelPosition(null);
      return;
    }

    const wrapper = drawing.getBoundingClientRect();
    const groups = Array.from(drawing.querySelectorAll<SVGGElement>(`g[data-ref="${active}"]`))
      .map(node => node.getBoundingClientRect())
      .filter(bounds => bounds.width > 0 && bounds.height > 0);
    if (!groups.length) return;

    const group = groups.reduce((union, bounds) => new DOMRect(
      Math.min(union.left, bounds.left),
      Math.min(union.top, bounds.top),
      Math.max(union.right, bounds.right) - Math.min(union.left, bounds.left),
      Math.max(union.bottom, bounds.bottom) - Math.min(union.top, bounds.top),
    ));
    const { width, height } = panel.getBoundingClientRect();
    const local = {
      left: group.left - wrapper.left,
      right: group.right - wrapper.left,
      top: group.top - wrapper.top,
      bottom: group.bottom - wrapper.top,
      centerX: (group.left + group.right) / 2 - wrapper.left,
      centerY: (group.top + group.bottom) / 2 - wrapper.top,
    };
    // The diagram is a single row, so the card hangs below the highlighted step
    // and never covers it. The card is clamped to the drawing width.
    const x = Math.min(Math.max(local.centerX - width / 2, PANEL_INSET), wrapper.width - width - PANEL_INSET);
    setPanelPosition({ placement: "below", x, y: local.bottom + PANEL_GAP, arrow: local.centerX - x, fallback: false });
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
    return reference >= 1 && reference <= COUNT ? reference as AutomationFlowReference : null;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const reference = referenceFromTarget(event.target);
    if (reference !== null) scheduleOpen(reference);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const reference = referenceFromTarget(event.target);
    if (reference !== null) activate(reference);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, reference: AutomationFlowReference) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(reference);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      event.currentTarget.focus();
      return;
    }
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = ((reference - 1 + step + COUNT) % COUNT + 1) as AutomationFlowReference;
    activate(next);
    drawingRef.current?.querySelector<HTMLButtonElement>(`button[data-ref="${next}"]`)?.focus();
  }

  return <section id="sample-automation-flow" className={styles.section} aria-labelledby="sample-automation-flow-title"
    data-active={active !== null} data-enhanced={enhanced} data-fine-pointer={finePointer}>
    <Container className={styles.container}>
      <header className={styles.heading} data-reveal="sample-automation-flow-heading">
        <p className={styles.eyebrow}>Example flow</p>
        <h2 id="sample-automation-flow-title">Sample automation flow</h2>
        <p className={styles.intro}>Automation can prepare and route information while keeping validation and exception review visible.</p>
      </header>
      <figure className={styles.figure}>
        <div ref={drawingRef} className={styles.drawing} data-reveal="sample-automation-flow-visual"
          onPointerMove={handlePointerMove} onPointerDown={handlePointerDown} onPointerLeave={scheduleClose}
          onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
          <div className={styles.canvas}>
            <div className={styles.desktop}>
              <AutomationFlowDiagram active={active} id={`${id}-diagram`} />
              {automationFlowBadges.map(point => <button
                key={point.ref}
                type="button"
                className={styles.badgeControl}
                style={{ left: `${point.x / VIEW_W * 100}%`, top: `${point.y / VIEW_H * 100}%`, width: `${30 / VIEW_W * 100}%` } as CSSProperties}
                aria-label={`Step ${point.ref}: ${automationFlowLegend[point.ref - 1].title}`}
                aria-expanded={active === point.ref}
                aria-controls={panelId}
                data-badge-control
                data-ref={point.ref}
                onFocus={() => activate(point.ref)}
                onClick={() => activate(point.ref)}
                onKeyDown={event => handleKeyDown(event, point.ref)}
              />)}
            </div>
            <MobileStack />
          </div>
          <div ref={panelRef} id={panelId} className={styles.panel} data-open={active !== null}
            style={panelPosition ? { "--panel-x": `${panelPosition.x}px`, "--panel-y": `${panelPosition.y}px`, "--panel-arrow": `${panelPosition.arrow}px` } as CSSProperties : undefined}
            onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}>
            <button type="button" className={styles.closeButton} aria-label="Close" onClick={close}>×</button>
            <ol className={styles.legend} aria-label="Automation flow steps">
              {automationFlowLegend.map(item => <li key={item.id} data-active={active === item.id}>
                <span className={styles.cardHeading}>
                  <span className={styles.legendBadge} aria-hidden="true">{item.id}</span>
                  <strong>{item.title}</strong>
                </span>
                <span className={styles.legendDescription}>{item.description}</span>
              </li>)}
            </ol>
          </div>
        </div>
        <p className={styles.hint}>{finePointer ? "Hover over a numbered point to see how it works." : "Tap a numbered point to see how it works."}</p>
        <figcaption className={styles.caption}>Illustrative example of a document automation flow. Every workflow is designed around your documents, systems and review rules.</figcaption>
      </figure>
    </Container>
  </section>;
}
