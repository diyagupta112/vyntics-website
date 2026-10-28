"use client";

import { useState } from "react";
import { useAutoRotate } from "@/components/ui/use-auto-rotate";
import styles from "./page.module.css";

type Team = {
  readonly name: string;
  readonly description: string;
  readonly focus: readonly { readonly title: string; readonly description: string }[];
  readonly cta: string;
};

const pad = (index: number) => String(index + 1).padStart(2, "0");

function TeamDetail({ team, showTitle }: { team: Team; showTitle: boolean }) {
  return <>
    {showTitle && <h3>{team.name} dashboards</h3>}
    <p className={styles.teamPanelDescription}>{team.description}</p>
    <ul className={styles.teamFocus}>
      {team.focus.map(point => <li key={point.title}><strong>{point.title}</strong><span>{point.description}</span></li>)}
    </ul>
    <p className={styles.teamCta}>
      <span>{team.cta}</span>
      <a href="/contact-us">Talk to our experts <span aria-hidden="true">→</span></a>
    </p>
  </>;
}

export function DashboardsByTeam({ teams }: { teams: readonly Team[] }) {
  const [active, setActive] = useState(0);
  const rotate = useAutoRotate(teams.length, active, setActive);
  return <div {...rotate.props} className={styles.teamTrack} data-reveal="dashboards-by-team-layout"><div className={styles.teamLayout}>
    <div className={styles.teamNavWrap}>
      <ul className={styles.teamNav} aria-label="Teams">
        {teams.map((item, index) => <li key={item.name} data-active={active === index}>
          <button type="button" className={styles.teamTab} aria-current={active === index ? "true" : undefined} aria-expanded={active === index} aria-controls={`dashboards-by-team-${index}`} onClick={() => setActive(index)}>
            <span className={styles.teamIndex} aria-hidden="true">{pad(index)}</span>
            <span className={styles.teamName}>{item.name}</span>
          </button>
          <div id={`dashboards-by-team-${index}`} className={styles.teamMobile}>
            <TeamDetail team={item} showTitle={false} />
          </div>
        </li>)}
      </ul>
    </div>
    <div className={styles.teamPanel} aria-live="polite">
      <div className={styles.teamDecor} aria-hidden="true">
        <svg viewBox="0 0 320 200" preserveAspectRatio="xMaxYMin meet" focusable="false">
          <path d="M20 150 L80 110 L130 128 L190 70 L250 90 L300 40" />
          <path d="M20 176 L90 150 L150 160 L210 118 L300 96" />
          <rect x="196" y="22" width="84" height="48" rx="6" />
          <rect x="30" y="24" width="52" height="30" rx="6" />
        </svg>
      </div>
      {teams.map((item, index) => <div key={item.name} className={styles.teamPanelBody} data-active={active === index} aria-hidden={active === index ? undefined : true}>
        <TeamDetail team={item} showTitle />
      </div>)}
    </div>
  </div></div>;
}
