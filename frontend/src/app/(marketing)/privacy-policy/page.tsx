import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { policyIntro, policySections } from "./content";

const title = "Privacy Policy | Vyntics";
const description = "Read how Vyntics collects, uses, shares, and protects information when you visit our website, contact us, or apply for a role.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "https://vyntics.com/privacy-policy" },
  openGraph: { title, description, type: "website", url: "https://vyntics.com/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return <LegalPage
    title="Privacy Policy"
    image="/images/privacy-policy-v2.jpg"
    imageAlt="Person typing on a laptop in a dimly lit room, illustrating digital privacy"
    updated="21/10/2026"
    intro={policyIntro}
    sections={policySections}
  />;
}
