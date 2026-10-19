import type { ReactNode } from "react";
import { architectureBadgePositions, type ArchitectureLayout, type ArchitectureReference } from "./migration-architecture-data";
import styles from "./migration-architecture.module.css";

type DiagramProps = { active: ArchitectureReference | null; layout: ArchitectureLayout; id: string };
type IconName = "server" | "application" | "database" | "folder" | "backup" | "lock";

const sourceSystems: readonly { label: string; icon: IconName }[] = [
  { label: "Physical servers", icon: "server" }, { label: "Legacy applications", icon: "application" },
  { label: "Database server", icon: "database" }, { label: "File storage", icon: "folder" }, { label: "Local backups", icon: "backup" },
];
const phases = ["Replicate", "Pilot", "Cut over"];
const constraints = ["Ageing hardware", "Manual scaling", "Limited recovery"];

function Icon({ name, x, y, size = 24 }: { name: IconName; x: number; y: number; size?: number }) {
  const paths: Record<IconName, string> = {
    server: "M3 3h18v7H3zM3 14h18v7H3zM6 6.5h.01M6 17.5h.01M11 6.5h7M11 17.5h7",
    application: "M3 4h18v16H3zM3 9h18M6 6.5h.01M9 6.5h.01",
    database: "M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6M3 12c0 4 18 4 18 0",
    folder: "M2 6h8l2 3h10v11H2zM2 6V4h8l2 2h8v3",
    backup: "M4 3h16v18H4zM7 3v7h10V3M7 21v-7h10v7",
    lock: "M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4M12 14v3",
  };
  return <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" className={styles.icon}><path d={paths[name]} /></svg>;
}

function Label({ x, y, children, size = 18, anchor = "start", muted = false }: {
  x: number; y: number; children: ReactNode; size?: number; anchor?: "start" | "middle" | "end"; muted?: boolean;
}) {
  return <text x={x} y={y} fontSize={size} textAnchor={anchor} className={muted ? styles.mutedText : undefined}>{children}</text>;
}

function Box({ x, y, width, height, label, size = 18, icon }: {
  x: number; y: number; width: number; height: number; label: string | readonly string[]; size?: number; icon?: IconName;
}) {
  const lines = typeof label === "string" ? [label] : label;
  const baseline = y + height / 2 + size * .35 - (lines.length - 1) * size * .5;
  return <>
    <rect x={x} y={y} width={width} height={height} rx={10} className={styles.node} />
    {icon && <Icon name={icon} x={x + 14} y={y + (height - 24) / 2} />}
    <text x={icon ? x + 50 : x + width / 2} y={baseline} fontSize={size} textAnchor={icon ? "start" : "middle"}>
      {lines.map((line, index) => <tspan x={icon ? x + 50 : x + width / 2} dy={index ? size : 0} key={line}>{line}</tspan>)}
    </text>
  </>;
}

function Reference({ refs, active, stage = "after", shift = 0, children }: {
  refs: readonly ArchitectureReference[]; active: ArchitectureReference | null; stage?: "before" | "path" | "after"; shift?: number; children: ReactNode;
}) {
  return <g className={styles.reference} data-ref={refs[0]} data-match={active !== null && refs.includes(active)} data-stage={stage}
    transform={shift ? `translate(${shift} 0)` : undefined}>{children}</g>;
}

