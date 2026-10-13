import type { Metadata } from "next";
import { TestimonialEditor } from "@/features/testimonials/components/testimonial-editor";
export const metadata: Metadata = { title: "Edit Testimonial" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TestimonialEditor key={id} id={id} />; }
