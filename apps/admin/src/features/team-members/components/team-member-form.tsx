"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { CreateFlowActions } from "@/components/create-flow/two-step-create-flow";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import { teamMembersApi } from "../api/team-members";
import { backendFieldErrors, emptyTeamMemberForm, teamMemberToForm, toCreateRequest, toUpdateRequest, validateTeamMemberForm, type TeamMemberFormErrors, type TeamMemberFormValues } from "../lib/team-member-form";
import { teamMemberErrorMessage } from "../lib/errors";
import type { TeamMember, TeamMemberType } from "../types";
import styles from "./team-members.module.css";

export function TeamMemberForm({ member, createFlow = false, onCreated, onSaved }: { member?: TeamMember; createFlow?: boolean; onCreated?: (member: TeamMember) => void; onSaved?: (member: TeamMember) => void }) {
  const router = useRouter(); const isCreate = !member; const [values, setValues] = useState<TeamMemberFormValues>(() => member ? teamMemberToForm(member) : emptyTeamMemberForm); const [errors, setErrors] = useState<TeamMemberFormErrors>({}); const [busy, setBusy] = useState(false); const [failure, setFailure] = useState<string>(); const [message, setMessage] = useState<string>();
  function update(field: keyof TeamMemberFormValues, value: string) { setValues((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); setFailure(undefined); setMessage(undefined); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (busy) return; const next = validateTeamMemberForm(values); setErrors(next); if (Object.keys(next).length) return; setBusy(true); setFailure(undefined); setMessage(undefined); try { const saved = member ? await teamMembersApi.update(member.id, toUpdateRequest(values)) : await teamMembersApi.create(toCreateRequest(values)); if (isCreate) { if (onCreated) onCreated(saved); else router.push(`/team/${saved.id}/edit?created=1`); } else { setValues(teamMemberToForm(saved)); setMessage("Team Member changes saved."); onSaved?.(saved); } } catch (caught) { if (isApiError(caught) && caught.kind === "validation") setErrors(backendFieldErrors(caught)); setFailure(teamMemberErrorMessage(caught, isCreate ? "create this Team Member" : "save this Team Member")); } finally { setBusy(false); } }
  return <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}><section className={styles.section} aria-labelledby="member-information-heading"><div className={styles.sectionHeading}><h2 id="member-information-heading">Member information</h2><p>Manage the profile information displayed by the Team API.</p></div><div className={styles.fields}>
    <FormField error={errors.name} htmlFor="memberName" label="Name" required><Input aria-invalid={Boolean(errors.name)} id="memberName" onChange={(e) => update("name", e.target.value)} value={values.name}/></FormField>
    <FormField error={errors.role} htmlFor="memberRole" label="Role" required><Input aria-invalid={Boolean(errors.role)} id="memberRole" onChange={(e) => update("role", e.target.value)} value={values.role}/></FormField>
    <FormField error={errors.memberType} htmlFor="memberType" label="Member type" required><Select id="memberType" onChange={(e) => update("memberType", e.target.value as TeamMemberType)} value={values.memberType}><option value="leadership">Leadership</option><option value="team">Team</option></Select></FormField>
    <FormField error={errors.displayOrder} hint="Lower numbers appear first." htmlFor="displayOrder" label="Display order" required><Input aria-invalid={Boolean(errors.displayOrder)} id="displayOrder" onChange={(e) => update("displayOrder", e.target.value)} type="number" value={values.displayOrder}/></FormField>
    <div className={styles.full}><FormField error={errors.linkedinUrl} htmlFor="linkedinUrl" label="LinkedIn URL"><Input aria-invalid={Boolean(errors.linkedinUrl)} id="linkedinUrl" onChange={(e) => update("linkedinUrl", e.target.value)} type="url" value={values.linkedinUrl}/></FormField></div>
    <div className={styles.full}><FormField error={errors.bio} htmlFor="memberBio" label="Biography" required><Textarea aria-invalid={Boolean(errors.bio)} className={styles.bioArea} id="memberBio" onChange={(e) => update("bio", e.target.value)} value={values.bio}/></FormField></div>
  </div></section>{failure ? <div className={styles.feedback} role="alert"><strong>Changes were not saved</strong><p>{failure}</p></div> : null}{message ? <div className={styles.feedback} role="status"><strong>Saved</strong><p>{message}</p></div> : null}{createFlow ? <CreateFlowActions backHref="/team" backLabel="Cancel" busy={busy} busyLabel={isCreate ? "Creating…" : "Saving…"} primaryLabel="Next →" primaryType="submit" /> : <div className={styles.formActions}><Button disabled={busy} type="submit">{busy ? "Saving…" : isCreate ? "Create Team Member" : "Save Changes"}</Button><Link className={styles.secondaryLink} href="/team">Cancel</Link></div>}</form>;
}
