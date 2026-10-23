import type { Metadata } from "next";
import { LifeList } from "@/features/life-at-vyntics/components/life-list";
export const metadata: Metadata = { title: "Life at Vyntics" };
export default function LifeAtVynticsPage() { return <LifeList />; }
