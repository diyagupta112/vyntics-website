import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/service-page";
import { services } from "@/content/services";

export const metadata: Metadata = { title: "Backend, Integrations & Advisory", description: "Production backend services, APIs, system integrations, workflow automation, and technical advisory." };
export default function OtherServicePage() { return <ServicePage service={services.other} />; }
