import type { Metadata } from "next";
import { ContactCta } from "@/components/sections/home/contact-cta";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <ContactCta />;
}
