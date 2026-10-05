"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { badgesApi } from "../api/badges";
import { badgeErrorMessage } from "../lib/errors";
import type { Badge } from "../types";
import { BadgeForm } from "./badge-form";
import { LogoControl } from "./logo-control";
import styles from "./badges.module.css";

export function BadgeEditor({ badgeId }: { badgeId: string }) {
  const router = useRouter();
  const [badge, setBadge] = useState<Badge>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const load = useCallback(async () => { setLoading(true); setError(undefined); try { setBadge(await badgesApi.get(badgeId)); } catch (caught) { setError(badgeErrorMessage(caught, "load this Badge")); } finally { setLoading(false); } }, [badgeId]);
  useEffect(() => { let active = true; badgesApi.get(badgeId).then((item) => { if (active) setBadge(item); }).catch((caught: unknown) => { if (active) setError(badgeErrorMessage(caught, "load this Badge")); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [badgeId]);
  async function remove() {
    if (!badge || deleteBusy) return;
    setDeleteBusy(true); setDeleteError(undefined);
    try { await badgesApi.delete(badge.id); router.push("/badges?deleted=1"); }
    catch (caught) { setDeleteError(badgeErrorMessage(caught, "delete this Badge")); }
    finally { setDeleteBusy(false); }
  }
  if (loading) return <div aria-label="Loading Badge" className={styles.page} role="status"><div className={styles.skeleton}/><p>Loading Badge…</p></div>;
  if (error || !badge) return <section className={styles.state} role="alert"><h1>Badge unavailable</h1><p>{error ?? "This Badge could not be loaded."}</p><div className={styles.actions}><Button onClick={() => void load()} variant="secondary">Try Again</Button><Link className={styles.secondaryLink} href="/badges">Back to Badges</Link></div></section>;
  return <div className={styles.page}>
    <PageHeader title={badge.name} description="Manage badge details, public visibility, and the optional logo." actions={<><Link className={styles.secondaryLink} href="/badges">Back to Badges</Link><Button onClick={() => setConfirming(true)} variant="destructive">Delete Permanently</Button></>} />
    <div className={styles.detailLayout}><BadgeForm badge={badge} onSaved={setBadge} /><aside className={styles.imagePanel}><LogoControl badge={badge} onChanged={setBadge} /></aside></div>
    {confirming ? <DeleteConfirmationDialog busy={deleteBusy} description={`“${badge.name}” and its managed logo will be permanently deleted. This action cannot be undone.`} error={deleteError} itemName={badge.name} onCancel={() => setConfirming(false)} onConfirm={() => void remove()} resourceLabel="Badge" /> : null}
  </div>;
}
