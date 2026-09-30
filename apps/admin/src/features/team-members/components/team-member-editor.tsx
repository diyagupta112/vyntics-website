"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { teamMembersApi } from "../api/team-members";
import { teamMemberErrorMessage } from "../lib/errors";
import type { TeamMember } from "../types";
import { ConfirmDelete } from "./confirm-delete";
import { PhotoControl } from "./photo-control";
import { TeamMemberForm } from "./team-member-form";
import styles from "./team-members.module.css";
export function TeamMemberEditor({ teamMemberId }: { teamMemberId: string }) {
  const router = useRouter(); const [member, setMember] = useState<TeamMember>(); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>(); const [confirming, setConfirming] = useState(false); const [deleteBusy, setDeleteBusy] = useState(false); const [deleteError, setDeleteError] = useState<string>();
  const load = useCallback(async () => { setLoading(true); setError(undefined); try { setMember(await teamMembersApi.get(teamMemberId)); } catch (caught) { setError(teamMemberErrorMessage(caught, "load this Team Member")); } finally { setLoading(false); } }, [teamMemberId]);
  useEffect(() => { let active = true; teamMembersApi.get(teamMemberId).then((item) => { if (active) setMember(item); }).catch((caught: unknown) => { if (active) setError(teamMemberErrorMessage(caught, "load this Team Member")); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [teamMemberId]);
  async function remove() { if (!member || deleteBusy) return; setDeleteBusy(true); setDeleteError(undefined); try { await teamMembersApi.delete(member.id); router.push("/team?deleted=1"); } catch (caught) { setDeleteError(teamMemberErrorMessage(caught, "delete this Team Member")); } finally { setDeleteBusy(false); } }
  if (loading) return <div aria-label="Loading Team Member" className={styles.page} role="status"><div className={styles.skeleton}/><p>Loading Team Member…</p></div>;
  if (error || !member) return <section className={styles.state} role="alert"><h1>Team Member unavailable</h1><p>{error ?? "This Team Member could not be loaded."}</p><div className={styles.actions}><Button onClick={() => void load()} variant="secondary">Try again</Button><Link className={styles.secondaryLink} href="/team">Back to Team Members</Link></div></section>;
  return <div className={styles.page}><PageHeader title={member.name} description="Manage complete Team Member details and their optional photo." actions={<Link className={styles.secondaryLink} href="/team">Back to Team Members</Link>}/><div className={styles.detailLayout}><TeamMemberForm member={member} onSaved={setMember}/><aside className={styles.imagePanel}><PhotoControl member={member} onChanged={setMember}/></aside></div><section className={styles.dangerZone}><div><h2>Delete Team Member</h2><p>Permanently remove this profile.</p></div><Button onClick={() => setConfirming(true)} variant="destructive">Delete Team Member</Button></section>{confirming ? <ConfirmDelete busy={deleteBusy} error={deleteError} name={member.name} onCancel={() => setConfirming(false)} onConfirm={() => void remove()}/> : null}</div>;
}
