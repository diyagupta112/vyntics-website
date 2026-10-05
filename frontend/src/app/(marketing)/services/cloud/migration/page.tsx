import type { Metadata } from "next";
import { CloudServicePage } from "../cloud-service-page";
import { cloudServices } from "../cloud-services";

const service = cloudServices.migration;
export const metadata: Metadata = { title: service.title, description: service.metaDescription };
export default function CloudMigrationPage() { return <CloudServicePage service={service} />; }