export function MigrationArchitectureDiagram({ active, layout, id }: DiagramProps) {
  const mobile = layout === "mobile";
  const width = mobile ? 400 : 1100, height = mobile ? 1250 : 520;
  const arrow = `url(#${id}-arrow)`, blueArrow = `url(#${id}-blue-arrow)`;
  const line = (d: string, { secure = false, dashed = false, both = false } = {}) =>
    <path d={d} pathLength={1} className={`${styles.connector} ${styles.draw}${secure ? ` ${styles.secure}` : ""}${dashed ? ` ${styles.dashed}` : ""}`}
      markerEnd={secure ? blueArrow : arrow} markerStart={both ? arrow : undefined} />;
  const cloudShift = mobile ? 0 : 100;
  const group = (refs: readonly ArchitectureReference[], children: ReactNode, stage?: "before" | "path" | "after", shift = 0) =>
    <Reference refs={refs} active={active} stage={stage} shift={shift}>{children}</Reference>;

  return <svg className={styles.diagram} viewBox={`0 0 ${width} ${height}`} focusable="false"
    role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>Before and after cloud migration architecture</title>
    <desc id={`${id}-desc`}>Physical servers, legacy applications, a database, files and local backups start in an on-premises site. A secure staged transfer connects them to a governed cloud environment with network controls, application zones, replicated databases and a second region for recovery.</desc>
    <defs>
      <marker id={`${id}-arrow`} viewBox="0 0 6 6" refX={6} refY={3} markerWidth={6} markerHeight={6} orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0 6 3 0 6Z" className={styles.arrowhead} /></marker>
      <marker id={`${id}-blue-arrow`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.blueArrowhead} /></marker>
    </defs>

    {!mobile ? <>
      {group([], <>
        <rect x={8} y={8} width={230} height={504} rx={14} className={styles.beforeFrame} />
        <Label x={22} y={46} size={17}>On-premises</Label>
        <rect x={132} y={34} width={92} height={22} rx={11} className={styles.tag} /><Label x={178} y={50} size={15} anchor="middle" muted>Single site</Label>
        {sourceSystems.map((system, index) => <Box key={system.label} x={22} y={70 + index * 58} width={202} height={46} label={system.label} icon={system.icon} size={15} />)}
        {constraints.map((label, index) => {
          const positions = [{ x: 28, y: 400, w: 190 }, { x: 28, y: 436, w: 190 }, { x: 28, y: 472, w: 190 }];
          const position = positions[index];
          return <g key={label}><rect x={position.x} y={position.y} width={position.w} height={24} rx={12} className={styles.tag} /><Label x={position.x + position.w / 2} y={position.y + 17} size={15} anchor="middle" muted>{label}</Label></g>;
        })}
      </>, "before")}
      {group([1], <>
        <Label x={340} y={31} size={15} anchor="middle">Migration path</Label>
        <Icon name="lock" x={330} y={48} size={20} /><Label x={340} y={90} size={15} anchor="middle">Secure connection</Label>
        {line("M238 116H340V292H440", { secure: true })}
        {phases.map((phase, index) => <Box key={phase} x={300} y={132 + index * 56} width={80} height={34} label={phase} size={15} />)}
        {[116, 180, 236, 292].map(y => <circle key={y} cx={340} cy={y} r={3} className={styles.flowDot} />)}
      </>, "path")}
      {group([2], <>
        <rect x={340} y={8} width={652} height={504} rx={14} className={styles.cloudFrame} />
        <Label x={358} y={46} size={17}>Cloud environment</Label>
        <rect x={856} y={29} width={116} height={22} rx={11} className={styles.tag} /><Label x={914} y={45} size={15} anchor="middle">Landing zone</Label>
      </>, "after", cloudShift)}
      {group([3], <>
        <Label x={358} y={82} size={15}>Network and edge</Label>
        {["DNS", "Firewall", ["Content", "delivery"], "Load balancer"].map((label, index) => <Box key={index} x={358 + index * 154} y={92} width={132} height={46} label={label} size={15} />)}
        {[490, 644, 798].map(x => <g key={x}>{line(`M${x} 115h22`)}</g>)}
      </>, "after", cloudShift)}
      {group([4], <>{line("M952 138V150H478V188")}{line("M850 150V188")}</>, "after", cloudShift)}
      {group([4], <>
        {[{ x: 358, name: "Zone A" }, { x: 728, name: "Zone B" }].map(zone => <g key={zone.name}><rect x={zone.x} y={156} width={244} height={152} rx={12} className={styles.zoneFrame} /><Label x={zone.x + 14} y={178} size={15}>{zone.name}</Label><Box x={zone.x + 14} y={188} width={216} height={40} label="App services" size={15} /></g>)}
      </>, "after", cloudShift)}
      {group([5], <>{line("M480 228V250")}{line("M850 228V250")}</>, "after", cloudShift)}
      {group([5], <>
        <Box x={372} y={250} width={216} height={42} label="Database (primary)" size={15} />
        <Box x={742} y={250} width={216} height={42} label="Database (standby)" size={15} />
        {line("M588 271H742", { both: true })}<Label x={665} y={262} size={15} anchor="middle" muted>Replication</Label>
        <Box x={358} y={322} width={252} height={38} label="Object storage" size={15} /><Box x={720} y={322} width={252} height={38} label="Cache" size={15} />
        {line("M480 292V322")}{line("M850 292V322")}
        <rect x={500} y={446} width={472} height={54} rx={10} className={styles.zoneFrame} /><Label x={514} y={467} size={15}>Second region</Label>
        <Box x={514} y={472} width={122} height={22} label="Backups" size={15} /><Box x={650} y={472} width={304} height={22} label="Disaster recovery copy" size={15} />
        {line("M358 341H346V473H500", { dashed: true })}<Label x={420} y={465} size={15} anchor="middle" muted>Replicated</Label>
      </>, "after", cloudShift)}
      {group([6], <>
        <rect x={358} y={374} width={614} height={64} rx={10} className={styles.operationsBand} /><Label x={372} y={395} size={15}>Security and operations</Label>
        <Box x={372} y={402} width={180} height={28} label="Identity and access" size={15} />
        <Box x={568} y={402} width={180} height={28} label="Encryption and keys" size={15} />
        <Box x={764} y={402} width={194} height={28} label="Logging and monitoring" size={15} />
      </>, "after", cloudShift)}
    </> : <>
      {group([], <>
        <Label x={12} y={24} size={16}>Before</Label><rect x={12} y={40} width={376} height={276} rx={14} className={styles.beforeFrame} />
        <Label x={28} y={70} size={18}>On-premises</Label><rect x={276} y={52} width={96} height={24} rx={12} className={styles.tag} /><Label x={324} y={69} size={14.5} anchor="middle" muted>Single site</Label>
        {sourceSystems.map((system, index) => <Box key={system.label} x={28} y={90 + index * 44} width={344} height={34} label={system.label} icon={system.icon} size={16} />)}
        {constraints.map((label, index) => <g key={label}><rect x={12 + index * 130} y={328} width={116} height={26} rx={13} className={styles.tag} /><Label x={70 + index * 130} y={346} size={14.5} anchor="middle" muted>{label}</Label></g>)}
      </>, "before")}
      {group([1], <>
        <Label x={200} y={374} size={14.5} anchor="middle" muted>Migration path</Label><Icon name="lock" x={116} y={385} size={18} /><Label x={230} y={400} size={16} anchor="middle">Secure connection</Label>
        {line("M388 306H398V410H200V560", { secure: true })}
        {phases.map((phase, index) => <Box key={phase} x={144} y={418 + index * 38} width={112} height={30} label={phase} size={14.5} />)}
        {[410, 452, 490, 540].map(y => <circle key={y} cx={200} cy={y} r={2.5} className={styles.flowDot} />)}
      </>, "path")}
      {group([2], <>
        <Label x={12} y={548} size={16}>After</Label><rect x={12} y={560} width={376} height={554} rx={14} className={styles.cloudFrame} />
        <Label x={28} y={588} size={18}>Cloud environment</Label><rect x={252} y={573} width={108} height={22} rx={11} className={styles.tag} /><Label x={306} y={589} size={14.5} anchor="middle">Landing zone</Label>
      </>)}
      {group([3], <>
        <Label x={28} y={622} size={16}>Network and edge</Label>
        {["DNS", "Firewall", ["Content", "delivery"], ["Load", "balancer"]].map((label, index) => <Box key={index} x={28 + index * 84} y={636} width={80} height={44} label={label} size={14.5} />)}
        {[108, 192, 276].map(x => <g key={x}>{line(`M${x} 658h4`)}</g>)}
      </>)}
      {group([4], <>{line("M320 680V694H106V742")}{line("M282 694V742")}</>)}
      {group([4], <>
        {[{ x: 28, name: "Zone A" }, { x: 204, name: "Zone B" }].map(zone => <g key={zone.name}><rect x={zone.x} y={706} width={156} height={190} rx={10} className={styles.zoneFrame} /><Label x={zone.x + 12} y={727} size={14.5}>{zone.name}</Label><Box x={zone.x + 12} y={742} width={132} height={36} label="App services" size={14.5} /></g>)}
      </>)}
      {group([5], <>{line("M106 778V830")}{line("M282 778V830")}</>)}
      {group([5], <>
        <Box x={40} y={830} width={114} height={50} label={["Database", "(primary)"]} size={14.5} /><Box x={234} y={830} width={114} height={50} label={["Database", "(standby)"]} size={14.5} />
        {line("M97 880V910H291V880", { both: true })}<Label x={194} y={931} size={14.5} anchor="middle" muted>Replication</Label>
        <Box x={28} y={946} width={156} height={36} label="Object storage" size={14.5} /><Box x={204} y={946} width={156} height={36} label="Cache" size={14.5} />
        <rect x={12} y={1140} width={376} height={100} rx={12} className={styles.zoneFrame} /><Label x={28} y={1165} size={16}>Second region</Label>
        <Box x={28} y={1180} width={136} height={44} label="Backups" size={14.5} /><Box x={180} y={1180} width={192} height={44} label={["Disaster recovery", "copy"]} size={14.5} />
        {line("M28 964H4V1133H200V1140", { dashed: true })}<Label x={100} y={1128} size={14.5} anchor="middle" muted>Replicated</Label>
      </>)}
      {group([6], <>
        <rect x={28} y={998} width={332} height={100} rx={10} className={styles.operationsBand} /><Label x={40} y={1021} size={16}>Security and operations</Label>
        <Box x={40} y={1034} width={100} height={50} label={["Identity", "and access"]} size={14.5} /><Box x={144} y={1034} width={100} height={50} label={["Encryption", "and keys"]} size={14.5} /><Box x={248} y={1034} width={100} height={50} label={["Logging and", "monitoring"]} size={14.5} />
      </>)}
    </>}
    {architectureBadgePositions[layout].map((badge, index) => <Reference key={index} refs={[badge.ref]} active={active} stage={badge.ref === 1 ? "path" : "after"}>
      <circle cx={badge.x} cy={badge.y} r={13} className={styles.badge} /><text x={badge.x} y={badge.y + 5} textAnchor="middle" fontSize={mobile ? 14.5 : 14} className={styles.badgeText}>{badge.ref}</text>
    </Reference>)}
  </svg>;
}
