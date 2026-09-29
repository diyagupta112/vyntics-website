"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { teamMembersApi } from "../api/team-members";
import { teamMemberErrorMessage } from "../lib/errors";
import type { TeamMember } from "../types";
import styles from "./team-members.module.css";

export function TeamMemberList() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const load = useCallback(async () => { setLoading(true); setError(undefined); try { setMembers(await teamMembersApi.list()); } catch (caught) { setError(teamMemberErrorMessage(caught)); } finally { setLoading(false); } }, []);
  useEffect(() => { let active = true; teamMembersApi.list().then((items) => { if (active) setMembers(items); }).catch((caught: unknown) => { if (active) setError(teamMemberErrorMessage(caught)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return <div className={styles.page}>
    <PageHeader title="Team Members" description="Manage leadership and team profiles." actions={<Link className={styles.primaryLink} href="/team/new">Create New Team Member</Link>} />
    {loading ? <div aria-label="Loading Team Members" role="status"><div className={styles.skeletonGrid}><div className={styles.skeleton}/><div className={styles.skeleton}/></div><p className={styles.muted}>Loading Team Members…</p></div> : null}
    {!loading && error ? <section className={styles.state} role="alert"><h2>Team Members could not be loaded</h2><p>{error}</p><Button onClick={() => void load()} variant="secondary">Try again</Button></section> : null}
    {!loading && !error && members.length === 0 ? <section className={styles.state}><h2>No Team Members yet</h2><p>Create the first profile to get started.</p><Link className={styles.primaryLink} href="/team/new">Create New Team Member</Link></section> : null}
    {!loading && !error && members.length ? <div className={styles.memberGrid}>{members.map((member) => <Link aria-label={`Open ${member.name} for editing`} className={styles.memberCard} href={`/team/${encodeURIComponent(member.id)}/edit`} key={member.id}>
      {member.photo_url ? <Image alt={`Photo of ${member.name}`} className={styles.memberPhoto} height={640} src={member.photo_url} unoptimized width={520}/> : <div className={styles.photoPlaceholder}>No photo</div>}
      <div className={styles.cardCopy}><h2>{member.name}</h2><p>{member.role}</p></div>
    </Link>)}</div> : null}
  </div>;
}
