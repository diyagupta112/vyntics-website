export type DataPipelineReference = 1 | 2 | 3 | 4 | 5 | 6;
export type SourceIcon = "crm" | "erp" | "database" | "files" | "api";

export const dataPipelineLegend: readonly { id: DataPipelineReference; title: string; description: string }[] = [
  { id: 1, title: "Source systems", description: "Data starts in the tools your business already runs on: CRMs, ERPs, databases, files and spreadsheets, and third-party APIs. We map each source, its owner and how often it changes before building anything." },
  { id: 2, title: "Batch and real-time ingestion", description: "Batch pipelines pull data on a schedule, and streaming pipelines pick up events as they happen. We match the method to how fresh each dataset needs to be, so real-time is used where it adds value." },
  { id: 3, title: "Landing zone and transformation", description: "Data lands in a raw layer first, so nothing is lost. It is then cleaned, standardized, joined and checked, either before loading (ETL) or after loading inside the warehouse (ELT), depending on the case." },
  { id: 4, title: "Central warehouse", description: "Cleaned, modeled data ends up in one trusted place, ready for reporting, analytics and AI." },
  { id: 5, title: "Orchestration and scheduling", description: "An orchestrator runs each step in the right order, manages dependencies and schedules, and retries steps that fail, so pipelines run without manual work." },
  { id: 6, title: "Monitoring and alerts", description: "Checks on data freshness, row counts and run status alert the team when something looks wrong, so a failed run can be found and fixed before it reaches a report." },
];

export const pipelineSources: readonly { label: string; icon: SourceIcon }[] = [
  { label: "CRM", icon: "crm" }, { label: "ERP", icon: "erp" }, { label: "Databases", icon: "database" },
  { label: "Files and spreadsheets", icon: "files" }, { label: "Third-party APIs", icon: "api" },
];
export const pipelineLanes: readonly { name: string; tag: string; rows: readonly string[] }[] = [
  { name: "Batch", tag: "Scheduled", rows: ["Pull on a schedule", "Incremental loads"] },
  { name: "Real-time", tag: "Streaming", rows: ["Event streams", "Low-latency delivery"] },
];
export const pipelineLanding = { title: "Landing zone", subtitle: "Raw copy of source data" };
export const pipelineTransform = { title: "Transform and validate", pill: "ETL or ELT", rows: ["Clean and standardize", "Join and model", "Quality checks"] };
export const pipelineWarehouse = { title: "Central warehouse", rows: ["Modeled, trusted data", "One source of truth"], pill: "Ready for reporting and AI" };
export const pipelineOrchestration = { title: "Orchestration and scheduling", chips: ["Schedules", "Dependencies", "Retries"] };
export const pipelineMonitoring = { title: "Monitoring and alerts", chips: ["Data freshness", "Row counts", "Run status", "Alerts to the team"] };
export const pipelineZoneLabels = ["Sources", "Ingestion", "Landing and transformation", "Warehouse"] as const;

// Layout constants. Every connector, badge and label in the diagram is derived from these.
export const DP = {
  width: 1100, margin: 16, badgeR: 13,
  tileH: 44, tileGap: 14, laneGap: 24, bandH: 44, bandGap: 44, bandPad: 20,
  headerGap: 36, headerToFlow: 22, collectorOffset: 14,
  widths: { sources: 186, ingestion: 184, landing: 152, transform: 190, warehouse: 196 },
  gaps: { sourcesIngestion: 46, ingestionLanding: 50, landingTransform: 32, transformWarehouse: 32 },
  landingH: 96, transformH: 178, warehouseH: 212, laneRowH: 28, laneRowGap: 6,
} as const;

export const DPX = (() => {
  const { widths: w, gaps: g, margin } = DP;
  const sources = margin;
  const ingestion = sources + w.sources + g.sourcesIngestion;
  const landing = ingestion + w.ingestion + g.ingestionLanding;
  const transform = landing + w.landing + g.landingTransform;
  const warehouse = transform + w.transform + g.transformWarehouse;
  return { sources, ingestion, landing, transform, warehouse, right: warehouse + w.warehouse };
})();

const orchY = 20;
const headerBase = orchY + DP.bandH + DP.headerGap;
const flowTop = headerBase + DP.headerToFlow;
const flowH = pipelineSources.length * DP.tileH + (pipelineSources.length - 1) * DP.tileGap;
const laneH = (flowH - DP.laneGap) / 2;
const flowMid = flowTop + flowH / 2;
const flowBottom = flowTop + flowH;
const monY = flowBottom + DP.bandGap;
export const DPY = {
  orchY, headerBase, flowTop, flowH, flowBottom, flowMid, laneH, monY,
  height: monY + DP.bandH + DP.bandPad,
  transformY: flowMid - DP.transformH / 2, landingY: flowMid - DP.landingH / 2, warehouseY: flowMid - DP.warehouseH / 2,
};
export const dpTileY = (index: number) => flowTop + index * (DP.tileH + DP.tileGap);
export const dpLaneY = (index: number) => flowTop + index * (laneH + DP.laneGap);
/** Estimated text width, used to size pills and chips without measuring. */
export const dpTextWidth = (text: string, size: number, pad = 0) => Math.ceil(text.length * size * 0.56 + pad);

export const dpBadges: readonly { ref: DataPipelineReference; x: number; y: number }[] = [
  { ref: 1, x: DPX.sources, y: flowTop }, { ref: 2, x: DPX.ingestion, y: flowTop }, { ref: 3, x: DPX.landing, y: DPY.landingY },
  { ref: 4, x: DPX.warehouse, y: DPY.warehouseY }, { ref: 5, x: DPX.ingestion, y: orchY }, { ref: 6, x: DPX.ingestion, y: monY },
];
