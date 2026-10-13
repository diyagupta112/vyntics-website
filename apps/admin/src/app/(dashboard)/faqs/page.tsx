import type { Metadata } from "next";
import { FAQList } from "@/features/faqs/components/faq-list";
export const metadata: Metadata = { title: "FAQs" };
export default function Page() { return <FAQList />; }
