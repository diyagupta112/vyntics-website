"use client";

/* Team photos come from API-managed remote hosts, so a native image keeps those URLs portable. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { TeamMember, TeamMemberSummary } from "@/lib/team";
import { isTeamMember } from "@/lib/team";
import styles from "./team-showcase.module.css";

const portraitTones = ["violet", "blue", "teal", "cyan", "indigo"] as const;

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function Portrait({ member, tone, featured = false, modal = false }: {
  member: Pick<TeamMember, "name" | "photo_url">;
  tone: string;
  featured?: boolean;
  modal?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const className = modal
    ? styles.modalPortrait
    : featured
      ? styles.founderPortrait
      : [styles.memberPortrait, styles[tone]].filter(Boolean).join(" ");

  return (
    <div className={className}>
      {member.photo_url && !imageFailed ? (
        <img className={styles.portraitImage} src={member.photo_url} alt={`${member.name}, Vyntics team member`} onError={() => setImageFailed(true)} />
      ) : (
        <span aria-label={member.name}>{getInitials(member.name)}</span>
      )}
    </div>
  );
}

function LinkedInLink({ member }: { member: Pick<TeamMember, "name" | "linkedin_url"> }) {
  if (!member.linkedin_url) return null;
  return (
    <a className={styles.linkedinLink} href={member.linkedin_url} target="_blank" rel="noreferrer" aria-label={`View ${member.name} on LinkedIn`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5V18M6.5 5.5v.1M10.5 18v-5.2c0-2.1 1.2-3.5 3.2-3.5 2.1 0 3.3 1.4 3.3 3.5V18M10.5 9.6V18" /></svg>
    </a>
  );
}

function MemberCard({ member, index, compact = false, onOpen }: {
  member: TeamMemberSummary;
  index: number;
  compact?: boolean;
  onOpen: (member: TeamMemberSummary) => void;
}) {
  const tone = portraitTones[index % portraitTones.length];
  return (
    <button
      className={[styles.memberCard, compact ? styles.compactCard : ""].filter(Boolean).join(" ")}
      type="button"
      onClick={() => onOpen(member)}
      aria-label={`View ${member.name}'s profile`}
    >
      <Portrait member={member} tone={tone} />
      <span className={styles.memberName}>{member.name}</span>
      <span className={styles.memberRole}>{member.role}</span>
      <span className={styles.profilePrompt} aria-hidden="true">View profile <b>↗</b></span>
    </button>
  );
}

type DetailState = { status: "loading" } | { status: "success"; member: TeamMember } | { status: "error" };

function TeamMemberDialog({ summary, onDismiss }: { summary: TeamMemberSummary; onDismiss: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [requestKey, setRequestKey] = useState(0);
  const [detail, setDetail] = useState<DetailState>({ status: "loading" });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
    void fetch(`${baseUrl}/our-team/${encodeURIComponent(summary.id)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Team member request failed");
        const payload: unknown = await response.json();
        if (!isTeamMember(payload) || payload.id !== summary.id) throw new Error("Invalid team member response");
        setDetail({ status: "success", member: payload });
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setDetail({ status: "error" });
      });

    return () => controller.abort();
  }, [requestKey, summary.id]);

  function close() { dialogRef.current?.close(); }
  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  const displayedMember = detail.status === "success" ? detail.member : summary;

  return (
    <dialog
      className={styles.profileDialog}
      aria-labelledby="team-profile-title"
      aria-describedby={detail.status === "success" ? "team-profile-bio" : undefined}
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onDismiss}
    >
      <div className={styles.dialogCard}>
        <button className={styles.closeButton} type="button" onClick={close} aria-label="Close team profile"><span aria-hidden="true">×</span></button>
        <div className={styles.dialogPortraitColumn}><Portrait member={displayedMember} tone="blue" modal /></div>
        <div className={styles.dialogContent}>
          <p className={styles.dialogEyebrow}>Meet the team</p>
          <h3 id="team-profile-title">{displayedMember.name}</h3>
          <p className={styles.dialogRole}>{displayedMember.role}</p>

          {detail.status === "loading" ? (
            <div className={styles.loadingBlock} role="status" aria-live="polite"><span /><span /><span /><p>Loading profile…</p></div>
          ) : detail.status === "error" ? (
            <div className={styles.dialogError} role="alert">
              <p>We could not load this profile. Please try again.</p>
              <button type="button" onClick={() => { setDetail({ status: "loading" }); setRequestKey((key) => key + 1); }}>Try again</button>
            </div>
          ) : (
            <>
              <p className={styles.dialogBio} id="team-profile-bio">{detail.member.bio}</p>
              <LinkedInLink member={detail.member} />
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}

export function TeamStage({ featured, supporting }: { featured: TeamMember; supporting: TeamMemberSummary[] }) {
  const [selected, setSelected] = useState<TeamMemberSummary | null>(null);
  const leftMembers = supporting.slice(0, 2);
  const rightMembers = supporting.slice(2, 4);
  const remainingMembers = supporting.slice(4);

  return (
    <>
      <div className={styles.teamStage}>
        <div className={styles.sideColumn}>
          {leftMembers.map((member, index) => <MemberCard member={member} index={index} key={member.id} onOpen={setSelected} />)}
        </div>
        <div className={styles.centerColumn}>
          <article className={styles.founderCard}>
            <Portrait member={featured} tone="leadership" featured />
            <p className={styles.founderLabel}>{featured.role}</p>
            <h3>{featured.name}</h3>
            {featured.bio && <p className={styles.founderBio}>{featured.bio}</p>}
            <LinkedInLink member={featured} />
          </article>
          {remainingMembers.map((member, index) => <MemberCard member={member} index={index + 4} compact key={member.id} onOpen={setSelected} />)}
        </div>
        <div className={styles.sideColumn}>
          {rightMembers.map((member, index) => <MemberCard member={member} index={index + 2} key={member.id} onOpen={setSelected} />)}
        </div>
      </div>
      {selected ? <TeamMemberDialog summary={selected} onDismiss={() => setSelected(null)} /> : null}
    </>
  );
}
