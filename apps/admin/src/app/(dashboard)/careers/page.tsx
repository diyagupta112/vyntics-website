import type { Metadata } from "next";
import { CareerList } from "@/features/careers/components/career-list";

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage() {
  return <CareerList />;
}
