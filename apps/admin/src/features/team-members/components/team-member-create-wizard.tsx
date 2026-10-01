"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateFlowActions, TwoStepCreateFlow } from "@/components/create-flow/two-step-create-flow";
import type { TeamMember } from "../types";
import { PhotoControl } from "./photo-control";
import { TeamMemberForm } from "./team-member-form";

const steps = [
  { label: "Details", title: "Add Team Member Details", description: "Enter the profile information and display settings." },
  { label: "Photo", title: "Add Photo", description: "The Team Member has been created. Add an optional profile photo, then finish." },
] satisfies [{ label: string; title: string; description: string }, { label: string; title: string; description: string }];

export function TeamMemberCreateWizard() {
  const router = useRouter();
  const [member, setMember] = useState<TeamMember>();
  const [step, setStep] = useState<1 | 2>(1);
  const [imageBusy, setImageBusy] = useState(false);
  function advance(saved: TeamMember) { setMember(saved); setStep(2); }
  return <TwoStepCreateFlow currentStep={step} steps={steps}>
    {step === 1 ? <TeamMemberForm member={member} createFlow onCreated={advance} onSaved={advance} /> : member ? <>
      <PhotoControl member={member} onBusyChange={setImageBusy} onChanged={setMember} />
      <CreateFlowActions backLabel="← Back" busy={imageBusy} busyLabel="Uploading…" onBack={() => setStep(1)} onPrimary={() => router.push(`/team/${member.id}/edit?created=1`)} primaryLabel="Save & Finish" />
    </> : null}
  </TwoStepCreateFlow>;
}
