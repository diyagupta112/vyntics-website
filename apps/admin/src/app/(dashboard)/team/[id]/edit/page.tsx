import type { Metadata } from "next";
import { TeamMemberEditor } from "@/features/team-members/components/team-member-editor";
export const metadata: Metadata = { title: "Edit Team Member" };
export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TeamMemberEditor teamMemberId={id} />; }
