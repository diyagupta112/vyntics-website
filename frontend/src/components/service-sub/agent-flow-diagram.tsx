import type { ReactNode } from "react";
import {
  AF, AFG, VIEW_H, VIEW_W, agentFlowBadges, agentFlowGuardrails, agentFlowLabels, agentFlowNodes, agentFlowResult, agentFlowTools,
  agentFlowTrigger, agentTextWidth, agentWrap, nodeCx, nodeX, type AgentFlowIcon, type AgentFlowReference,
} from "./agent-flow-data";
import styles from "./agent-flow.module.css";

const iconPaths: Record<AgentFlowIcon, string> = {
  trigger: "M13 2L4 14h7l-1 8 9-12h-7z",
  plan: "M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 16h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5",
  approval: "M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 21v-1a6 6 0 0 1 9-5M15 18l2 2 4-4",
  tools: "M14.5 6.5a4 4 0 0 0-5 5L3 18l3 3 6.5-6.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z",
  check: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM15 15l6 6M7 10l2 2 4-4",
  result: "M4 4h16v16H4zM8 12l3 3 5-6",
  apps: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  knowledge: "M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4zM8 8h8",
  email: "M3 6h18v12H3zM3 7l9 7 9-7",
};

export function AgentFlowIconGlyph({ name }: { name: AgentFlowIcon }) {
  return <svg viewBox="0 0 24 24" width={20} height={20} className={styles.icon} aria-hidden="true" focusable="false"><path d={iconPaths[name]} /></svg>;
}

const DESC = "Diagram of an AI agent workflow: a trigger starts the agent, which plans, asks a person to approve key actions, acts through connected tools, checks the result and repeats until done, then delivers the result with a trace, with guardrails and an audit trail across the workflow.";
const TITLE = 16, TITLE_LH = 20, ICON = 24, ICON_GAP = 8;

function Icon({ name, x, y, size }: { name: AgentFlowIcon; x: number; y: number; size: number }) {
  return <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" className={styles.icon}><path d={iconPaths[name]} /></svg>;
}

function Hotspot({ refId, active, children }: { refId: AgentFlowReference; active: AgentFlowReference | null; children: ReactNode }) {
  return <g className={styles.reference} data-ref={refId} data-match={active !== null && active === refId}>{children}</g>;
}

