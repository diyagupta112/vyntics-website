"use client";

import { useState } from "react";
import { useAutoRotate } from "@/components/ui/use-auto-rotate";
import styles from "./use-case-explorer.module.css";

type UseCase = {
  readonly name: string;
  readonly description: string;
  readonly focus: readonly { readonly title: string; readonly description: string }[];
  readonly control: string;
  readonly cta: string;
};

const pad = (index: number) => String(index + 1).padStart(2, "0");

function UseCaseDetail({ team, showTitle }: { team: UseCase; showTitle: boolean }) {
  return <>
    {showTitle && <h3>{team.name}</h3>}
    <p className={styles.description}>{team.description}</p>
    <ul className={styles.tasks}>
      {team.focus.map(point => <li key={point.title}><strong>{point.title}</strong><span>{point.description}</span></li>)}
    </ul>
    <p className={styles.control}><strong>Where people stay in control</strong><span>{team.control}</span></p>
    <p className={styles.cta}>
      <span>{team.cta}</span>
      <a href="/contact-us">Talk to our experts <span aria-hidden="true">→</span></a>
    </p>
  </>;
}

export function UseCaseExplorer({ items }: { items: readonly UseCase[] }) {
  const [active, setActive] = useState(0);
  const rotate = useAutoRotate(items.length, active, setActive);
  return <div {...rotate.props} className={styles.track} data-reveal="automation-use-cases-layout"><div className={styles.layout}>
    <div className={styles.navWrap}>
      <ul className={styles.nav} aria-label="Use cases">
        {items.map((item, index) => <li key={item.name} data-active={active === index}>
          <button type="button" className={styles.tab} aria-current={active === index ? "true" : undefined} aria-expanded={active === index} aria-controls={`automation-use-case-${index}`} onClick={() => setActive(index)}>
            <span className={styles.index} aria-hidden="true">{pad(index)}</span>
            <span className={styles.name}>{item.name}</span>
          </button>
          <div id={`automation-use-case-${index}`} className={styles.mobile}>
            <UseCaseDetail team={item} showTitle={false} />
          </div>
        </li>)}
      </ul>
    </div>
    <div className={styles.panel} aria-live="polite">
      <div className={styles.decor} aria-hidden="true">
        <svg viewBox="0 0 320 120" preserveAspectRatio="xMaxYMin meet" focusable="false">
          <rect x="24" y="14" width="44" height="58" rx="6" />
          <path d="M34 32 H58 M34 44 H58 M34 56 H48" />
          <path d="M78 43 H130" />
          <rect x="138" y="24" width="56" height="38" rx="6" />
          <path d="M148 38 H184 M148 48 H172" />
          <path d="M204 43 H246" />
          <circle cx="268" cy="43" r="18" />
          <path d="M259 43 L266 50 L278 36" />
        </svg>
      </div>
      {items.map((item, index) => <div key={item.name} className={styles.body} data-active={active === index} aria-hidden={active === index ? undefined : true}>
        <UseCaseDetail team={item} showTitle />
      </div>)}
    </div>
  </div></div>;
}
