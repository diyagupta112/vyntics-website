import type { ReactNode } from "react";
import {
  DP, DPX, DPY, dpBadges, dpLaneY, dpTextWidth, dpTileY, pipelineLanding, pipelineLanes, pipelineMonitoring,
  pipelineOrchestration, pipelineSources, pipelineTransform, pipelineWarehouse, pipelineZoneLabels,
  type DataPipelineReference, type SourceIcon,
} from "./data-pipeline-architecture-data";
import styles from "./data-pipeline-architecture.module.css";

const iconPaths: Record<SourceIcon, string> = {
  crm: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7",
  erp: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  database: "M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6M3 12c0 4 18 4 18 0",
  files: "M6 2h9l5 5v15H6zM15 2v5h5M9 13h8M9 17h8",
  api: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
};

function Icon({ name, x, y, size }: { name: SourceIcon; x: number; y: number; size: number }) {
  return <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" className={styles.icon}><path d={iconPaths[name]} /></svg>;
}

function Hotspot({ refId, active, children }: { refId: DataPipelineReference; active: DataPipelineReference | null; children: ReactNode }) {
  return <g className={styles.reference} data-ref={refId} data-match={active !== null && active === refId}>{children}</g>;
}

export function DataPipelineDiagram({ active, id }: { active: DataPipelineReference | null; id: string }) {
  const blue = `url(#${id}-blue)`, gray = `url(#${id}-gray)`;
  const { widths: w } = DP;
  const flowMid = DPY.flowMid;
  const laneMid = (index: number) => dpLaneY(index) + DPY.laneH / 2;
  const sourcesRight = DPX.sources + w.sources;
  const collectorX = sourcesRight + DP.collectorOffset;
  const elbowX = (collectorX + DPX.ingestion) / 2;
  const laneRight = DPX.ingestion + w.ingestion;
  const mergeX = laneRight + (DPX.landing - laneRight) / 2;
  const landingRight = DPX.landing + w.landing, transformRight = DPX.transform + w.transform;
  const laneCx = DPX.ingestion + w.ingestion / 2, transformCx = DPX.transform + w.transform / 2, warehouseCx = DPX.warehouse + w.warehouse / 2;
  const orchBottom = DPY.orchY + DP.bandH;
  const bandX = DPX.ingestion, orchW = transformRight - bandX, monW = DPX.right - bandX;

  const link = (d: string, kind: "flow" | "dashed" | "thin", head = true) => <g>
    <path d={d} className={styles.hit} />
    <path d={d} className={kind === "flow" ? styles.flow : kind === "dashed" ? styles.dashedLink : styles.thin} markerEnd={head ? (kind === "dashed" ? gray : blue) : undefined} />
  </g>;
  const badge = (ref: DataPipelineReference) => {
    const b = dpBadges.find(item => item.ref === ref)!;
    return <g className={styles.badgeGroup}>
      <circle cx={b.x} cy={b.y} r={DP.badgeR} className={styles.badge} />
      <text x={b.x} y={b.y + 5} textAnchor="middle" fontSize={14} className={styles.badgeText}>{ref}</text>
    </g>;
  };
  const chips = (x: number, y: number, labels: readonly string[]) => {
    let cursor = x;
    return labels.map(label => {
      const width = dpTextWidth(label, 13, 22), at = cursor;
      cursor += width + 10;
      return <g key={label}>
        <rect x={at} y={y} width={width} height={26} rx={13} className={styles.chip} />
        <text x={at + width / 2} y={y + 17.5} fontSize={13} textAnchor="middle">{label}</text>
      </g>;
    });
  };
  const band = (ref: DataPipelineReference, y: number, width: number, title: string, items: readonly string[], connectors: ReactNode) =>
    <Hotspot refId={ref} active={active}>
      <rect x={bandX} y={y} width={width} height={DP.bandH} rx={12} className={styles.band} data-anchor />
      <text x={bandX + 16} y={y + 27} fontSize={13} fontWeight={700}>{title}</text>
      {chips(bandX + 16 + dpTextWidth(title, 13, 0) + 26, y + 9, items)}
      {connectors}
      {badge(ref)}
    </Hotspot>;
  const rowBox = (x: number, y: number, width: number, label: string, className = styles.row) => <g key={label}>
    <rect x={x} y={y} width={width} height={DP.laneRowH} rx={8} className={className} />
    <circle cx={x + 12} cy={y + DP.laneRowH / 2} r={3} className={styles.dot} />
    <text x={x + 24} y={y + DP.laneRowH / 2 + 4.5} fontSize={13}>{label}</text>
  </g>;
  const pill = (x: number, y: number, label: string, size = 12) => {
    const width = dpTextWidth(label, size, 18);
    return <g><rect x={x} y={y} width={width} height={22} rx={11} className={styles.tag} /><text x={x + width / 2} y={y + 15} fontSize={size} textAnchor="middle" className={styles.mutedText}>{label}</text></g>;
  };

  return <svg className={styles.diagram} viewBox={`0 0 ${DP.width} ${DPY.height}`} focusable="false" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>Data pipeline architecture from sources to the warehouse</title>
    <desc id={`${id}-desc`}>Diagram of a data pipeline architecture: CRM, ERP, database, file and API sources feed batch and real-time ingestion, land in a raw layer, are transformed and validated, and load into a central warehouse, with orchestration and monitoring across the pipeline.</desc>
    <defs>
      <marker id={`${id}-blue`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.blueFill} /></marker>
      <marker id={`${id}-gray`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.grayFill} /></marker>
    </defs>

    {[DPX.sources, DPX.ingestion, DPX.landing, DPX.warehouse].map((x, index) =>
      <text key={pipelineZoneLabels[index]} x={x} y={DPY.headerBase} fontSize={12} className={`${styles.zoneLabel} ${styles.mutedText}`}>{pipelineZoneLabels[index].toUpperCase()}</text>)}

    <Hotspot refId={1} active={active}>
      {pipelineSources.map((source, index) => {
        const y = dpTileY(index), mid = y + DP.tileH / 2;
        return <g key={source.label}>
          <rect x={DPX.sources} y={y} width={w.sources} height={DP.tileH} rx={10} className={styles.tile} data-anchor />
          <Icon name={source.icon} x={DPX.sources + 16} y={mid - 12} size={24} />
          <text x={DPX.sources + 50} y={mid + 4.5} fontSize={13}>{source.label}</text>
          {link(`M${sourcesRight} ${mid}H${collectorX}`, "thin", false)}
          <circle cx={collectorX} cy={mid} r={3} className={styles.collectorDot} />
        </g>;
      })}
      {link(`M${collectorX} ${dpTileY(0) + DP.tileH / 2}V${dpTileY(pipelineSources.length - 1) + DP.tileH / 2}`, "thin", false)}
      {badge(1)}
    </Hotspot>

    <Hotspot refId={2} active={active}>
      {pipelineLanes.map((lane, index) => {
        const y = dpLaneY(index), tagW = dpTextWidth(lane.tag, 12, 18);
        return <g key={lane.name}>
          <rect x={DPX.ingestion} y={y} width={w.ingestion} height={DPY.laneH} rx={12} className={styles.lane} data-anchor />
          <text x={DPX.ingestion + 16} y={y + 28} fontSize={15} fontWeight={700}>{lane.name}</text>
          {pill(DPX.ingestion + w.ingestion - 14 - tagW, y + 11, lane.tag)}
          {lane.rows.map((row, rowIndex) => rowBox(DPX.ingestion + 14, y + 46 + rowIndex * (DP.laneRowH + DP.laneRowGap), w.ingestion - 28, row, styles.rowOnLane))}
          {link(`M${collectorX} ${flowMid}H${elbowX}V${laneMid(index)}H${DPX.ingestion}`, "flow")}
        </g>;
      })}
      {badge(2)}
    </Hotspot>

    <Hotspot refId={3} active={active}>
      {link(`M${laneRight} ${laneMid(0)}H${mergeX}V${flowMid}`, "flow", false)}
      {link(`M${laneRight} ${laneMid(1)}H${mergeX}V${flowMid}`, "flow", false)}
      <circle cx={mergeX} cy={flowMid} r={3.5} className={styles.mergeDot} />
      {link(`M${mergeX} ${flowMid}H${DPX.landing}`, "flow")}
      <rect x={DPX.landing} y={DPY.landingY} width={w.landing} height={DP.landingH} rx={12} className={styles.box} data-anchor />
      <text x={DPX.landing + 16} y={DPY.landingY + 34} fontSize={15} fontWeight={700}>{pipelineLanding.title}</text>
      <text x={DPX.landing + 16} y={DPY.landingY + 58} fontSize={12} className={styles.mutedText}>{pipelineLanding.subtitle}</text>
      {link(`M${landingRight} ${flowMid}H${DPX.transform}`, "flow")}
      <rect x={DPX.transform} y={DPY.transformY} width={w.transform} height={DP.transformH} rx={12} className={styles.box} data-anchor />
      <text x={DPX.transform + 14} y={DPY.transformY + 28} fontSize={14} fontWeight={700}>{pipelineTransform.title}</text>
      {pill(DPX.transform + 14, DPY.transformY + 40, pipelineTransform.pill)}
      {pipelineTransform.rows.map((row, index) => rowBox(DPX.transform + 12, DPY.transformY + 74 + index * 32, w.transform - 24, row))}
      {badge(3)}
    </Hotspot>

    <Hotspot refId={4} active={active}>
      {link(`M${transformRight} ${flowMid}H${DPX.warehouse}`, "flow")}
      <rect x={DPX.warehouse} y={DPY.warehouseY} width={w.warehouse} height={DP.warehouseH} rx={14} className={styles.frame} data-anchor />
      <svg x={warehouseCx - 16} y={DPY.warehouseY + 16} width={32} height={32} viewBox="0 0 24 24" className={styles.icon}><path d={iconPaths.database} /></svg>
      <text x={warehouseCx} y={DPY.warehouseY + 76} fontSize={15} fontWeight={700} textAnchor="middle">{pipelineWarehouse.title}</text>
      {pipelineWarehouse.rows.map((row, index) => rowBox(DPX.warehouse + 14, DPY.warehouseY + 92 + index * 34, w.warehouse - 28, row, styles.rowOnFrame))}
      {(() => { const width = dpTextWidth(pipelineWarehouse.pill, 12, 18); return <g><rect x={warehouseCx - width / 2} y={DPY.warehouseY + 172} width={width} height={24} rx={12} className={styles.footerPill} /><text x={warehouseCx} y={DPY.warehouseY + 188} fontSize={12} textAnchor="middle" className={styles.footerText}>{pipelineWarehouse.pill}</text></g>; })()}
      {badge(4)}
    </Hotspot>

    {band(5, DPY.orchY, orchW, pipelineOrchestration.title, pipelineOrchestration.chips, <>
      {link(`M${laneCx} ${orchBottom}V${DPY.flowTop}`, "dashed")}
      {link(`M${transformCx} ${orchBottom}V${DPY.transformY}`, "dashed")}
    </>)}
    {band(6, DPY.monY, monW, pipelineMonitoring.title, pipelineMonitoring.chips, <>
      {link(`M${laneCx} ${DPY.monY}V${dpLaneY(1) + DPY.laneH}`, "dashed")}
      {link(`M${transformCx} ${DPY.monY}V${DPY.transformY + DP.transformH}`, "dashed")}
      {link(`M${warehouseCx} ${DPY.monY}V${DPY.warehouseY + DP.warehouseH}`, "dashed")}
    </>)}
  </svg>;
}
