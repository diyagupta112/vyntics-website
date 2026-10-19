export const agentFlowLegend = [
  { id: 1, title: "Trigger", description: "A person's request, a new email or record, or a schedule starts the agent. We define what can start it and what information it receives." },
  { id: 2, title: "Plan", description: "The agent breaks the goal into steps and decides which tools and information each step needs, using only the context it has been given." },
  { id: 3, title: "Human approval", description: "Before a key action runs, such as sending a message or changing a record, the agent pauses and asks a person to approve, edit or reject it. You decide which actions need review." },
  { id: 4, title: "Act with tools", description: "Approved steps run through the tools and systems the agent has been given access to, such as your business applications, knowledge base, email or APIs, with only the permissions you grant." },
  { id: 5, title: "Check and repeat", description: "The agent checks each result against the goal, adjusts the plan if something failed or is missing, and repeats until the task is done or it needs to hand over to a person." },
  { id: 6, title: "Result and trace", description: "The finished work is delivered together with a trace of what the agent did, which tools it used and what was approved, so people can review it." },
  { id: 7, title: "Guardrails and audit trail", description: "Permissions, action limits and logs keep the agent inside clear boundaries, and every step can be traced afterward." },
] as const;

export type AgentFlowReference = typeof agentFlowLegend[number]["id"];
export type AgentFlowIcon = "trigger" | "plan" | "approval" | "tools" | "check" | "result" | "apps" | "knowledge" | "email";

export const agentFlowNodes: readonly { title: string; icon: AgentFlowIcon }[] = [
  { title: "Plan", icon: "plan" }, { title: "Human approval", icon: "approval" },
  { title: "Act with tools", icon: "tools" }, { title: "Check result", icon: "check" },
];
export const agentFlowTrigger = { title: "Trigger", icon: "trigger" as AgentFlowIcon };
export const agentFlowResult = { title: "Result and trace", icon: "result" as AgentFlowIcon };
export const agentFlowTools = { title: "Tools and systems", tiles: [
  { label: "Business apps", icon: "apps" as AgentFlowIcon }, { label: "Knowledge base", icon: "knowledge" as AgentFlowIcon }, { label: "Email and APIs", icon: "email" as AgentFlowIcon },
] };
export const agentFlowGuardrails = { title: "Guardrails and audit trail", chips: ["Permissions", "Action limits", "Logs and trace"] };
export const agentFlowLabels = { frame: "AI agent", loop: "Repeat until done", approved: "Approved", rejected: "Rejected", uses: "Uses" };

/** Estimated text width helpers, used to wrap and size text without measuring. */
const charWidth = (size: number, bold: boolean) => size * (bold ? 0.57 : 0.54);
export const agentTextWidth = (text: string, size: number, pad = 0, bold = false) => Math.ceil(text.length * charWidth(size, bold) + pad);
export function agentWrap(text: string, size: number, maxWidth: number, bold = false): string[] {
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

/*
 * Layout constants. One viewBox unit equals one pixel at the full width of the content container (72rem).
 * Zones are fractions of the width. Every connector, badge and label is derived from these values.
 */
export const VIEW_W = 1152;
export const AF = {
  triggerEnd: 0.15, frameStart: 0.18, frameEnd: 0.8, resultStart: 0.83,
  top: 12, headerH: 44, loopZoneH: 36, nodeH: 96, nodeGap: 24, framePadX: 20, frameBottomPad: 34,
  headerPillH: 26, headerPillY: 6, loopRise: 8, loopPillW: 150, loopPillH: 22,
  uTurn: 14, toolsGap: 34, toolsH: 108, toolsTitleH: 34, tileH: 66, tileGap: 8, toolsPad: 12,
  bandGap: 26, bandH: 56, bottomPad: 6, badgeR: 12, badgeOffset: 10,
} as const;
const frameX = VIEW_W * AF.frameStart;
const frameW = VIEW_W * (AF.frameEnd - AF.frameStart);
const nodeW = (frameW - 2 * AF.framePadX - 3 * AF.nodeGap) / 4;
const nodeTop = AF.top + AF.headerH + AF.loopZoneH;
const nodeBottom = nodeTop + AF.nodeH;
const frameH = AF.headerH + AF.loopZoneH + AF.nodeH + AF.frameBottomPad;
const frameBottom = AF.top + frameH;
const toolsY = frameBottom + AF.toolsGap;
const bandY = toolsY + AF.toolsH + AF.bandGap;
export const nodeX = (index: number) => frameX + AF.framePadX + index * (nodeW + AF.nodeGap);
export const nodeCx = (index: number) => nodeX(index) + nodeW / 2;
export const AFG = {
  frameX, frameW, frameH, frameBottom, nodeW, nodeTop, nodeBottom, nodeMid: nodeTop + AF.nodeH / 2,
  triggerX: 0, triggerW: VIEW_W * AF.triggerEnd, resultX: VIEW_W * AF.resultStart, resultW: VIEW_W * (1 - AF.resultStart),
  loopY: nodeTop - AF.loopZoneH + AF.loopRise, toolsY, toolsX: nodeX(2), toolsW: 2 * nodeW + AF.nodeGap, bandY,
};
export const VIEW_H = bandY + AF.bandH + AF.bottomPad;

/** Badge centers: up and left of each element's top-left corner. Elements flush with the left edge stay inside the drawing. */
const r = AF.badgeR, off = AF.badgeOffset;
export const agentFlowBadges: readonly { ref: AgentFlowReference; x: number; y: number }[] = [
  { ref: 1, x: AFG.triggerX + r + 2, y: nodeTop - off }, { ref: 2, x: nodeX(0) - off, y: nodeTop - off }, { ref: 3, x: nodeX(1) - off, y: nodeTop - off },
  { ref: 4, x: nodeX(2) - off, y: nodeTop - off }, { ref: 5, x: nodeX(3) - off, y: nodeTop - off }, { ref: 6, x: AFG.resultX - off, y: nodeTop - off },
  { ref: 7, x: r + 2, y: bandY - off },
];
