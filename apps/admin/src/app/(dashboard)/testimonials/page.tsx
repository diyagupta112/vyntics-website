import type { Metadata } from "next";
import { TestimonialList } from "@/features/testimonials/components/testimonial-list";
export const metadata: Metadata = { title: "Testimonials" };
export default function Page() { return <TestimonialList />; }
