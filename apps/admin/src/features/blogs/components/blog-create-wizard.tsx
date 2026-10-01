"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateFlowActions, TwoStepCreateFlow } from "@/components/create-flow/two-step-create-flow";
import type { Blog } from "../types";
import { BlogForm } from "./blog-form";
import { CoverImageControl } from "./cover-image-control";

const steps = [
  { label: "Content", title: "Add Blog Content", description: "Enter the editorial, publication, and search information for this Blog." },
  { label: "Cover Image", title: "Add Cover Image", description: "The Blog has been created. Add its cover now, or finish without one while it remains unpublished." },
] satisfies [{ label: string; title: string; description: string }, { label: string; title: string; description: string }];

export function BlogCreateWizard() {
  const router = useRouter();
  const [blog, setBlog] = useState<Blog>();
  const [step, setStep] = useState<1 | 2>(1);
  const [imageBusy, setImageBusy] = useState(false);
  function advance(saved: Blog) { setBlog(saved); setStep(2); }
  return <TwoStepCreateFlow currentStep={step} steps={steps}>
    {step === 1 ? <BlogForm blog={blog} createFlow onCreated={advance} onSaved={advance} /> : blog ? <>
      <CoverImageControl blog={blog} onBusyChange={setImageBusy} onChanged={setBlog} />
      <CreateFlowActions backLabel="← Back" busy={imageBusy} busyLabel="Uploading…" onBack={() => setStep(1)} onPrimary={() => router.push(`/blogs/${blog.id}/edit?created=1`)} primaryLabel="Save & Finish" />
    </> : null}
  </TwoStepCreateFlow>;
}
