"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateFlowActions, TwoStepCreateFlow } from "@/components/create-flow/two-step-create-flow";
import type { Badge } from "../types";
import { BadgeForm } from "./badge-form";
import { LogoControl } from "./logo-control";

const steps = [
  { label: "Details", title: "Badge Details", description: "Enter the badge information, public order, and visibility." },
  { label: "Logo", title: "Badge Logo", description: "The badge has been created. Add an optional logo, then finish." },
] satisfies [{ label: string; title: string; description: string }, { label: string; title: string; description: string }];

export function BadgeCreateWizard() {
  const router = useRouter();
  const [badge, setBadge] = useState<Badge>();
  const [step, setStep] = useState<1 | 2>(1);
  const [logoBusy, setLogoBusy] = useState(false);
  function advance(saved: Badge) { setBadge(saved); setStep(2); }
  return <TwoStepCreateFlow currentStep={step} steps={steps}>
    {step === 1 ? <BadgeForm badge={badge} createFlow onCreated={advance} onSaved={advance} /> : badge ? <>
      <LogoControl badge={badge} onBusyChange={setLogoBusy} onChanged={setBadge} />
      <CreateFlowActions backLabel="← Back" busy={logoBusy} busyLabel="Uploading…" onBack={() => setStep(1)} onPrimary={() => router.push(`/badges/${badge.id}/edit?created=1`)} primaryLabel="Save & Finish" />
    </> : null}
  </TwoStepCreateFlow>;
}
