import {
  VIEW_H,
  VIEW_W,
  crmIntegrationBadges,
  crmIntegrationGeometry as g,
  crmIntegrationHub,
  type CrmIntegrationIcon,
  type CrmIntegrationReference,
} from "./crm-integration-data";
import styles from "./crm-integration.module.css";

const iconPaths: Record<CrmIntegrationIcon, string> = {
  crm: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.5-6 8-6s8 2 8 6",
  website: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  email: "M3 5h18v14H3zM3 6l9 7 9-7",
  marketing: "M4 10v4h3l7 4V6L7 10zM17 9c1.5 1.5 1.5 4.5 0 6",
  erp: "M3 6c0-3 18-3 18 0s-18 3-18 0v12c0 3 18 3 18 0V6M3 12c0 3 18 3 18 0",
  support: "M4 13v-1a8 8 0 0 1 16 0v1M4 13h3v5H4zM17 13h3v5h-3zM20 18c0 2-3 3-6 3",
};

export function CrmIntegrationIconGlyph({ name }: { name: CrmIntegrationIcon }) {
  return <svg viewBox="0 0 24 24" width={20} height={20} className={styles.icon} aria-hidden="true" focusable="false"><path d={iconPaths[name]} /></svg>;
}

export function CrmIntegrationDiagram({ active, id }: { active: CrmIntegrationReference | null; id: string }) {
  const flow = `url(#${id}-flow)`;
  const match = (ref: CrmIntegrationReference) => active === ref;
  const { hub, buses } = g;
  const tiles = [...g.leftTiles.map(tile => ({ tile, side: "left" as const })), ...g.rightTiles.map(tile => ({ tile, side: "right" as const }))];

  return <svg className={styles.diagram} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} focusable="false" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>CRM integration architecture with connected tools</title>
    <desc id={`${id}-desc`}>Diagram of a CRM at the center, connected in both directions to customer touchpoints on the left, which are the website, email and marketing tools, and to business systems on the right, which are the ERP and support.</desc>
    <defs>
      <marker id={`${id}-flow`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.flowHead} /></marker>
    </defs>

    {g.columnLabels.map(label => <text key={label.text} x={label.x} y={label.y} fontSize={12} className={styles.layerLabel}>{label.text}</text>)}

    <g className={styles.reference} data-ref={1} data-match={match(1)}>
      <path d={`M${buses.left.x} ${buses.left.from}V${buses.left.to}`} className={styles.flow} />
      <path d={`M${buses.right.x} ${buses.right.from}V${buses.right.to}`} className={styles.flow} />
      <path d={`M${buses.left.trunkFrom} ${hub.cy}H${buses.left.trunkTo}`} className={styles.flow} markerEnd={flow} />
      <path d={`M${buses.right.trunkFrom} ${hub.cy}H${buses.right.trunkTo}`} className={styles.flow} markerEnd={flow} />
      <rect x={hub.x} y={hub.y} width={hub.w} height={hub.h} rx={14} className={styles.frame} />
      <svg x={hub.cx - 14} y={hub.cy - 52} width={28} height={28} viewBox="0 0 24 24" className={styles.icon}><path d={iconPaths[crmIntegrationHub.icon]} /></svg>
      <text x={hub.cx} y={hub.cy + 10} fontSize={22} textAnchor="middle" className={styles.strong}>{crmIntegrationHub.title}</text>
      <text x={hub.cx} y={hub.cy + 34} fontSize={13} textAnchor="middle" className={styles.mutedText}>{crmIntegrationHub.subtitle}</text>
    </g>

    {tiles.map(({ tile, side }) => {
      const bus = buses[side];
      const edge = side === "left" ? tile.x + tile.w : tile.x;
      return <g key={tile.ref} className={styles.reference} data-ref={tile.ref} data-match={match(tile.ref)}>
        <path d={`M${bus.x} ${tile.cy}H${edge}`} className={styles.flow} markerEnd={flow} />
        <rect x={tile.x} y={tile.y} width={tile.w} height={tile.h} rx={10} className={styles.node} />
        <svg x={tile.x + 18} y={tile.cy - 12} width={24} height={24} viewBox="0 0 24 24" className={styles.icon}><path d={iconPaths[tile.icon]} /></svg>
        <text x={tile.x + 54} y={tile.cy - 2} fontSize={15} className={styles.strong}>{tile.label}</text>
        <text x={tile.x + 54} y={tile.cy + 18} fontSize={12.5} className={styles.mutedText}>{tile.subtitle}</text>
      </g>;
    })}

    {crmIntegrationBadges.map(badge => <g key={badge.ref} className={styles.reference} data-ref={badge.ref} data-match={match(badge.ref)}>
      <circle cx={badge.x} cy={badge.y} r={13} className={styles.badge} />
      <text x={badge.x} y={badge.y + 5} textAnchor="middle" fontSize={14} className={styles.badgeText}>{badge.ref}</text>
    </g>)}
  </svg>;
}
