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
import { CrmIntegrationDiagram, CrmIntegrationIconGlyph } from "./crm-integration-diagram";
import {
  VIEW_H,
  VIEW_W,
  crmIntegrationLegend,
  crmIntegrationBadges,
  crmIntegrationGeometry,
  crmIntegrationHub,
  crmIntegrationGroups,
  type CrmIntegrationReference,
} from "./crm-integration-data";
import styles from "./crm-integration.module.css";
import { mobileQuery } from "@/lib/breakpoints";

type PanelPlacement = "right" | "left" | "below" | "above" | "fallback";
type PanelPosition = { x: number; y: number; placement: PanelPlacement; fallback: boolean };

const PANEL_GAP = 14;
const PANEL_INSET = 8;
const legendById = (id: CrmIntegrationReference) => crmIntegrationLegend[id - 1];

function intersects(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function Description({ id }: { id: CrmIntegrationReference }) {
  const item = legendById(id);
  return <p className={styles.groupText} aria-hidden="true">
    <span className={styles.legendBadge}>{item.id}</span>
    <span>{item.description}</span>
  </p>;
}

function Arrow() {
  return <span className={styles.stackArrow} aria-hidden="true" />;
}

function MobileStack() {
  const { hub, leftTiles, rightTiles } = crmIntegrationGeometry;
  const groups = [
    { ...crmIntegrationGroups[0], tiles: leftTiles },
    { ...crmIntegrationGroups[1], tiles: rightTiles },
  ];
  return <div className={styles.mobile}>
    <div className={`${styles.group} ${styles.hubGroup}`}>
      <p className={styles.layerName}>Hub</p>
      <p className={styles.hubName}><CrmIntegrationIconGlyph name={crmIntegrationHub.icon} /><span><strong>{crmIntegrationHub.title}</strong><small>{crmIntegrationHub.subtitle}</small></span></p>
      <Description id={1} />
    </div>
    {groups.map(group => <Fragment key={group.label}>
      <Arrow />
      <div className={styles.group}>
        <p className={styles.layerName}>{group.label}</p>
        {group.tiles.map(tile => <div key={tile.ref} className={styles.tileCard}>
          <span className={styles.sourceChip}>
            <CrmIntegrationIconGlyph name={tile.icon} />
            <span><strong>{tile.label}</strong><small>{tile.subtitle}</small></span>
          </span>
          <Description id={tile.ref} />
        </div>)}
      </div>
    </Fragment>)}
  </div>;
}

export function CrmIntegrationArchitecture() {
  const id = useId().replace(/:/g, "");
  const drawingRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerReference = useRef<CrmIntegrationReference | null>(null);
  const [active, setActive] = useState<CrmIntegrationReference | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const panelId = `${id}-architecture-card`;

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

  const activate = useCallback((reference: CrmIntegrationReference) => {
    clearTimers();
    setActive(reference);
  }, [clearTimers]);

  const scheduleOpen = useCallback((reference: CrmIntegrationReference) => {
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
    document.addEventListener("keydown", handleKey);
    if (finePointer) return () => document.removeEventListener("keydown", handleKey);
    const handleOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!drawingRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("pointerdown", handleOutsidePointer);
    };
  }, [active, close, finePointer]);

  const placePanel = useCallback(() => {
    const drawing = drawingRef.current;
    const panel = panelRef.current;
    if (!drawing || !panel || active === null || window.matchMedia(mobileQuery).matches) {
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
        && !intersects(card, group)
        && badgeBounds.every(badge => !intersects(card, badge));
    });
    if (selected) {
      setPanelPosition({ ...selected, fallback: false });
      return;
    }
    // No clear side: pin the card to the half of the drawing the element is not in.
    const groupOnRight = local.centerX > wrapper.width / 2;
    const groupInTop = local.centerY < wrapper.height / 2;
    setPanelPosition({
      x: groupOnRight ? PANEL_INSET : wrapper.width - width - PANEL_INSET,
      y: groupInTop ? wrapper.height - height - PANEL_INSET : PANEL_INSET,
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
    return reference >= 1 && reference <= 6 ? reference as CrmIntegrationReference : null;
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

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, reference: CrmIntegrationReference) {
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
    const next = ((reference - 1 + step + 6) % 6 + 1) as CrmIntegrationReference;
    activate(next);
    drawingRef.current?.querySelector<HTMLButtonElement>(`button[data-ref="${next}"]`)?.focus();
  }

  return <section id="sample-integration-architecture" className={styles.section} aria-labelledby="sample-architecture-title"
    data-active={active !== null} data-enhanced={enhanced} data-fine-pointer={finePointer}>
    <Container className={styles.container}>
      <header className={styles.heading} data-reveal="sample-architecture-heading">
        <p className={styles.eyebrow}>Architecture</p>
        <h2 id="sample-architecture-title">Sample Integration Architecture</h2>
        <p className={styles.intro}>Illustrative system relationships for a CRM connected to the tools your customer teams already use.</p>
      </header>
      <figure className={styles.figure}>
        <div ref={drawingRef} className={styles.drawing} data-reveal="sample-architecture-visual"
          onPointerMove={handlePointerMove} onPointerDown={handlePointerDown} onPointerLeave={scheduleClose}
          onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
          <div className={styles.canvas}>
            <div className={styles.desktop}>
              <CrmIntegrationDiagram active={active} id={`${id}-diagram`} />
              {crmIntegrationBadges.map(point => <button
                key={point.ref}
                type="button"
                className={styles.badgeControl}
                style={{ left: `${point.x / VIEW_W * 100}%`, top: `${point.y / VIEW_H * 100}%`, width: `${30 / VIEW_W * 100}%` } as CSSProperties}
                aria-label={`Point ${point.ref}: ${legendById(point.ref).title}`}
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
            data-placement={panelPosition?.placement ?? "fallback"} data-fallback={panelPosition?.fallback ?? false}
            style={panelPosition ? { "--panel-x": `${panelPosition.x}px`, "--panel-y": `${panelPosition.y}px` } as CSSProperties : undefined}
            onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}>
            <button type="button" className={styles.closeButton} aria-label="Close" onClick={close}>×</button>
            <ol className={styles.legend} aria-label="CRM integration architecture legend">
              {crmIntegrationLegend.map(item => <li key={item.id} data-active={active === item.id}>
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
        <figcaption className={styles.caption}>Illustrative architecture; the final integration design depends on your systems, data, access, and security requirements.</figcaption>
      </figure>
    </Container>
  </section>;
}
