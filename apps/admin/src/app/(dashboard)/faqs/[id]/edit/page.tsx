import type { Metadata } from "next";
import { FAQEditor } from "@/features/faqs/components/faq-editor";
export const metadata: Metadata = { title: "Edit FAQ" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <FAQEditor key={id} id={id} />; }
