import type { Metadata } from "next";
import { LifeEditor } from "@/features/life-at-vyntics/components/life-editor";
export const metadata: Metadata = { title: "Edit Life at Vyntics Image" };
export default async function EditLifeAtVynticsPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <LifeEditor itemId={id} />; }
