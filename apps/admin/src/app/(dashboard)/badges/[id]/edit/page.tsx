import type { Metadata } from "next";
import { BadgeEditor } from "@/features/badges/components/badge-editor";
export const metadata: Metadata = { title: "Edit Badge" };
export default async function EditBadgePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <BadgeEditor badgeId={id} />; }
