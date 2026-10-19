import {
  VIEW_H,
  VIEW_W,
  automationFlowBadges,
  automationFlowConnectors as c,
  automationFlowTiles,
  type AutomationFlowIcon,
  type AutomationFlowReference,
} from "./automation-flow-data";
import styles from "./automation-flow.module.css";

const iconPaths: Record<AutomationFlowIcon, string> = {
  document: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6",
  extract: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 17h6M14 14h6M14 20h3",
  validate: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  update: "M3 5c0-3 18-3 18 0s-18 3-18 0v14c0 3 18 3 18 0V5M3 12c0 3 18 3 18 0",
  review: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.5-6 8-6s8 2 8 6",
};

export function AutomationFlowIconGlyph({ name }: { name: AutomationFlowIcon }) {
  return <svg viewBox="0 0 24 24" width={20} height={20} className={styles.icon} aria-hidden="true" focusable="false"><path d={iconPaths[name]} /></svg>;
}

export function AutomationFlowDiagram({ active, id }: { active: AutomationFlowReference | null; id: string }) {
  const tiles = automationFlowTiles;
  const flow = `url(#${id}-flow)`, dashed = `url(#${id}-dashed)`;
  const match = (ref: AutomationFlowReference) => active === ref;
  return <svg className={styles.diagram} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} focusable="false" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>Sample document automation flow with exception review</title>
    <desc id={`${id}-desc`}>Diagram of a document automation flow in five steps: a document comes in, AI extracts data, the data is validated, and the target system is updated. Items that fail validation go to a person for exception review and then continue to the system update.</desc>
    <defs>
      <marker id={`${id}-flow`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.flowHead} /></marker>
      <marker id={`${id}-dashed`} viewBox="0 0 6 6" refX={6} refY={3} markerWidth={6} markerHeight={6} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 6 3 0 6Z" className={styles.dashedHead} /></marker>
    </defs>
    {tiles.map((tile, index) => {
      const titleStart = tile.titleLines.length === 1 ? tile.y + 75 : tile.y + 66;
      const next = tiles[index + 1];
      const inMainRow = index < 3;
      return <g key={tile.ref} className={styles.reference} data-ref={tile.ref} data-match={match(tile.ref)}>
        <rect x={tile.x} y={tile.y} width={tile.w} height={tile.h} rx={12} className={styles.node} />
        <svg x={tile.cx - 13} y={tile.y + 14} width={26} height={26} viewBox="0 0 24 24" className={styles.icon}><path d={iconPaths[tile.icon]} /></svg>
        {tile.titleLines.map((line, lineIndex) => <text key={line} x={tile.cx} y={titleStart + lineIndex * 18} fontSize={15} textAnchor="middle" className={styles.strong}>{line}</text>)}
        {tile.subtitleLines.map((line, lineIndex) => <text key={line} x={tile.cx} y={tile.y + 108 + lineIndex * 17} fontSize={12.5} textAnchor="middle" className={styles.mutedText}>{line}</text>)}
        {inMainRow && next && <path d={`M${tile.x + tile.w} ${c.rowArrowY}H${next.x}`} className={styles.flow} markerEnd={flow} />}
        {tile.exception && <>
          <path d={`M${c.toReview.x} ${c.toReview.from}V${c.toReview.to}`} className={styles.dashed} markerEnd={dashed} />
          <text x={c.toReview.x + 12} y={(c.toReview.from + c.toReview.to) / 2 + 4.5} fontSize={13} className={styles.mutedText}>Exceptions</text>
          <path d={`M${c.fromReview.from} ${c.fromReview.y}H${c.fromReview.x}V${c.fromReview.to}`} className={styles.dashed} markerEnd={dashed} />
          <text x={(c.fromReview.from + c.fromReview.x) / 2} y={c.fromReview.y - 10} fontSize={13} textAnchor="middle" className={styles.mutedText}>Once resolved</text>
        </>}
      </g>;
    })}
    {automationFlowBadges.map(badge => <g key={badge.ref} className={styles.reference} data-ref={badge.ref} data-match={match(badge.ref)}>
      <circle cx={badge.x} cy={badge.y} r={13} className={styles.badge} />
      <text x={badge.x} y={badge.y + 5} textAnchor="middle" fontSize={14} className={styles.badgeText}>{badge.ref}</text>
    </g>)}
  </svg>;
}
