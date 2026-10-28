import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerServiceDetail } from "@/components/pages/inner-service-detail";
import { getPlatformService, getPlatformServiceSlugs } from "@/content/platform-services";

export const dynamicParams = false;
type ServicePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPlatformServiceSlugs("data").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getPlatformService("data", slug);
  return service ? {
    title: service.name,
    description: service.metadataDescription,
    alternates: { canonical: `${SITE_URL}/services/data-engineering/${service.slug}` },
  } : {};
}

export default async function DataServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getPlatformService("data", slug);
  if (!service) notFound();
  return <InnerServiceDetail service={service} />;
}
