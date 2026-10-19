export const warehouseArchitectureLegend = [
  { id: 1, title: "Source systems", description: "Structured data from business apps and databases sits alongside unstructured and semi-structured data such as documents, logs and event streams. Traditional warehouses are built mainly for the first kind, which is where a lakehouse helps." },
  { id: 2, title: "Ingestion", description: "Batch loads, streaming and incremental updates bring data into the platform on the schedule each dataset needs. These flows are built as pipelines, with monitoring and retries." },
  { id: 3, title: "Lakehouse storage: raw and cleaned", description: "Everything lands first as a raw copy, in one place for both structured and unstructured data. A cleaned layer standardizes formats and removes duplicates, so downstream users start from consistent data." },
  { id: 4, title: "Warehouse layer", description: "Business-ready tables are modeled around how your teams report and analyze, with agreed definitions for key numbers. We tune performance and cost here so queries stay fast as data grows." },
  { id: 5, title: "Serving: dashboards and AI", description: "The same governed data feeds dashboards and reports, self-service analytics, machine learning and AI applications, so every team works from one source of truth." },
  { id: 6, title: "Security and governance", description: "Access control, a data catalog, lineage and encryption apply across every layer, so people see only the data they should and every number can be traced back to its source." },
] as const;

export type WarehouseReference = typeof warehouseArchitectureLegend[number]["id"];
export type WarehouseIcon = "apps" | "database" | "files" | "logs" | "api" | "dashboard" | "search" | "ai" | "grid";

export const warehouseSources: readonly { label: string; tag: string; icon: WarehouseIcon }[] = [
  { label: "Business apps", tag: "Structured", icon: "apps" },
  { label: "Databases", tag: "Structured", icon: "database" },
  { label: "Files and documents", tag: "Unstructured", icon: "files" },
  { label: "Logs and events", tag: "Semi-structured", icon: "logs" },
  { label: "Third-party APIs", tag: "Semi-structured", icon: "api" },
];
export const warehouseIngestion = ["Batch", "Streaming", "Incremental loads"] as const;
export const warehouseStorage = [
  { label: "Raw", subtitle: "Original data, unchanged" },
  { label: "Cleaned", subtitle: "Standardized and deduplicated" },
  { label: "Warehouse layer", subtitle: "Modeled, business-ready tables" },
] as const;
export const warehouseServing: readonly { label: string; icon: WarehouseIcon }[] = [
  { label: "Dashboards and reports", icon: "dashboard" },
  { label: "Self-service analytics", icon: "search" },
  { label: "AI and machine learning", icon: "ai" },
  { label: "Applications and APIs", icon: "grid" },
];
export const warehouseGovernance = ["Access control", "Data catalog", "Lineage", "Encryption"] as const;

/*
 * Layout constants. Every rectangle, connector, label and badge in the desktop
 * diagram is derived from these values, so arrows always meet box edges.
 */
export const VIEW_W = 1100;
const X0 = 18;
const STACK_W = 808;
const STACK_R = X0 + STACK_W;
const STACK_CX = X0 + STACK_W / 2;
const BAND_X = 856;
const BAND_W = 238;
const LAYER_GAP = 34;
const TILE_GAP = 12;

const SRC_Y = 28, SRC_H = 84;
const ING_Y = SRC_Y + SRC_H + LAYER_GAP, ING_H = 56;
const STO_Y = ING_Y + ING_H + LAYER_GAP, STO_H = 188;
const BUS_Y = STO_Y + STO_H + 30;
const SRV_Y = BUS_Y + 30, SRV_H = 76;
const BAND_Y = ING_Y, BAND_H = SRV_Y + SRV_H - BAND_Y;
export const VIEW_H = SRV_Y + SRV_H + 12;

