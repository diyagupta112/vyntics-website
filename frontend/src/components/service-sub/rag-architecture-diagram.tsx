import type { ReactNode } from "react";
import {
  RG, RGY, RG_COL_GAP, RG_COL_W, ragAnswer, ragBadges, ragCallout, ragColCx, ragColX, ragDocs, ragGuardrails, ragIndex,
  ragLanes, ragPrepare, ragTextWidth, ragWrap, type RagIcon, type RagReference,
} from "./rag-architecture-data";
import styles from "./rag-architecture.module.css";

const iconPaths: Record<RagIcon, string> = {
  refresh: "M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5",
  docs: "M8 3h9l4 4v12H8zM4 7v14h12M12 12h5M12 16h5",
  ingest: "M6 2h9l5 5v15H6zM15 2v5h5M9 13h8M9 17h8",
  chunk: "M4 5h16M4 10h10M4 15h16M4 20h10",
  embed: "M12 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM5 16a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM19 16a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 8l-6 8M12 8l6 8",
  database: "M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6M3 12c0 4 18 4 18 0",
  chat: "M4 4h16v12H10l-6 5z",
  understand: "M12 3v4M12 17v4M3 12h4M17 12h4M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2",
  lock: "M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4M12 14v3",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM15 15l6 6",
  model: "M9 9h6v6H9zM4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2",
  cited: "M4 4h16v16H4zM8 12l3 3 5-6",
};

const TITLE = 16, TITLE_LH = 20, ICON = 24, ICON_GAP = 10, PAD = 14, DESC = "Diagram of a retrieval-augmented generation architecture: documents are parsed, split into sections, embedded and stored in a knowledge index; a user question passes access rules, retrieves and reranks relevant passages, and a language model generates an answer with citations, with guardrails and monitoring across the system.";

function Icon({ name, x, y, size }: { name: RagIcon; x: number; y: number; size: number }) {
  return <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" className={styles.icon}><path d={iconPaths[name]} /></svg>;
}

function Hotspot({ refId, active, children }: { refId: RagReference; active: RagReference | null; children: ReactNode }) {
  return <g className={styles.reference} data-ref={refId} data-match={active !== null && active === refId}>{children}</g>;
}

