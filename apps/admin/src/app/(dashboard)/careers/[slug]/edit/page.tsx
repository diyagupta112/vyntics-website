import type { Metadata } from "next";
import { CareerEditor } from "@/features/careers/components/career-editor";

export const metadata: Metadata = { title: "Edit Career" };

export default async function EditCareerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CareerEditor careerSlug={slug} />;
}
