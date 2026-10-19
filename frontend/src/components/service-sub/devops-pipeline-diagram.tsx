import type { ReactNode } from "react";
import {
  PIPE, PIPE_BOX_Y, PIPE_CARD_BOTTOM, PIPE_FRAME_Y, PIPE_HEIGHT, PIPE_LEFT, PIPE_LOOP_Y, PIPE_SPAN,
  devopsPipelineLegend, pipeBadges, pipeCardCenter, pipeCardX, pipeFoundations, pipelineStages,
  type PipelineIcon, type PipelineReference,
} from "./devops-pipeline-data";
import styles from "./devops-pipeline.module.css";

const iconPaths: Record<PipelineIcon | "diamond", string> = {
  commit: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 12h6M16 12h6",
  build: "M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10",
  test: "M4 4h16v16H4zM8 12l3 3 5-6",
  shield: "M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5zM9 12l2 2 4-4",
  deploy: "M12 16V4M7 9l5-5 5 5M4 20h16",
  monitor: "M2 12h5l3-8 4 16 3-8h5",
  diamond: "M12 3l9 9-9 9-9-9z",
};

function Icon({ name, x, y, size }: { name: PipelineIcon | "diamond"; x: number; y: number; size: number }) {
  return <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" className={styles.icon}><path d={iconPaths[name]} /></svg>;
}

function Hotspot({ refId, active, children }: { refId: PipelineReference; active: PipelineReference | null; children: ReactNode }) {
  return <g className={styles.reference} data-ref={refId} data-match={active !== null && active === refId}>{children}</g>;
}

export function DevopsPipelineDiagram({ active, id }: { active: PipelineReference | null; id: string }) {
  const arrow = `url(#${id}-arrow)`, blueArrow = `url(#${id}-blue-arrow)`, miniArrow = `url(#${id}-mini-arrow)`;
  const midY = PIPE.cardTop + PIPE.cardH / 2;
  const r = 14;
  const first = pipeCardCenter(0), last = pipeCardCenter(pipelineStages.length - 1);
  const loopPath = `M${last} ${PIPE.cardTop}V${PIPE_LOOP_Y + r}Q${last} ${PIPE_LOOP_Y} ${last - r} ${PIPE_LOOP_Y}H${first + r}Q${first} ${PIPE_LOOP_Y} ${first} ${PIPE_LOOP_Y + r}V${PIPE.cardTop}`;
  const pillW = 150, pillH = 24, pillX = (first + last) / 2 - pillW / 2;
  const rowW = PIPE.cardW - 28, rowH = 26, rowGap = 14, rowsTop = PIPE.cardTop + 80;

  const badge = (ref: PipelineReference) => {
    const b = pipeBadges.find(item => item.ref === ref)!;
    return <g className={styles.badgeGroup}>
      <circle cx={b.x} cy={b.y} r={PIPE.badgeR} className={styles.badge} />
      <text x={b.x} y={b.y + 5} textAnchor="middle" fontSize={14} className={styles.badgeText}>{ref}</text>
    </g>;
  };

  return <svg className={styles.diagram} viewBox={`0 0 ${PIPE.width} ${PIPE_HEIGHT}`} focusable="false" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>CI/CD pipeline from code commit to production</title>
    <desc id={`${id}-desc`}>Diagram of a CI/CD pipeline: commit, build, test, security scan, deploy to staging and production, and monitor, with a feedback loop back to commit, supported by an artifact registry, access and secrets management and infrastructure as code.</desc>
    <defs>
      <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.blueFill} /></marker>
      <marker id={`${id}-blue-arrow`} viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 8 4 0 8Z" className={styles.blueFill} /></marker>
      <marker id={`${id}-mini-arrow`} viewBox="0 0 6 6" refX={6} refY={3} markerWidth={6} markerHeight={6} orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 6 3 0 6Z" className={styles.blueFill} /></marker>
    </defs>

    {pipelineStages.map((stage, index) => {
      const x = pipeCardX(index), cx = pipeCardCenter(index), refId = (index + 1) as PipelineReference;
      const legend = devopsPipelineLegend[index];
      return <Hotspot key={stage.title} refId={refId} active={active}>
        <rect x={x} y={PIPE.cardTop} width={PIPE.cardW} height={PIPE.cardH} rx={12} className={styles.card} data-anchor />
        <Icon name={stage.icon} x={cx - 14} y={PIPE.cardTop + 14} size={28} />
        <text x={cx} y={PIPE.cardTop + 68} fontSize={15} fontWeight={700} textAnchor="middle">{stage.title}</text>
        {refId === 5 ? <>
          {legend.items.map((item, row) => {
            const y = rowsTop + row * (rowH + rowGap);
            return <g key={item}>
              <rect x={x + 14} y={y} width={rowW} height={rowH} rx={8} className={styles.miniRow} />
              {row === 1 && <Icon name="diamond" x={x + 24} y={y + 6} size={14} />}
              <text x={row === 1 ? x + 46 : cx} y={y + 18} fontSize={13} textAnchor={row === 1 ? "start" : "middle"}>{item}</text>
              {row < 2 && <path d={`M${cx} ${y + rowH}V${y + rowH + rowGap}`} className={styles.miniLine} markerEnd={miniArrow} />}
            </g>;
          })}
        </> : legend.items.map((item, row) => {
          const baseline = PIPE.cardTop + 100 + row * 30;
          return <g key={item}><circle cx={x + 16} cy={baseline - 4.5} r={3} className={styles.dot} /><text x={x + 26} y={baseline} fontSize={13}>{item}</text></g>;
        })}
        {refId === 6 && <>
          <path d={loopPath} className={styles.loopHit} />
          <path d={loopPath} className={styles.loop} markerEnd={blueArrow} />
          <rect x={pillX} y={PIPE_LOOP_Y - pillH / 2} width={pillW} height={pillH} rx={pillH / 2} className={styles.pill} />
          <text x={pillX + pillW / 2} y={PIPE_LOOP_Y + 4.5} fontSize={13} textAnchor="middle">Feedback and fixes</text>
        </>}
        {badge(refId)}
      </Hotspot>;
    })}

    {pipelineStages.slice(0, -1).map((stage, index) =>
      <path key={stage.title} d={`M${pipeCardX(index) + PIPE.cardW} ${midY}H${pipeCardX(index + 1)}`} className={styles.flow} markerEnd={arrow} />)}

    <Hotspot refId={7} active={active}>
      <rect x={PIPE_LEFT} y={PIPE_FRAME_Y} width={PIPE_SPAN} height={PIPE.frameH} rx={12} className={styles.frame} data-anchor />
      <text x={PIPE_LEFT + 20} y={PIPE_FRAME_Y + 34} fontSize={15} fontWeight={700}>Shared foundations</text>
      {pipeFoundations.map(item => {
        const x = pipeCardX(item.column), cx = pipeCardCenter(item.column);
        return <g key={item.label}>
          <path d={`M${cx} ${PIPE_CARD_BOTTOM}V${PIPE_BOX_Y}`} className={styles.dashedLine} />
          <rect x={x} y={PIPE_BOX_Y} width={PIPE.cardW} height={PIPE.boxH} rx={10} className={styles.card} />
          <text x={cx} y={PIPE_BOX_Y + PIPE.boxH / 2 + 4.5} fontSize={13} textAnchor="middle">{item.label}</text>
        </g>;
      })}
      {badge(7)}
    </Hotspot>
  </svg>;
}
