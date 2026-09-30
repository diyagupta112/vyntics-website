import type { Metadata } from "next";
import { CaseStudyEditor } from "@/features/case-studies/components/case-study-editor";

export const metadata: Metadata = { title: "Edit Case Study" };

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseStudyEditor caseStudyId={id} />;
}
