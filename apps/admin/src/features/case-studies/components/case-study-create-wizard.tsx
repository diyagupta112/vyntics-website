"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateFlowActions, TwoStepCreateFlow } from "@/components/create-flow/two-step-create-flow";
import type { CaseStudy } from "../types";
import { CaseStudyForm } from "./case-study-form";
import { CoverImageControl } from "./cover-image-control";

const steps = [
  { label: "Details", title: "Add Case Study Content", description: "Enter the project details, metadata, and structured content." },
  { label: "Cover Image", title: "Add Cover Image", description: "The Case Study has been created. Add its cover now, or finish without one while it remains unpublished." },
] satisfies [{ label: string; title: string; description: string }, { label: string; title: string; description: string }];

export function CaseStudyCreateWizard() {
  const router = useRouter();
  const [caseStudy, setCaseStudy] = useState<CaseStudy>();
  const [step, setStep] = useState<1 | 2>(1);
  const [imageBusy, setImageBusy] = useState(false);
  function advance(saved: CaseStudy) { setCaseStudy(saved); setStep(2); }
  return <TwoStepCreateFlow currentStep={step} steps={steps}>
    {step === 1 ? <CaseStudyForm caseStudy={caseStudy} createFlow onCreated={advance} onSaved={advance} /> : caseStudy ? <>
      <CoverImageControl caseStudy={caseStudy} onBusyChange={setImageBusy} onChanged={setCaseStudy} />
      <CreateFlowActions backLabel="← Back" busy={imageBusy} busyLabel="Uploading…" onBack={() => setStep(1)} onPrimary={() => router.push(`/case-studies/${caseStudy.id}/edit?created=1`)} primaryLabel="Save & Finish" />
    </> : null}
  </TwoStepCreateFlow>;
}
