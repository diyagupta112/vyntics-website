"use client";

import { useState } from "react";
import Link from "next/link";
import { useAutoRotate } from "@/components/ui/use-auto-rotate";
import styles from "./agent-teams.module.css";

type Team = {
  readonly name: string;
  readonly description: string;
  readonly focus: readonly { readonly title: string; readonly description: string }[];
  readonly control: string;
  readonly cta: string;
};

const pad = (index: number) => String(index + 1).padStart(2, "0");

type Options = {
  titleTemplate: string;
  controlLabel: string;
  ctaLabel: string;
  ctaHref: string;
};

function TeamDetail({ team, showTitle, options }: { team: Team; showTitle: boolean; options: Options }) {
  return <>
    {showTitle && <h3>{options.titleTemplate.replace("{name}", team.name)}</h3>}
    <p className={styles.description}>{team.description}</p>
    <ul className={styles.tasks}>
      {team.focus.map(point => <li key={point.title}><strong>{point.title}</strong><span>{point.description}</span></li>)}
    </ul>
    <p className={styles.control}><strong>{options.controlLabel}</strong><span>{team.control}</span></p>
    <p className={styles.cta}>
      <span>{team.cta}</span>
      <Link href={options.ctaHref}>{options.ctaLabel} <span aria-hidden="true">→</span></Link>
    </p>
  </>;
}

export function AgentTeams({ teams, titleTemplate = "AI agents for {name}", controlLabel = "Where people stay in control", ctaLabel = "Talk to our experts", ctaHref = "/#contact", idPrefix = "agent-team", navLabel = "Teams" }: {
  teams: readonly Team[];
  titleTemplate?: string;
  controlLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  idPrefix?: string;
  navLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const rotate = useAutoRotate(teams.length, active, setActive);
  const options: Options = { titleTemplate, controlLabel, ctaLabel, ctaHref };
  return <div {...rotate.props} className={styles.track} data-reveal={`${idPrefix}s-layout`}><div className={styles.layout}>
    <div className={styles.navWrap}>
      <ul className={styles.nav} aria-label={navLabel}>
        {teams.map((item, index) => <li key={item.name} data-active={active === index}>
          <button type="button" className={styles.tab} aria-current={active === index ? "true" : undefined} aria-expanded={active === index} aria-controls={`${idPrefix}-${index}`} onClick={() => setActive(index)}>
            <span className={styles.index} aria-hidden="true">{pad(index)}</span>
            <span className={styles.name}>{item.name}</span>
          </button>
          <div id={`${idPrefix}-${index}`} className={styles.mobile}>
            <TeamDetail team={item} showTitle={false} options={options} />
          </div>
        </li>)}
      </ul>
    </div>
    <div className={styles.panel} aria-live="polite">
      <div className={styles.decor} aria-hidden="true">
        <svg viewBox="0 0 320 120" preserveAspectRatio="xMaxYMin meet" focusable="false">
          <path d="M30 60 H110 M110 60 L170 30 H250 M110 60 L170 90 H250" />
          <circle cx="30" cy="60" r="8" />
          <circle cx="110" cy="60" r="8" />
          <circle cx="170" cy="30" r="6" />
          <circle cx="170" cy="90" r="6" />
          <rect x="250" y="20" width="40" height="20" rx="6" />
          <rect x="250" y="80" width="40" height="20" rx="6" />
        </svg>
      </div>
      {teams.map((item, index) => <div key={item.name} className={styles.body} data-active={active === index} aria-hidden={active === index ? undefined : true}>
        <TeamDetail team={item} showTitle options={options} />
      </div>)}
    </div>
  </div></div>;
}
