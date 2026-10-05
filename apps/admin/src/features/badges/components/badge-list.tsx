"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { badgesApi } from "../api/badges";
import { badgeErrorMessage } from "../lib/errors";
import type { Badge } from "../types";
import styles from "./badges.module.css";

export function BadgeList() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [deleting, setDeleting] = useState<Badge>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try { setBadges(await badgesApi.list()); }
    catch (caught) { setError(badgeErrorMessage(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    badgesApi.list().then((items) => { if (active) setBadges(items); }).catch((caught: unknown) => { if (active) setError(badgeErrorMessage(caught)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true); setDeleteError(undefined);
    try { await badgesApi.delete(deleting.id); setBadges((items) => items.filter((item) => item.id !== deleting.id)); setDeleting(undefined); }
    catch (caught) { setDeleteError(badgeErrorMessage(caught, "delete this Badge")); }
    finally { setDeleteBusy(false); }
  }

  return <div className={styles.page}>
    <PageHeader title="Badges" description="Manage partner, certification, and trust badges displayed on the Vyntics website." actions={<Link className={styles.primaryLink} href="/badges/new">+ Create New Badge</Link>} />
    {loading ? <div aria-label="Loading Badges" role="status"><div className={styles.skeletonGrid}><div className={styles.skeleton}/><div className={styles.skeleton}/><div className={styles.skeleton}/></div><p className={styles.muted}>Loading Badges…</p></div> : null}
    {!loading && error ? <section className={styles.state} role="alert"><h2>Unable to load badges.</h2><p>{error}</p><Button onClick={() => void load()} variant="secondary">Try Again</Button></section> : null}
    {!loading && !error && badges.length === 0 ? <section className={styles.state}><h2>No badges yet.</h2><p>Create the first badge to get started.</p><Link className={styles.primaryLink} href="/badges/new">Create New Badge</Link></section> : null}
    {!loading && !error && badges.length ? <div className={styles.badgeGrid}>{badges.map((badge) => <article className={styles.badgeCard} key={badge.id}>
      <Link aria-label={`Open ${badge.name} for editing`} className={styles.cardMain} href={`/badges/${encodeURIComponent(badge.id)}/edit`}>
        <div className={styles.logoFrame}>{badge.logo_url ? <Image alt={`${badge.name} logo`} className={styles.cardLogo} fill sizes="(max-width: 42rem) calc(100vw - 3rem), (max-width: 72rem) 40vw, 24vw" src={badge.logo_url} unoptimized /> : <span>No logo</span>}</div>
        <div className={styles.cardCopy}><div className={styles.cardHeading}><h2>{badge.name}</h2><span className={`${styles.statusBadge} ${badge.is_active ? styles.activeBadge : styles.inactiveBadge}`}>{badge.is_active ? "Active" : "Inactive"}</span></div>{badge.description ? <p className={styles.cardDescription}>{badge.description}</p> : null}<p className={styles.order}>Display order {badge.display_order}</p></div>
      </Link>
      <div className={styles.cardActions}>{badge.website_url ? <a className={styles.externalLink} href={badge.website_url} rel="noreferrer" target="_blank">Visit website <span className={styles.visuallyHidden}>(opens in a new tab)</span></a> : <span className={styles.muted}>Website not provided</span>}<Button aria-label={`Delete ${badge.name}`} onClick={() => setDeleting(badge)} variant="destructive">Delete</Button></div>
    </article>)}</div> : null}
    {deleting ? <DeleteConfirmationDialog busy={deleteBusy} description={`“${deleting.name}” and its managed logo will be permanently deleted. This action cannot be undone.`} error={deleteError} itemName={deleting.name} onCancel={() => setDeleting(undefined)} onConfirm={() => void confirmDelete()} resourceLabel="Badge" /> : null}
  </div>;
}
