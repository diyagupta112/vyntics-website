export type RagReference = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type RagIcon = "refresh" | "docs" | "ingest" | "chunk" | "embed" | "database" | "chat" | "understand" | "lock" | "search" | "model" | "cited";

export const ragLegend: readonly { id: RagReference; title: string; description: string }[] = [
  { id: 1, title: "Your approved knowledge", description: "Answers come only from content you approve: policies, manuals, contracts, wiki pages, help articles and database records. We agree on which sources are in scope, who owns them and how often they change." },
  { id: 2, title: "Prepare and index", description: "Documents are parsed, including tables and scanned pages, split into meaningful sections and tagged with details such as source, page, date and access level. Each section is converted into a searchable representation of its meaning, and new or changed documents are re-indexed as they arrive." },
  { id: 3, title: "Knowledge index", description: "Meaning-based representations, keywords and source details are stored together in one searchable index. It supports search by meaning and by exact terms, and keeps the link back to the original document and page." },
  { id: 4, title: "Question and access rules", description: "The question is understood and, when useful, rewritten for better search. Access rules decide which documents this person may see, before anything is retrieved." },
  { id: 5, title: "Retrieve and rerank", description: "The index returns the passages most relevant to the question, combining search by meaning with search by exact terms. A reranking step puts the most useful passages first." },
  { id: 6, title: "Grounded answer with sources", description: "The language model receives the question and only the retrieved passages, with instructions to answer from them. The reply cites the source documents and pages, and says so when the knowledge does not contain an answer." },
  { id: 7, title: "Guardrails and monitoring", description: "Access control, source-only answers, citations and quality checks keep responses safe and traceable. Usage logs and feedback show where answers fall short, so the knowledge and settings can be improved." },
];

export const ragStrip = ["Your documents", "Search", "AI answer with sources"] as const;

type Step = { title: string; sub: string; icon: RagIcon };
export const ragDocs = { title: "Your documents", chips: ["Policies and manuals", "PDFs and contracts", "Wikis and help articles", "Databases and tickets"] };
export const ragPrepare: readonly Step[] = [
  { title: "Ingest and parse", sub: "Text, tables, scanned pages", icon: "ingest" },
  { title: "Chunk and tag", sub: "Sections with source, page and access level", icon: "chunk" },
  { title: "Embed", sub: "Searchable representation of meaning", icon: "embed" },
];
export const ragCallout = { title: "Kept up to date", text: "New and changed documents are detected and re-indexed." };
export const ragIndex = { title: "Knowledge index", chips: ["Search by meaning", "Search by keyword", "Source metadata"] };
export const ragAnswer: readonly Step[] = [
  { title: "Your question", sub: "Asked by a signed-in user", icon: "chat" },
  { title: "Understand question", sub: "Clarify and rewrite for better search", icon: "understand" },
  { title: "Access rules", sub: "Filter by what this person may see", icon: "lock" },
  { title: "Retrieve and rerank", sub: "Best passages, most relevant first", icon: "search" },
  { title: "Language model", sub: "Answers from the retrieved passages", icon: "model" },
  { title: "Answer with sources", sub: "Links to documents and pages", icon: "cited" },
];
export const ragLanes = {
  prepare: { label: "Prepare your knowledge", note: "Runs when documents are added or changed" },
  answer: { label: "Answer a question", note: "Runs on every question" },
};
export const ragGuardrails = { title: "Guardrails and monitoring", chips: ["Access control", "Approved sources only", "Citations", "Quality checks", "Usage logs"] };

/** Estimated text width helpers, used to wrap and size text without measuring. */
const charWidth = (size: number, bold: boolean) => size * (bold ? 0.57 : 0.56);
export const ragTextWidth = (text: string, size: number, pad = 0, bold = false) => Math.ceil(text.length * charWidth(size, bold) + pad);
export function ragWrap(text: string, size: number, maxWidth: number, bold = false): string[] {
  const limit = Math.max(1, Math.floor(maxWidth / charWidth(size, bold)));
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > limit && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// Layout constants. One viewBox unit equals one pixel at the full width of the content container (72rem).
// Every connector, badge and label in the diagram is derived from these.
// The descriptive fields above (chips, subtitles, notes, callout text) are kept in the data but not drawn.
export const RG = {
  width: 1152, laneX: 0, laneW: 1152, lanePad: 20, cols: 6, colGap: 24, badgeR: 12, badgeDx: 10,
  laneHeaderH: 44, laneHeaderGap: 16, laneBottomPad: 20, pillH: 28, boxH: 84, indexH: 100,
  laneGap: 24, bandGap: 24, bandH: 56, topPad: 2, bottomPad: 2,
} as const;
export const RG_COL_W = (RG.laneW - 2 * RG.lanePad - (RG.cols - 1) * RG.colGap) / RG.cols;
export const RG_COL_GAP = RG.colGap;
export const ragColX = (index: number) => RG.laneX + RG.lanePad + index * (RG_COL_W + RG.colGap);
export const ragColCx = (index: number) => ragColX(index) + RG_COL_W / 2;

const laneH = RG.laneHeaderH + RG.laneHeaderGap + RG.boxH + RG.laneBottomPad;
const topLaneY = RG.topPad;
const topBoxY = topLaneY + RG.laneHeaderH + RG.laneHeaderGap;
const indexY = topLaneY + laneH + RG.laneGap;
const botLaneY = indexY + RG.indexH + RG.laneGap;
const botContentY = botLaneY + RG.laneHeaderH + RG.laneHeaderGap;
const bandY = botLaneY + laneH + RG.bandGap;
export const RGY = {
  topLaneY, laneH, topBoxY, topMid: topBoxY + RG.boxH / 2, topBoxBottom: topBoxY + RG.boxH,
  indexY, indexBottom: indexY + RG.indexH, botLaneY, botContentY, botMid: botContentY + RG.boxH / 2, botBoxBottom: botContentY + RG.boxH,
  bandY, height: bandY + RG.bandH + RG.bottomPad,
};
/** Badges sit up and left of their element's corner, keeping 8 units clear of the lane pill above them. */
const pillBottom = (RG.laneHeaderH + RG.pillH) / 2;
export const RG_BADGE_DY = RG.laneHeaderH + RG.laneHeaderGap - pillBottom - 8 - RG.badgeR;
export const ragBadges: readonly { ref: RagReference; x: number; y: number }[] = [
  { ref: 1, x: ragColX(0) - RG.badgeDx, y: topBoxY - RG_BADGE_DY }, { ref: 2, x: ragColX(1) - RG.badgeDx, y: topBoxY - RG_BADGE_DY },
  { ref: 3, x: ragColX(3) - RG.badgeDx, y: indexY - RG_BADGE_DY },
  { ref: 4, x: ragColX(0) - RG.badgeDx, y: botContentY - RG_BADGE_DY }, { ref: 5, x: ragColX(3) - RG.badgeDx, y: botContentY - RG_BADGE_DY },
  { ref: 6, x: ragColX(4) - RG.badgeDx, y: botContentY - RG_BADGE_DY },
  { ref: 7, x: RG.laneX + RG.badgeR + 2, y: bandY - RG_BADGE_DY },
];
