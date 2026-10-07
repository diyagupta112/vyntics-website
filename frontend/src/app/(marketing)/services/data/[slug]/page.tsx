import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerServiceDetail } from "@/components/pages/inner-service-detail";
import { dataServices, dataServiceSlugs, isDataServiceSlug } from "@/content/data-services";

export const dynamicParams = false;
type ServicePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return dataServiceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = isDataServiceSlug(slug) && Object.hasOwn(dataServices, slug) ? dataServices[slug] : undefined;
  return service ? { title: service.name, description: service.metadataDescription } : {};
}

export default async function DataServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = isDataServiceSlug(slug) && Object.hasOwn(dataServices, slug) ? dataServices[slug] : undefined;
  if (!service) notFound();
  return <InnerServiceDetail service={service} />;
}
