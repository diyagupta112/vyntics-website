import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerServiceDetail } from "@/components/pages/inner-service-detail";
import { getPlatformService, getPlatformServiceSlugs } from "@/content/platform-services";

export const dynamicParams = false;
type ServicePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPlatformServiceSlugs("cloud").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getPlatformService("cloud", slug);
  return service ? { title: service.name, description: service.metadataDescription } : {};
}

export default async function CloudServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getPlatformService("cloud", slug);
  if (!service) notFound();
  return <InnerServiceDetail service={service} />;
}
