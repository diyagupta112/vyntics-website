import type { Metadata } from "next";
import { CloudServicePage } from "../cloud-service-page";
import { cloudServices } from "../cloud-services";

const service = cloudServices.architecture;
export const metadata: Metadata = { title: service.title, description: service.metaDescription };
export default function CloudArchitecturePage() { return <CloudServicePage service={service} />; }