export function RagArchitectureDiagram({ active, id }: { active: RagReference | null; id: string }) {
  const blue = `url(#${id}-blue)`, gray = `url(#${id}-gray)`;
  const colW = RG_COL_W, { boxH } = RG;
  const link = (d: string, kind: "flow" | "dashed") => <g>
    <path d={d} className={styles.hit} />
    <path d={d} className={kind === "flow" ? styles.flow : styles.dashedLink} markerEnd={kind === "flow" ? blue : gray} />
  </g>;
  const badge = (ref: RagReference) => {
    const b = ragBadges.find(item => item.ref === ref)!;
    return <g className={styles.badgeGroup}>
      <circle cx={b.x} cy={b.y} r={RG.badgeR} className={styles.badge} />
      <text x={b.x} y={b.y + 4.5} textAnchor="middle" fontSize={13} className={styles.badgeText}>{ref}</text>
    </g>;
  };
  /** Icon on the left, wrapped title to its right, vertically centered inside a box. */
  const content = (x: number, y: number, width: number, height: number, title: string, icon: RagIcon) => {
    const textX = x + PAD + ICON + ICON_GAP;
    const titleLines = ragWrap(title, TITLE, width - 2 * PAD - ICON - ICON_GAP, true);
    const top = y + (height - titleLines.length * TITLE_LH) / 2;
    return <>
      <Icon name={icon} x={x + PAD} y={y + (height - ICON) / 2} size={ICON} />
      <text x={textX} y={top + 15} fontSize={TITLE} fontWeight={600}>
        {titleLines.map((line, index) => <tspan key={line} x={textX} dy={index ? TITLE_LH : 0}>{line}</tspan>)}
      </text>
    </>;
  };
  const box = (x: number, y: number, title: string, icon: RagIcon, className = styles.box, chip?: string) => <g key={title}>
    <rect x={x} y={y} width={colW} height={boxH} rx={12} className={className} data-anchor />
    {content(x, y, colW, boxH, title, icon)}
    {chip && (() => { const width = ragTextWidth(chip, 12, 18); return <g><rect x={x + colW - PAD - width} y={y - 10} width={width} height={20} rx={10} className={styles.chipBlue} /><text x={x + colW - PAD - width / 2} y={y + 4} fontSize={12} textAnchor="middle" className={styles.chipBlueText}>{chip}</text></g>; })()}
  </g>;
  const lane = (y: number, label: string) => {
    const pillW = ragTextWidth(label, 14, 32, true), pillY = y + (RG.laneHeaderH - RG.pillH) / 2;
    return <g>
      <rect x={RG.laneX} y={y} width={RG.laneW} height={RGY.laneH} rx={14} className={styles.lane} />
      <rect x={RG.laneX + 16} y={pillY} width={pillW} height={RG.pillH} rx={RG.pillH / 2} className={styles.laneLabel} />
      <text x={RG.laneX + 16 + pillW / 2} y={pillY + 19} fontSize={14} fontWeight={600} textAnchor="middle">{label}</text>
    </g>;
  };
  const edgeRight = (index: number) => ragColX(index) + colW;
  const topY = RGY.topMid, botY = RGY.botMid;
  const guardChips = (() => {
    let cursor = RG.laneX + 16 + ragTextWidth(ragGuardrails.title, 14, 0, true) + 24;
    return ragGuardrails.chips.map(label => {
      const width = ragTextWidth(label, 13, 24), at = cursor;
      cursor += width + 10;
      return <g key={label}>
        <rect x={at} y={RGY.bandY + (RG.bandH - 28) / 2} width={width} height={28} rx={14} className={styles.chip} />
        <text x={at + width / 2} y={RGY.bandY + RG.bandH / 2 + 4.5} fontSize={13} textAnchor="middle">{label}</text>
      </g>;
    });
  })();
  const dashed = (index: number) => link(`M${ragColCx(index)} ${RGY.bandY}V${RGY.botBoxBottom}`, "dashed");

  return <>
    <span id={`${id}-desc`} className={styles.srOnly}>{DESC}</span>
    <svg className={styles.diagram} viewBox={`0 0 ${RG.width} ${RGY.height}`} focusable="false" role="img" aria-label="Retrieval-augmented generation (RAG) architecture" aria-describedby={`${id}-desc`}>
    <defs>
      <marker id={`${id}-blue`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.blueFill} /></marker>
      <marker id={`${id}-gray`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.grayFill} /></marker>
    </defs>

    {lane(RGY.topLaneY, ragLanes.prepare.label)}
    {lane(RGY.botLaneY, ragLanes.answer.label)}

    <Hotspot refId={1} active={active}>
      {box(ragColX(0), RGY.topBoxY, ragDocs.title, "docs")}
      <rect x={ragColX(4)} y={RGY.topBoxY} width={2 * colW + RG_COL_GAP} height={boxH} rx={12} className={styles.callout} data-anchor />
      {content(ragColX(4), RGY.topBoxY, 2 * colW + RG_COL_GAP, boxH, ragCallout.title, "refresh")}
      {badge(1)}
    </Hotspot>

    <Hotspot refId={2} active={active}>
      {link(`M${edgeRight(0)} ${topY}H${ragColX(1)}`, "flow")}
      {ragPrepare.map((step, index) => <g key={step.title}>
        {box(ragColX(index + 1), RGY.topBoxY, step.title, step.icon)}
        {index < ragPrepare.length - 1 && link(`M${edgeRight(index + 1)} ${topY}H${ragColX(index + 2)}`, "flow")}
      </g>)}
      {badge(2)}
    </Hotspot>

    <Hotspot refId={3} active={active}>
      {link(`M${ragColCx(3)} ${RGY.topBoxBottom}V${RGY.indexY}`, "flow")}
      <text x={ragColCx(3) + 10} y={RGY.indexY - 8} fontSize={13} className={styles.mutedText}>Store</text>
      {link(`M${ragColCx(3)} ${RGY.indexBottom}V${RGY.botContentY}`, "flow")}
      <text x={ragColCx(3) + 10} y={RGY.indexBottom + 17} fontSize={13} className={styles.mutedText}>Search</text>
      <rect x={ragColX(3)} y={RGY.indexY} width={colW} height={RG.indexH} rx={12} className={styles.frame} data-anchor />
      {content(ragColX(3), RGY.indexY, colW, RG.indexH, ragIndex.title, "database")}
      {badge(3)}
    </Hotspot>

    <Hotspot refId={4} active={active}>
      {ragAnswer.slice(0, 3).map((step, index) => <g key={step.title}>
        {box(ragColX(index), RGY.botContentY, step.title, step.icon)}
        {index < 2 && link(`M${edgeRight(index)} ${botY}H${ragColX(index + 1)}`, "flow")}
      </g>)}
      {badge(4)}
    </Hotspot>

    <Hotspot refId={5} active={active}>
      {link(`M${edgeRight(2)} ${botY}H${ragColX(3)}`, "flow")}
      {box(ragColX(3), RGY.botContentY, ragAnswer[3].title, ragAnswer[3].icon)}
      {badge(5)}
    </Hotspot>

    <Hotspot refId={6} active={active}>
      {link(`M${edgeRight(3)} ${botY}H${ragColX(4)}`, "flow")}
      {box(ragColX(4), RGY.botContentY, ragAnswer[4].title, ragAnswer[4].icon)}
      {link(`M${edgeRight(4)} ${botY}H${ragColX(5)}`, "flow")}
      {box(ragColX(5), RGY.botContentY, ragAnswer[5].title, ragAnswer[5].icon, styles.boxBlue, "Cited")}
      {badge(6)}
    </Hotspot>

    <Hotspot refId={7} active={active}>
      <rect x={RG.laneX} y={RGY.bandY} width={RG.laneW} height={RG.bandH} rx={12} className={styles.band} data-anchor />
      <text x={RG.laneX + 16} y={RGY.bandY + RG.bandH / 2 + 5} fontSize={14} fontWeight={600}>{ragGuardrails.title}</text>
      {guardChips}
      {dashed(2)}{dashed(4)}{dashed(5)}
      {badge(7)}
    </Hotspot>
    </svg>
  </>;
}
