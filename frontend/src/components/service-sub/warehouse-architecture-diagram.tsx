import type { ReactNode } from "react";
import {
  warehouseBadgePositions,
  warehouseGeometry as g,
  warehouseIngestion,
  VIEW_H,
  VIEW_W,
  type WarehouseIcon,
  type WarehouseReference,
} from "./warehouse-architecture-data";
import styles from "./warehouse-architecture.module.css";

const iconPaths: Record<WarehouseIcon, string> = {
  apps: "M3 4h18v16H3zM3 9h18M7 13h4M7 16h8",
  database: "M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6M3 12c0 4 18 4 18 0",
  files: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6",
  logs: "M3 12h4l3-7 4 14 3-7h4",
  api: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14",
  dashboard: "M3 3v18h18M7 15v3M12 10v8M17 6v12",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l5 5",
  ai: "M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z",
  grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
};

export function WarehouseIconGlyph({ name, className }: { name: WarehouseIcon; className?: string }) {
  return <svg viewBox="0 0 24 24" width={20} height={20} className={className ?? styles.icon} aria-hidden="true" focusable="false"><path d={iconPaths[name]} /></svg>;
}

function Icon({ name, x, y, size = 22 }: { name: WarehouseIcon; x: number; y: number; size?: number }) {
  return <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" className={styles.icon}><path d={iconPaths[name]} /></svg>;
}

function Reference({ refId: reference, active, children }: { refId: WarehouseReference; active: WarehouseReference | null; children: ReactNode }) {
  return <g className={styles.reference} data-ref={reference} data-match={active !== null && active === reference}>{children}</g>;
}

