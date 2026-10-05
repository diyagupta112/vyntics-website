import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerServiceDetail } from "@/components/pages/inner-service-detail";
import { aiServices, aiServiceSlugs, isAiServiceSlug } from "@/content/ai-services";

export const dynamicParams = false;

export function generateStaticParams() {
  return aiServiceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/ai/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!isAiServiceSlug(slug)) return {};
  const service = aiServices[slug];
  return { title: service.name, description: service.metadataDescription };
}

export default async function AiServiceDetailPage({ params }: PageProps<"/services/ai/[slug]">) {
  const { slug } = await params;
  if (!isAiServiceSlug(slug)) notFound();
  return <InnerServiceDetail service={aiServices[slug]} />;
}
