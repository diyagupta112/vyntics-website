import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/service-page";
import { services } from "@/content/services";

export const metadata: Metadata = { title: "Data Engineering & Analytics", description: "Reliable data pipelines, warehousing, integration, analytics, and business intelligence systems." };
export default function DataServicePage() { return <ServicePage service={services.data} />; }