export function WarehouseArchitectureDiagram({ active, id }: { active: WarehouseReference | null; id: string }) {
  const flow = `url(#${id}-flow)`, govern = `url(#${id}-govern)`;
  const flowLine = (d: string) => <path d={d} className={styles.flow} markerEnd={flow} />;
  const { stack, sources, ingestion, storage, serving, band } = g;
  const [raw, cleaned, warehouse] = storage.cards;
  const busStart = serving.tiles[0].cx, busEnd = serving.tiles[serving.tiles.length - 1].cx;
  const cardMid = raw.y + raw.h / 2;

  return <svg className={styles.diagram} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} focusable="false" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>Lakehouse and warehouse architecture from sources to dashboards and AI</title>
    <desc id={`${id}-desc`}>Diagram of a lakehouse and warehouse architecture: structured and unstructured sources feed batch and streaming ingestion into a lakehouse platform with raw and cleaned zones and a modeled warehouse layer, which serves dashboards, analytics, AI and applications, with security and governance across all layers.</desc>
    <defs>
      <marker id={`${id}-flow`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.flowHead} /></marker>
      <marker id={`${id}-govern`} viewBox="0 0 6 6" refX={6} refY={3} markerWidth={6} markerHeight={6} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 6 3 0 6Z" className={styles.governHead} /></marker>
    </defs>

    {g.layerLabels.map(label => <text key={label.text} x={label.x} y={label.y} fontSize={12} className={styles.layerLabel}>{label.text}</text>)}

    <Reference refId={1} active={active}>
      {sources.tiles.map(tile => <g key={tile.label}>
        <rect x={tile.x} y={tile.y} width={tile.w} height={tile.h} rx={10} className={styles.node} />
        <Icon name={tile.icon} x={tile.cx - 11} y={tile.y + 12} />
        <text x={tile.cx} y={tile.y + 54} fontSize={14} textAnchor="middle" className={styles.strong}>{tile.label}</text>
        <text x={tile.cx} y={tile.y + 72} fontSize={12.5} textAnchor="middle" className={styles.mutedText}>{tile.tag}</text>
        {flowLine(`M${tile.cx} ${sources.arrowFrom}V${sources.arrowTo}`)}
      </g>)}
    </Reference>

    <Reference refId={2} active={active}>
      <rect x={ingestion.x} y={ingestion.y} width={ingestion.w} height={ingestion.h} rx={12} className={styles.bar} />
      <text x={ingestion.x + 20} y={ingestion.y + ingestion.h / 2 + 5} fontSize={15} className={styles.strong}>Ingestion</text>
      {ingestion.chips.map((chip, index) => <g key={chip.label}>
        <rect x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={14} className={styles.node} />
        <text x={chip.x + chip.w / 2} y={chip.y + chip.h / 2 + 4.5} fontSize={13} textAnchor="middle">{warehouseIngestion[index]}</text>
      </g>)}
      {flowLine(`M${stack.cx} ${ingestion.arrowFrom}V${ingestion.arrowTo}`)}
    </Reference>

    <Reference refId={3} active={active}>
      <rect x={storage.x} y={storage.y} width={storage.w} height={storage.h} rx={14} className={styles.frame} />
      <text x={storage.x + 20} y={storage.y + 30} fontSize={16} className={styles.strong}>Lakehouse platform</text>
      <rect x={storage.tagX} y={storage.y + 13} width={100} height={24} rx={12} className={styles.tag} />
      <text x={storage.tagX + 50} y={storage.y + 29.5} fontSize={12.5} textAnchor="middle" className={styles.mutedText}>One platform</text>
      {[raw, cleaned].map(card => <g key={card.label}>
        <rect x={card.x} y={card.y} width={card.w} height={card.h} rx={10} className={styles.node} />
        <text x={card.x + card.w / 2} y={card.y + 32} fontSize={15} textAnchor="middle" className={styles.strong}>{card.label}</text>
        <text x={card.x + card.w / 2} y={card.y + 54} fontSize={12.5} textAnchor="middle" className={styles.mutedText}>{card.subtitle}</text>
      </g>)}
      {flowLine(`M${raw.x + raw.w} ${cardMid}H${cleaned.x}`)}
      <rect x={storage.stripX} y={storage.stripY} width={storage.stripW} height={storage.stripH} rx={8} className={styles.strip} />
      <text x={storage.stripX + storage.stripW / 2} y={storage.stripY + storage.stripH / 2 + 4.5} fontSize={13} textAnchor="middle" className={styles.mutedText}>Structured and unstructured data in one platform</text>
    </Reference>

    <Reference refId={4} active={active}>
      <rect x={warehouse.x} y={warehouse.y} width={warehouse.w} height={warehouse.h} rx={10} className={styles.node} />
      <text x={warehouse.x + warehouse.w / 2} y={warehouse.y + 32} fontSize={15} textAnchor="middle" className={styles.strong}>{warehouse.label}</text>
      <text x={warehouse.x + warehouse.w / 2} y={warehouse.y + 54} fontSize={12.5} textAnchor="middle" className={styles.mutedText}>{warehouse.subtitle}</text>
      {flowLine(`M${cleaned.x + cleaned.w} ${cardMid}H${warehouse.x}`)}
    </Reference>

    <Reference refId={5} active={active}>
      {flowLine(`M${stack.cx} ${storage.bottom}V${serving.busY}`)}
      <path d={`M${busStart} ${serving.busY}H${busEnd}`} className={styles.flow} />
      {serving.tiles.map(tile => <g key={tile.label}>
        {flowLine(`M${tile.cx} ${serving.busY}V${tile.y}`)}
        <rect x={tile.x} y={tile.y} width={tile.w} height={tile.h} rx={10} className={styles.node} />
        <Icon name={tile.icon} x={tile.cx - 11} y={tile.y + 12} />
        <text x={tile.cx} y={tile.y + 54} fontSize={14} textAnchor="middle" className={styles.strong}>{tile.label}</text>
      </g>)}
    </Reference>

    <Reference refId={6} active={active}>
      <rect x={band.x} y={band.y} width={band.w} height={band.h} rx={12} className={styles.band} />
      <text x={band.x + 18} y={band.y + 32} fontSize={15} className={styles.strong}>Security and governance</text>
      {band.chips.map(chip => <g key={chip.label}>
        <rect x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={10} className={styles.node} />
        <text x={chip.x + chip.w / 2} y={chip.y + chip.h / 2 + 5} fontSize={14} textAnchor="middle">{chip.label}</text>
      </g>)}
      {g.governanceArrows.map(y => <path key={y} d={`M${band.x} ${y}H${stack.right}`} className={styles.governLine} markerEnd={govern} />)}
    </Reference>

    {warehouseBadgePositions.map(badge => <Reference key={badge.ref} refId={badge.ref} active={active}>
      <circle cx={badge.x} cy={badge.y} r={13} className={styles.badge} />
      <text x={badge.x} y={badge.y + 5} textAnchor="middle" fontSize={14} className={styles.badgeText}>{badge.ref}</text>
    </Reference>)}
  </svg>;
}
