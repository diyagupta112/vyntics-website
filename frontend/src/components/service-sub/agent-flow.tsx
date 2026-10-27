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
import { AgentFlowDiagram, AgentFlowIconGlyph } from "./agent-flow-diagram";
import { AF, VIEW_H, VIEW_W, agentFlowBadges, agentFlowGuardrails, agentFlowLabels, agentFlowLegend, agentFlowNodes, agentFlowResult, agentFlowTools, agentFlowTrigger, type AgentFlowReference } from "./agent-flow-data";
import styles from "./agent-flow.module.css";

type PanelPlacement = "below" | "above" | "right" | "left" | "fallback";
type PanelPosition = { x: number; y: number; arrow: number; placement: PanelPlacement; fallback: boolean };

function intersects(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

const PANEL_GAP = 14;
const PANEL_INSET = 8;
const COUNT = agentFlowLegend.length;

function MobileStack() {
  const text = (ref: AgentFlowReference) => <span className={styles.stepText} aria-hidden="true">{agentFlowLegend[ref - 1].description}</span>;
  const head = (ref: AgentFlowReference, title: string, icon: Parameters<typeof AgentFlowIconGlyph>[0]["name"]) => <span className={styles.stepHead}>
    <span className={styles.legendBadge}>{ref}</span><AgentFlowIconGlyph name={icon} /><strong>{title}</strong>
  </span>;
  const arrow = <li className={styles.stackArrow} aria-hidden="true" />;
  return <ol className={styles.mobile}>
    <li className={styles.step}>{head(1, agentFlowTrigger.title, agentFlowTrigger.icon)}{text(1)}</li>
    {arrow}
    <li className={styles.agentCard}>
      <span className={styles.agentCardTitle}>{agentFlowLabels.frame}</span>
      <ul className={styles.agentRows}>
        {agentFlowNodes.map((node, index) => <li key={node.title} className={index === 1 ? `${styles.step} ${styles.stepKey}` : styles.step}>
          {head((index + 2) as AgentFlowReference, node.title, node.icon)}{text((index + 2) as AgentFlowReference)}
        </li>)}
      </ul>
      <span className={styles.repeatNote}>Repeats until done</span>
    </li>
    {arrow}
    <li className={styles.toolsRow}>
      <span className={styles.agentCardTitle}>{agentFlowTools.title}</span>
      <span className={styles.chips}>{agentFlowTools.tiles.map(tile => <span key={tile.label}>{tile.label}</span>)}</span>
    </li>
    {arrow}
    <li className={styles.step}>{head(6, agentFlowResult.title, agentFlowResult.icon)}{text(6)}</li>
    <li className={`${styles.step} ${styles.stepDashed}`}>
      <span className={styles.stepHead}><span className={styles.legendBadge}>7</span><strong>{agentFlowGuardrails.title}</strong></span>
      <span className={styles.chips}>{agentFlowGuardrails.chips.map(chip => <span key={chip}>{chip}</span>)}</span>
      {text(7)}
    </li>
  </ol>;
}

export function AgentFlow() {
  const id = useId().replace(/:/g, "");
  const drawingRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerReference = useRef<AgentFlowReference | null>(null);
  const [active, setActive] = useState<AgentFlowReference | null>(null);
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

  const activate = useCallback((reference: AgentFlowReference) => {
    clearTimers();
    setActive(reference);
  }, [clearTimers]);

  const scheduleOpen = useCallback((reference: AgentFlowReference) => {
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
    const members = Array.from(drawing.querySelectorAll<SVGGElement>(`g[data-ref="${active}"]`));
    const rectsOf = (nodes: Element[]) => nodes.map(node => node.getBoundingClientRect()).filter(bounds => bounds.width > 0 && bounds.height > 0);
    const anchors = rectsOf(members.flatMap(node => Array.from(node.querySelectorAll("[data-anchor]"))));
    const avoid = rectsOf(members.flatMap(node => Array.from(node.children)));
    if (!anchors.length) return;

    const group = anchors.reduce((union, bounds) => new DOMRect(
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
    const clampX = (x: number) => Math.min(Math.max(x, PANEL_INSET), wrapper.width - width - PANEL_INSET);
    const candidates: { placement: PanelPlacement; x: number; y: number }[] = [
      { placement: "below", x: clampX(local.centerX - width / 2), y: local.bottom + PANEL_GAP },
      { placement: "above", x: clampX(local.centerX - width / 2), y: local.top - PANEL_GAP - height },
      { placement: "right", x: local.right + PANEL_GAP, y: local.centerY - height / 2 },
      { placement: "left", x: local.left - PANEL_GAP - width, y: local.centerY - height / 2 },
    ];
    const badgeBounds = rectsOf(Array.from(drawing.querySelectorAll("button[data-badge-control]")));
    const selected = candidates.find(candidate => {
      const card = new DOMRect(wrapper.left + candidate.x, wrapper.top + candidate.y, width, height);
      return candidate.x >= PANEL_INSET && candidate.y >= PANEL_INSET
        && candidate.x + width <= wrapper.width - PANEL_INSET
        && candidate.y + height <= wrapper.height - PANEL_INSET
        && !intersects(card, group) && avoid.every(part => !intersects(card, part))
        && badgeBounds.every(badge => !intersects(card, badge));
    });
    if (selected) {
      setPanelPosition({ ...selected, arrow: local.centerX - selected.x, fallback: false });
      return;
    }
    setPanelPosition({ placement: "below", x: clampX(local.centerX - width / 2), y: local.bottom + PANEL_GAP, arrow: local.centerX - clampX(local.centerX - width / 2), fallback: true });
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
    return reference >= 1 && reference <= COUNT ? reference as AgentFlowReference : null;
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

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, reference: AgentFlowReference) {
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
    const next = ((reference - 1 + step + COUNT) % COUNT + 1) as AgentFlowReference;
    activate(next);
    drawingRef.current?.querySelector<HTMLButtonElement>(`button[data-ref="${next}"]`)?.focus();
  }

  return <section id="how-agents-work" className={styles.section} aria-labelledby="agents-work-title"
    data-active={active !== null} data-enhanced={enhanced} data-fine-pointer={finePointer}>
    <Container className={styles.container}>
      <header className={styles.heading} data-reveal="agent-flow-heading">
        <p className={styles.eyebrow}>How it works</p>
        <h2 id="agents-work-title">How Our Agents Work</h2>
        <p className={styles.intro}>Agents can plan and use tools, with human approval where a key action needs review.</p>
      </header>
      <figure className={styles.figure}>
        <div ref={drawingRef} className={styles.drawing} data-reveal="agent-flow-visual"
          onPointerMove={handlePointerMove} onPointerDown={handlePointerDown} onPointerLeave={scheduleClose}
          onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
          <div className={styles.canvas}>
            <div className={styles.desktop}>
              <AgentFlowDiagram active={active} id={`${id}-diagram`} />
              {agentFlowBadges.map(point => <button
                key={point.ref}
                type="button"
                className={styles.badgeControl}
                style={{ left: `${point.x / VIEW_W * 100}%`, top: `${point.y / VIEW_H * 100}%`, width: `${AF.badgeR * 2 / VIEW_W * 100}%` } as CSSProperties}
                aria-label={`Step ${point.ref}: ${agentFlowLegend[point.ref - 1].title}`}
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
          <div ref={panelRef} id={panelId} className={styles.panel} data-open={active !== null} data-placement={panelPosition?.placement ?? "below"}
            style={panelPosition ? { "--panel-x": `${panelPosition.x}px`, "--panel-y": `${panelPosition.y}px`, "--panel-arrow": `${panelPosition.arrow}px` } as CSSProperties : undefined}
            onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}>
            <button type="button" className={styles.closeButton} aria-label="Close" onClick={close}>×</button>
            <ol className={styles.legend} aria-label="Agent workflow steps">
              {agentFlowLegend.map(item => <li key={item.id} data-active={active === item.id}>
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
        <figcaption className={styles.caption}>Illustrative agent workflow with an approval point for key actions. Every agent is designed around your process, tools and controls.</figcaption>
      </figure>
    </Container>
  </section>;
}
