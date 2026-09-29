import type { Metadata } from "next";
import { CaseStudyList } from "@/features/case-studies/components/case-study-list";

export const metadata: Metadata = { title: "Case Studies" };

export default function CaseStudiesPage() {
  return <CaseStudyList />;
}
