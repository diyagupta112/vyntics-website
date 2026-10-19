export const automationFlowLegend = [
  { id: 1, title: "Document in", description: "A document or file arrives through an inbox, an upload or a connected system. The workflow knows which type of document it is expected to handle before anything else happens." },
  { id: 2, title: "AI extracts data", description: "AI reads the document and pulls out the fields the process needs, such as names, dates and amounts. Each extracted value stays linked to the part of the document it came from." },
  { id: 3, title: "Validation", description: "Extracted values are checked against business rules and your existing data, so incomplete or inconsistent items are caught before they reach a system." },
  { id: 4, title: "System update", description: "Data that passes validation is written to the target system through its API or an integration, in the format that system expects." },
  { id: 5, title: "Human review for exceptions", description: "Anything that fails a check, or that the model is unsure about, goes to a person with the original document and the extracted values side by side. Once resolved, it continues to the system update." },
] as const;

export type AutomationFlowReference = typeof automationFlowLegend[number]["id"];
export type AutomationFlowIcon = "document" | "extract" | "validate" | "update" | "review";

const steps: readonly { titleLines: readonly string[]; subtitleLines: readonly string[]; icon: AutomationFlowIcon }[] = [
  { titleLines: ["Document in"], subtitleLines: ["A document or file", "enters the workflow"], icon: "document" },
  { titleLines: ["AI extracts data"], subtitleLines: ["Reads the document and", "pulls out key fields"], icon: "extract" },
  { titleLines: ["Validation"], subtitleLines: ["Checks fields against", "rules and your data"], icon: "validate" },
  { titleLines: ["System update"], subtitleLines: ["Approved data goes to", "the target system"], icon: "update" },
  { titleLines: ["Human review", "for exceptions"], subtitleLines: ["Items that fail checks", "go to a person"], icon: "review" },
];

/*
 * Layout constants. Main row: steps 1 to 4. The exceptions step sits one row
 * below the Validation step. Tiles, connectors, labels and badges are derived
 * from these values so every arrow meets a tile edge exactly.
 */
export const VIEW_W = 1100;
const X0 = 18;
const TILE_W = 206;
const TILE_H = 134;
const ROW_1_Y = 34;
const ROW_GAP = 56;
const ROW_2_Y = ROW_1_Y + TILE_H + ROW_GAP;
const MAIN = 4;
const COL_GAP = (VIEW_W - X0 * 2 - TILE_W * MAIN) / (MAIN - 1);
export const VIEW_H = ROW_2_Y + TILE_H + 16;

export const automationFlowTiles = steps.map((step, index) => {
  const column = index < MAIN ? index : 2;
  const x = X0 + column * (TILE_W + COL_GAP);
  const y = index < MAIN ? ROW_1_Y : ROW_2_Y;
  return { ...step, ref: (index + 1) as AutomationFlowReference, x, y, w: TILE_W, h: TILE_H, cx: x + TILE_W / 2, cy: y + TILE_H / 2, exception: index === MAIN };
});

const [, , validation, update, review] = automationFlowTiles;
export const automationFlowConnectors = {
  rowArrowY: ROW_1_Y + TILE_H / 2,
  toReview: { x: validation.cx, from: validation.y + validation.h, to: review.y },
  fromReview: { y: review.cy, from: review.x + review.w, x: update.cx, to: update.y + update.h },
};
export const automationFlowBadges = automationFlowTiles.map(tile => ({ ref: tile.ref, x: tile.x, y: tile.y }));
