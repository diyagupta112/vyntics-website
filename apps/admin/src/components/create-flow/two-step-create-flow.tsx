"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import styles from "./two-step-create-flow.module.css";

type Step = { label: string; title: string; description: string };

export function TwoStepCreateFlow({ children, currentStep, steps }: { children: ReactNode; currentStep: 1 | 2; steps: [Step, Step] }) {
  const active = steps[currentStep - 1];
  return <div className={styles.flow}>
    <nav aria-label="Creation progress" className={styles.progress}>
      <p>Step {currentStep} of 2</p>
      <ol>{steps.map((step, index) => { const number = index + 1; const state = number < currentStep ? "complete" : number === currentStep ? "current" : "upcoming"; return <li aria-current={state === "current" ? "step" : undefined} className={styles[state]} key={step.label}><span aria-hidden="true" className={styles.marker}>{state === "complete" ? "✓" : number}</span><span><strong>{step.label}</strong><small>{state === "complete" ? "Complete" : state === "current" ? "Current step" : "Up next"}</small></span></li>; })}</ol>
    </nav>
    <div className={styles.stepHeading}><p>Step {currentStep} of 2</p><h2>{active.title}</h2><p>{active.description}</p></div>
    {children}
  </div>;
}

export function CreateFlowActions({ backHref, backLabel, busy = false, busyLabel, onBack, onPrimary, primaryLabel, primaryType = "button" }: { backHref?: string; backLabel: string; busy?: boolean; busyLabel: string; onBack?: () => void; onPrimary?: () => void; primaryLabel: string; primaryType?: "button" | "submit" }) {
  return <div className={styles.actions}>
    {backHref ? <Link className={styles.secondaryAction} href={backHref}>{backLabel}</Link> : <Button disabled={busy} onClick={onBack} type="button" variant="secondary">{backLabel}</Button>}
    <Button disabled={busy} onClick={onPrimary} type={primaryType}>{busy ? busyLabel : primaryLabel}</Button>
  </div>;
}
