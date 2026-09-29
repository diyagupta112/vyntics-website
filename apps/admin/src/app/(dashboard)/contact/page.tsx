import type { Metadata } from "next";
import { ContactSubmissionsPage } from "@/features/contact-submissions/components/contact-submissions-page";

export const metadata: Metadata = { title: "Contact Submissions" };

export default function ContactPage() {
  return <ContactSubmissionsPage />;
}