const srcW = (STACK_W - TILE_GAP * (warehouseSources.length - 1)) / warehouseSources.length;
const srvW = (STACK_W - TILE_GAP * (warehouseServing.length - 1)) / warehouseServing.length;
const STO_PAD = 20, CARD_GAP = 44, CARD_Y = STO_Y + 48, CARD_H = 76;
const cardW = (STACK_W - STO_PAD * 2 - CARD_GAP * 2) / 3;
const CHIP_H = 28, CHIP_GAP = 12;
const ingestionChipWidths = [76, 104, 150];
const GOV_CHIP_H = 48, GOV_PAD = 18, GOV_TOP = 54, GOV_BOTTOM = 22;

const sourceTiles = warehouseSources.map((item, index) => {
  const x = X0 + index * (srcW + TILE_GAP);
  return { ...item, x, y: SRC_Y, w: srcW, h: SRC_H, cx: x + srcW / 2 };
});
const servingTiles = warehouseServing.map((item, index) => {
  const x = X0 + index * (srvW + TILE_GAP);
  return { ...item, x, y: SRV_Y, w: srvW, h: SRV_H, cx: x + srvW / 2 };
});
const storageCards = warehouseStorage.map((item, index) => ({
  ...item, x: X0 + STO_PAD + index * (cardW + CARD_GAP), y: CARD_Y, w: cardW, h: CARD_H,
}));
let chipX = X0 + 130;
const ingestionChips = warehouseIngestion.map((label, index) => {
  const chip = { label, x: chipX, y: ING_Y + (ING_H - CHIP_H) / 2, w: ingestionChipWidths[index], h: CHIP_H };
  chipX += chip.w + CHIP_GAP;
  return chip;
});
const govGap = (BAND_H - GOV_TOP - GOV_BOTTOM - GOV_CHIP_H * warehouseGovernance.length) / (warehouseGovernance.length - 1);
const governanceChips = warehouseGovernance.map((label, index) => ({
  label, x: BAND_X + GOV_PAD, y: BAND_Y + GOV_TOP + index * (GOV_CHIP_H + govGap), w: BAND_W - GOV_PAD * 2, h: GOV_CHIP_H,
}));

export const warehouseGeometry = {
  stack: { x: X0, w: STACK_W, right: STACK_R, cx: STACK_CX },
  sources: { y: SRC_Y, h: SRC_H, tiles: sourceTiles, arrowFrom: SRC_Y + SRC_H, arrowTo: ING_Y },
  ingestion: { x: X0, y: ING_Y, w: STACK_W, h: ING_H, chips: ingestionChips, arrowFrom: ING_Y + ING_H, arrowTo: STO_Y },
  storage: {
    x: X0, y: STO_Y, w: STACK_W, h: STO_H, cards: storageCards, cardGap: CARD_GAP,
    stripX: X0 + STO_PAD, stripY: CARD_Y + CARD_H + 12, stripW: STACK_W - STO_PAD * 2, stripH: 36,
    bottom: STO_Y + STO_H, tagX: X0 + 190,
  },
  serving: { y: SRV_Y, h: SRV_H, busY: BUS_Y, tiles: servingTiles },
  band: { x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H, chips: governanceChips },
  layerLabels: [
    { text: "Sources", x: X0 + 20, y: SRC_Y - 10 },
    { text: "Storage", x: X0 + 20, y: STO_Y - 10 },
    { text: "Serving", x: X0 + 20, y: BUS_Y - 8 },
  ],
  governanceArrows: [ING_Y + ING_H / 2, STO_Y + STO_H / 2, SRV_Y + SRV_H / 2],
} as const;

// Numbered badges sit on the top-left corner of the element they describe.
export const warehouseBadgePositions: readonly { ref: WarehouseReference; x: number; y: number }[] = [
  { ref: 1, x: X0, y: SRC_Y },
  { ref: 2, x: X0, y: ING_Y },
  { ref: 3, x: storageCards[0].x, y: CARD_Y },
  { ref: 4, x: storageCards[2].x, y: CARD_Y },
  { ref: 5, x: X0, y: SRV_Y },
  { ref: 6, x: BAND_X, y: BAND_Y },
];
