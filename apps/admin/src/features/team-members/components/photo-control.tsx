"use client";
import { type ChangeEvent, useRef, useState } from "react";
import { CompactImagePreview } from "@/components/media/compact-image-preview";
import { Button } from "@/components/ui/button";
import { teamMembersApi } from "../api/team-members";
import { teamMemberErrorMessage } from "../lib/errors";
import type { TeamMember } from "../types";
import styles from "./team-members.module.css";
const MAX = 5 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
export function validateTeamPhoto(file: File) { if (!file.size) return "Choose a non-empty image."; if (file.size > MAX) return "The image must be 5 MB or smaller."; const ext = file.name.split(".").pop()?.toLowerCase(); if (!TYPES.has(file.type) || !ext || !EXTENSIONS.has(ext)) return "Choose a JPEG, PNG, or WebP image."; }
export function PhotoControl({ member, onBusyChange, onChanged }: { member: TeamMember; onBusyChange?: (busy: boolean) => void; onChanged: (member: TeamMember) => void }) {
  const input = useRef<HTMLInputElement>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState<string>(); const [message, setMessage] = useState<string>();
  async function upload(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file || busy) return; const problem = validateTeamPhoto(file); if (problem) { setError(problem); event.target.value = ""; return; } setBusy(true); onBusyChange?.(true); setError(undefined); setMessage(undefined); try { const updated = await teamMembersApi.uploadPhoto(member.id, file); onChanged(updated); setMessage(member.photo_url ? "Photo replaced." : "Photo uploaded."); } catch (caught) { setError(teamMemberErrorMessage(caught, "upload the photo")); } finally { setBusy(false); onBusyChange?.(false); event.target.value = ""; } }
  async function remove() { if (busy) return; setBusy(true); onBusyChange?.(true); setError(undefined); setMessage(undefined); try { await teamMembersApi.deletePhoto(member.id); onChanged({ ...member, photo_url: null }); setMessage("Photo removed."); } catch (caught) { setError(teamMemberErrorMessage(caught, "remove the photo")); } finally { setBusy(false); onBusyChange?.(false); } }
  return <section aria-labelledby="member-photo-heading" className={styles.section}><div className={styles.sectionHeading}><h2 id="member-photo-heading">Photo</h2><p>JPEG, PNG, or WebP. Maximum 5 MB.</p></div><div className={styles.photoControl}><CompactImagePreview alt={`Photo of ${member.name}`} emptyText="No photo uploaded" imageUrl={member.photo_url} label="Team Member photo"/><input accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" aria-label="Choose Team Member photo" className={styles.fileInput} disabled={busy} onChange={(event) => void upload(event)} ref={input} type="file"/><div className={styles.actions}><Button disabled={busy} onClick={() => input.current?.click()} variant="secondary">{busy ? "Working…" : member.photo_url ? "Replace photo" : "Upload photo"}</Button>{member.photo_url ? <Button disabled={busy} onClick={() => void remove()} variant="ghost">Remove photo</Button> : null}</div>{error ? <p className={styles.feedback} role="alert">{error}</p> : null}{message ? <p className={styles.feedback} role="status">{message}</p> : null}</div></section>;
}
