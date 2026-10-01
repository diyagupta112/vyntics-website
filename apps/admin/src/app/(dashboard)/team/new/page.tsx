import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { TeamMemberCreateWizard } from "@/features/team-members/components/team-member-create-wizard";
import styles from "@/features/team-members/components/team-members.module.css";
export const metadata: Metadata = { title: "Create Team Member" };
export default function NewTeamMemberPage() { return <div className={styles.page}><PageHeader title="Create New Team Member" description="Complete the profile details first, then add an optional photo." /><TeamMemberCreateWizard /></div>; }
