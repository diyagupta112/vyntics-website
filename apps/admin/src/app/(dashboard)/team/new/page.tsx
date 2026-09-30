import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { TeamMemberForm } from "@/features/team-members/components/team-member-form";
import styles from "@/features/team-members/components/team-members.module.css";
export const metadata: Metadata = { title: "Create Team Member" };
export default function NewTeamMemberPage() { return <div className={styles.page}><PageHeader title="Create New Team Member" description="Add a Team Member, then manage their optional photo." /><TeamMemberForm /></div>; }
