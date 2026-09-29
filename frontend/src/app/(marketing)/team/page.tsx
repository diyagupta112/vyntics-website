import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the engineers and trainees behind Vyntics.",
};

const leftMembers = [
  { name: "Vibhu", role: "Software Engineer", initials: "V", tone: "violet" },
  { name: "Ved", role: "Software Engineer", initials: "V", tone: "blue" },
] as const;

const rightMembers = [
  { name: "Akash", role: "Data Engineer", initials: "A", tone: "teal" },
  { name: "Diya", role: "Trainee", initials: "D", tone: "cyan" },
] as const;

const vipul = { name: "Vipul", role: "Trainee", initials: "V", tone: "indigo" } as const;

type Member = (typeof leftMembers)[number] | (typeof rightMembers)[number] | typeof vipul;

function MemberCard({ member, compact = false }: { member: Member; compact?: boolean }) {
  return (
    <article className={[styles.memberCard, compact ? styles.compactCard : ""].filter(Boolean).join(" ")}>
      <div className={[styles.memberPortrait, styles[member.tone]].join(" ")} aria-hidden="true">
        <span>{member.initials}</span>
      </div>
      <h3>{member.name}</h3>
      <p>{member.role}</p>
    </article>
  );
}

function Ornament() {
  return (
    <svg viewBox="0 0 110 28" aria-hidden="true">
      <path d="M2 14h31c9 0 13-12 13-12s4 12 13 12h49M46 2c0 8-12 12-12 12s12 4 12 12M59 14c-4 0-6-5-6-5s-2 5-6 5c4 0 6 5 6 5s2-5 6-5Z" />
    </svg>
  );
}

export default function TeamPage() {
  return (
    <section className={styles.page} aria-labelledby="team-title">
      <Container>
        <header className={styles.heading}>
          <p>Meet Vyntics</p>
          <div className={styles.titleRow}>
            <Ornament />
            <h1 id="team-title">Our Team</h1>
            <Ornament />
          </div>
          <p className={styles.intro}>The people responsible for the systems we design, build, and deliver.</p>
        </header>

        <div className={styles.teamStage}>
          <div className={styles.sideColumn}>
            {leftMembers.map((member) => <MemberCard member={member} key={member.name} />)}
          </div>

          <div className={styles.centerColumn}>
            <article className={styles.founderCard}>
              <div className={styles.founderPortrait} aria-hidden="true"><span>A</span></div>
              <p className={styles.founderLabel}>Founder</p>
              <h2>Arun</h2>
              <p className={styles.founderBio}>
                Leads Vyntics with hands-on experience across data engineering, cloud platforms, and applied AI.
              </p>
            </article>
            <MemberCard member={vipul} compact />
          </div>

          <div className={styles.sideColumn}>
            {rightMembers.map((member) => <MemberCard member={member} key={member.name} />)}
          </div>
        </div>
      </Container>
    </section>
  );
}

