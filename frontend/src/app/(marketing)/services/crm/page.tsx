import type { Metadata } from "next";
import { ServicePage } from "@/components/pages/service-page";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "CRM Solutions",
  description: "CRM implementation, sales automation, system integrations, and analytics designed around your customer workflow.",
};

export default function CrmServicePage() {
  return <ServicePage service={services.crm} />;
}