export function AgentFlowDiagram({ active, id }: { active: AgentFlowReference | null; id: string }) {
  const blue = `url(#${id}-blue)`, gray = `url(#${id}-gray)`, blueStart = `url(#${id}-blue-start)`;
  const { nodeW, nodeTop, nodeBottom, nodeMid } = AFG;
  const path = (d: string, className: string, head?: string, start?: string) => <g>
    <path d={d} className={styles.hit} />
    <path d={d} className={className} markerEnd={head} markerStart={start} />
  </g>;
  const badge = (ref: AgentFlowReference) => {
    const b = agentFlowBadges.find(item => item.ref === ref)!;
    return <g className={styles.badgeGroup}>
      <circle cx={b.x} cy={b.y} r={AF.badgeR} className={styles.badge} />
      <text x={b.x} y={b.y + 4.5} textAnchor="middle" fontSize={13} className={styles.badgeText}>{ref}</text>
    </g>;
  };
  /** Icon above a wrapped, centered title, vertically centered in the box. */
  const card = (x: number, w: number, title: string, icon: AgentFlowIcon, className = styles.node) => {
    const lines = agentWrap(title, TITLE, w - 24, true);
    const top = nodeTop + (AF.nodeH - (ICON + ICON_GAP + lines.length * TITLE_LH)) / 2;
    const cx = x + w / 2;
    return <g key={title}>
      <rect x={x} y={nodeTop} width={w} height={AF.nodeH} rx={12} className={className} data-anchor />
      <Icon name={icon} x={cx - ICON / 2} y={top} size={ICON} />
      <text x={cx} y={top + ICON + ICON_GAP + 15} fontSize={TITLE} fontWeight={600} textAnchor="middle">
        {lines.map((line, index) => <tspan key={line} x={cx} dy={index ? TITLE_LH : 0}>{line}</tspan>)}
      </text>
    </g>;
  };

  const leftCx = nodeCx(0), rightCx = nodeCx(3), loopY = AFG.loopY, r = 12;
  const loopPath = `M${rightCx} ${nodeTop}V${loopY + r}Q${rightCx} ${loopY} ${rightCx - r} ${loopY}H${leftCx + r}Q${leftCx} ${loopY} ${leftCx} ${loopY + r}V${nodeTop}`;
  const loopMid = (leftCx + rightCx) / 2;
  const uX = nodeCx(1), uBottom = nodeBottom + AF.uTurn, ur = 8;
  const uPath = `M${uX} ${nodeBottom}V${uBottom - ur}Q${uX} ${uBottom} ${uX - ur} ${uBottom}H${leftCx + ur}Q${leftCx} ${uBottom} ${leftCx} ${uBottom - ur}V${nodeBottom}`;
  const approvedX = nodeX(1) + nodeW + AF.nodeGap / 2;
  const guardApprovalX = nodeX(1) + nodeW * 0.75;
  const toolsCx = AFG.toolsX + AFG.toolsW / 2, resultCx = AFG.resultX + AFG.resultW / 2;
  const pillW = agentTextWidth(agentFlowLabels.frame, 14, 28, true);
  const tileW = (AFG.toolsW - 2 * AF.toolsPad - 2 * AF.tileGap) / 3;
  const chips = (() => {
    let cursor = 16 + agentTextWidth(agentFlowGuardrails.title, 14, 0, true) + 24;
    return agentFlowGuardrails.chips.map(label => {
      const width = agentTextWidth(label, 13, 26), at = cursor;
      cursor += width + 10;
      return <g key={label}>
        <rect x={at} y={AFG.bandY + (AF.bandH - 28) / 2} width={width} height={28} rx={14} className={styles.chip} />
        <text x={at + width / 2} y={AFG.bandY + AF.bandH / 2 + 4.5} fontSize={13} textAnchor="middle">{label}</text>
      </g>;
    });
  })();
  const dashedUp = (x: number, to: number) => path(`M${x} ${AFG.bandY}V${to}`, styles.dashedMuted, gray);

  return <>
    <span id={`${id}-desc`} className={styles.srOnly}>{DESC}</span>
    <svg className={styles.diagram} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} focusable="false" role="img" aria-label="AI agent workflow with human approval" aria-describedby={`${id}-desc`}>
      <defs>
        <marker id={`${id}-blue`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.flowHead} /></marker>
        <marker id={`${id}-blue-start`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.flowHead} /></marker>
        <marker id={`${id}-gray`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.grayHead} /></marker>
      </defs>

      <rect x={AFG.frameX} y={AF.top} width={AFG.frameW} height={AFG.frameH} rx={14} className={styles.agentFrame} />
      <rect x={AFG.frameX + 16} y={AF.top + AF.headerPillY} width={pillW} height={AF.headerPillH} rx={AF.headerPillH / 2} className={styles.pill} />
      <text x={AFG.frameX + 16 + pillW / 2} y={AF.top + AF.headerPillY + 18} fontSize={14} fontWeight={600} textAnchor="middle">{agentFlowLabels.frame}</text>

      <Hotspot refId={1} active={active}>
        {card(AFG.triggerX, AFG.triggerW, agentFlowTrigger.title, agentFlowTrigger.icon)}
        {path(`M${AFG.triggerX + AFG.triggerW} ${nodeMid}H${AFG.frameX}`, styles.flow, blue)}
        {badge(1)}
      </Hotspot>

      <Hotspot refId={2} active={active}>
        {card(nodeX(0), nodeW, agentFlowNodes[0].title, agentFlowNodes[0].icon)}
        {badge(2)}
      </Hotspot>

      <Hotspot refId={3} active={active}>
        {path(`M${nodeX(0) + nodeW} ${nodeMid}H${nodeX(1)}`, styles.flow, blue)}
        {card(nodeX(1), nodeW, agentFlowNodes[1].title, agentFlowNodes[1].icon, styles.nodeKey)}
        {path(`M${nodeX(1) + nodeW} ${nodeMid}H${nodeX(2)}`, styles.flow, blue)}
        <text x={approvedX} y={nodeBottom + 16} fontSize={12} textAnchor="middle" className={styles.mutedText}>{agentFlowLabels.approved}</text>
        {path(uPath, styles.dashedMuted, gray)}
        <text x={(leftCx + uX) / 2} y={uBottom + 16} fontSize={12} textAnchor="middle" className={styles.mutedText}>{agentFlowLabels.rejected}</text>
        {badge(3)}
      </Hotspot>

      <Hotspot refId={4} active={active}>
        {card(nodeX(2), nodeW, agentFlowNodes[2].title, agentFlowNodes[2].icon)}
        {path(`M${nodeCx(2)} ${nodeBottom}V${AFG.toolsY}`, styles.dashed, blue, blueStart)}
        <text x={nodeCx(2) + 10} y={(AFG.frameBottom + AFG.toolsY) / 2 + 9} fontSize={13} className={styles.mutedText}>{agentFlowLabels.uses}</text>
        <rect x={AFG.toolsX} y={AFG.toolsY} width={AFG.toolsW} height={AF.toolsH} rx={12} className={styles.band} data-anchor />
        <text x={AFG.toolsX + 16} y={AFG.toolsY + 22} fontSize={14} fontWeight={600}>{agentFlowTools.title}</text>
        {agentFlowTools.tiles.map((tile, index) => {
          const x = AFG.toolsX + AF.toolsPad + index * (tileW + AF.tileGap), y = AFG.toolsY + AF.toolsTitleH, cx = x + tileW / 2;
          const lines = agentWrap(tile.label, 14, tileW - 12);
          return <g key={tile.label}>
            <rect x={x} y={y} width={tileW} height={AF.tileH} rx={10} className={styles.tile} />
            <Icon name={tile.icon} x={cx - 10} y={y + 6} size={20} />
            <text x={cx} y={y + 40} fontSize={14} textAnchor="middle">{lines.map((line, i) => <tspan key={line} x={cx} dy={i ? 15 : 0}>{line}</tspan>)}</text>
          </g>;
        })}
        {badge(4)}
      </Hotspot>

      <Hotspot refId={5} active={active}>
        {path(`M${nodeX(2) + nodeW} ${nodeMid}H${nodeX(3)}`, styles.flow, blue)}
        {card(nodeX(3), nodeW, agentFlowNodes[3].title, agentFlowNodes[3].icon)}
        {path(loopPath, styles.loop, blue)}
        <rect x={loopMid - AF.loopPillW / 2} y={loopY - AF.loopPillH / 2} width={AF.loopPillW} height={AF.loopPillH} rx={AF.loopPillH / 2} className={styles.pill} />
        <text x={loopMid} y={loopY + 4.5} fontSize={13} textAnchor="middle">{agentFlowLabels.loop}</text>
        {badge(5)}
      </Hotspot>

      <Hotspot refId={6} active={active}>
        {path(`M${AFG.frameX + AFG.frameW} ${nodeMid}H${AFG.resultX}`, styles.flow, blue)}
        {card(AFG.resultX, AFG.resultW, agentFlowResult.title, agentFlowResult.icon)}
        {badge(6)}
      </Hotspot>

      <Hotspot refId={7} active={active}>
        <rect x={0} y={AFG.bandY} width={VIEW_W} height={AF.bandH} rx={12} className={styles.band} data-anchor />
        <text x={16} y={AFG.bandY + AF.bandH / 2 + 5} fontSize={14} fontWeight={600}>{agentFlowGuardrails.title}</text>
        {chips}
        {dashedUp(guardApprovalX, nodeBottom)}
        {dashedUp(toolsCx, AFG.toolsY + AF.toolsH)}
        {dashedUp(resultCx, nodeBottom)}
        {badge(7)}
      </Hotspot>
    </svg>
  </>;
}
