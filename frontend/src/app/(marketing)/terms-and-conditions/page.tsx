import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { termsSections } from "./content";

const title = "Terms & Conditions | Vyntics";
const description = "Read the Terms & Conditions governing the use of the Vyntics website and the general terms applicable to information, services, content, and website usage.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "https://vyntics.com/terms-and-conditions" },
  openGraph: { title, description, type: "website", url: "https://vyntics.com/terms-and-conditions" },
};

export default function TermsAndConditionsPage() {
  return <LegalPage
    title="Terms & Conditions"
    image="/images/terms-and-conditions.jpg"
    imageAlt="Hands signing a printed agreement with a pen, illustrating website terms and conditions"
    updated="21/10/2026"
    sections={termsSections}
  />;
}
