import type { Metadata } from "next";
import { ContactUs } from "@/components/sections/contact/contact-us";

export const metadata: Metadata = {
  title: "Contact Vyntics | Data Engineering & AI Consulting",
  description: "Get in touch with Vyntics about data engineering, analytics, cloud, CRM or AI. Send us a message or find our Jaipur office.",
  alternates: { canonical: "/contact-us" },
};

export default function ContactUsPage() {
  return <ContactUs />;
}
