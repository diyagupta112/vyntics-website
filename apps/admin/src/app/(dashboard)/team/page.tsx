import type { Metadata } from "next";
import { TeamMemberList } from "@/features/team-members/components/team-member-list";
export const metadata: Metadata = { title: "Team Members" };
export default function TeamMembersPage() { return <TeamMemberList />; }
