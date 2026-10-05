import type { Metadata } from "next";
import { CloudServicePage } from "../cloud-service-page";
import { cloudServices } from "../cloud-services";

const service = cloudServices["reliability-monitoring"];
export const metadata: Metadata = { title: service.title, description: service.metaDescription };
export default function CloudReliabilityMonitoringPage() { return <CloudServicePage service={service} />; }
