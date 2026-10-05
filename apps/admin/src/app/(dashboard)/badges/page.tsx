import type { Metadata } from "next";
import { BadgeList } from "@/features/badges/components/badge-list";
export const metadata: Metadata = { title: "Badges" };
export default function BadgesPage() { return <BadgeList />; }
