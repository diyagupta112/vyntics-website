import { CloudServicePage } from "../../cloud/cloud-service-page";
import { canonicalCloudServices } from "../../cloud/canonical-cloud-services";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerServiceDetail } from "@/components/pages/inner-service-detail";
import { servicePillars, getServicePillar } from "@/content/service-architecture";
export const dynamicParams = false;
type Props = { params: Promise<{ pillar: string; slug: string }> };
export function generateStaticParams() { return servicePillars.flatMap(pillar => pillar.services.map(service => ({ pillar: pillar.slug, slug: service.slug }))); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { pillar, slug } = await params; const item = getServicePillar(pillar)?.services.find(item => item.slug === slug); return item ? { title: item.name, description: item.metadataDescription } : {}; }
export default async function Page({ params }: Props) { const { pillar, slug } = await params; const group = getServicePillar(pillar); const item = group?.services.find(item => item.slug === slug); if (!item || !group) notFound(); if (pillar === "cloud-foundations") { const cloud = canonicalCloudServices.find(service => service.slug === slug); if (!cloud) notFound(); return <CloudServicePage service={cloud} serviceList={canonicalCloudServices} />; } return <InnerServiceDetail service={item} parent={{ name: group.name, href: `/services/${pillar}` }} />; }
