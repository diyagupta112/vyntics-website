import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/service-page";
import { services } from "@/content/services";

export const metadata: Metadata = { title: "Cloud Solutions", description: "Cloud architecture, migration, DevOps, reliability, and cost optimization across AWS, Azure, and Google Cloud." };
export default function CloudServicePage() { return <ServicePage service={services.cloud} />; }
