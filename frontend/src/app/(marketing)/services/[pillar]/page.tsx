import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/pages/service-page";
import CloudPage from "../cloud/page";
import { servicePillars, getServicePillar } from "@/content/service-architecture";
export const dynamicParams = false;
type Props = { params: Promise<{ pillar: string }> };
export function generateStaticParams() { return servicePillars.map(({ slug }) => ({ pillar: slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const item = getServicePillar((await params).pillar); return item ? { title: item.name, description: item.content.introduction } : {}; }
export default async function Page({ params }: Props) { const item = getServicePillar((await params).pillar); if (!item) notFound(); return item.slug === "cloud-foundations" ? <CloudPage /> : <ServicePage service={item.content} />; }
