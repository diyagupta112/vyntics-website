import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerServiceDetail } from "@/components/pages/inner-service-detail";
import { dataServices, dataServiceSlugs, isDataServiceSlug } from "@/content/data-services";

export const dynamicParams = false;

export function generateStaticParams() {
  return dataServiceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/data/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!isDataServiceSlug(slug)) return {};
  const service = dataServices[slug];
  return { title: service.name, description: service.metadataDescription };
}

export default async function DataServiceDetailPage({ params }: PageProps<"/services/data/[slug]">) {
  const { slug } = await params;
  if (!isDataServiceSlug(slug)) notFound();
  return <InnerServiceDetail service={dataServices[slug]} />;
}
