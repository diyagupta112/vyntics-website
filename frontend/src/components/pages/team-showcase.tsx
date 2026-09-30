import { Container } from "@/components/ui/container";
import styles from "./team-showcase.module.css";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  linkedin_url: string | null;
  display_order: number;
  member_type: "leadership" | "team";
};

type TeamResponse = { data: TeamMember[] };

const portraitTones = ["violet", "blue", "teal", "cyan", "indigo"] as const;

const fallbackTeamMembers: TeamMember[] = [
  {
    id: "fallback-leadership",
    name: "Arun",
    role: "Founder",
    bio: "Leads Vyntics with hands-on experience across data engineering, cloud platforms, and applied AI.",
    photo_url: null,
    linkedin_url: null,
    display_order: 1,
    member_type: "leadership",
  },
  {
    id: "fallback-vibhu",
    name: "Vibhu",
    role: "Software Engineer",
    bio: "",
    photo_url: null,
    linkedin_url: null,
    display_order: 2,
    member_type: "team",
  },
  {
    id: "fallback-ved",
    name: "Ved",
    role: "Software Engineer",
    bio: "",
    photo_url: null,
    linkedin_url: null,
    display_order: 3,
    member_type: "team",
  },
  {
    id: "fallback-akash",
    name: "Akash",
    role: "Data Engineer",
    bio: "",
    photo_url: null,
    linkedin_url: null,
    display_order: 4,
    member_type: "team",
  },
  {
    id: "fallback-diya",
    name: "Diya",
    role: "Trainee",
    bio: "",
    photo_url: null,
    linkedin_url: null,
    display_order: 5,
    member_type: "team",
  },
  {
    id: "fallback-vipul",
    name: "Vipul",
    role: "Trainee",
    bio: "",
    photo_url: null,
    linkedin_url: null,
    display_order: 6,
    member_type: "team",
  },
];

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isTeamMember(value: unknown): value is TeamMember {
  if (!value || typeof value !== "object") return false;
  const member = value as Record<string, unknown>;
  return (
    typeof member.id === "string" &&
    typeof member.name === "string" && member.name.trim().length > 0 &&
    typeof member.role === "string" && member.role.trim().length > 0 &&
    typeof member.bio === "string" &&
    (member.photo_url === null || isHttpUrl(member.photo_url)) &&
    (member.linkedin_url === null || isHttpUrl(member.linkedin_url)) &&
    typeof member.display_order === "number" &&
    (member.member_type === "leadership" || member.member_type === "team")
  );
}

async function getTeamMembers(): Promise<TeamMember[]> {
  const apiBaseUrl = (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(`${apiBaseUrl}/our-team`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return [];

    const payload = await response.json() as Partial<TeamResponse>;
    if (!Array.isArray(payload.data)) return [];
    return payload.data.filter(isTeamMember).sort((a, b) => a.display_order - b.display_order);
  } catch {
    return [];
  }
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function Portrait({ member, tone, featured = false }: { member: TeamMember; tone: string; featured?: boolean }) {
  const className = featured
    ? styles.founderPortrait
    : [styles.memberPortrait, styles[tone]].filter(Boolean).join(" ");

  return (
    <div
      className={className}
      style={member.photo_url ? { backgroundImage: `url(${JSON.stringify(member.photo_url)})` } : undefined}
      aria-hidden="true"
    >
      {!member.photo_url && <span>{getInitials(member.name)}</span>}
    </div>
  );
}

function LinkedInLink({ member }: { member: TeamMember }) {
  if (!member.linkedin_url) return null;
  return (
    <a className={styles.linkedinLink} href={member.linkedin_url} target="_blank" rel="noreferrer" aria-label={`View ${member.name} on LinkedIn`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5V18M6.5 5.5v.1M10.5 18v-5.2c0-2.1 1.2-3.5 3.2-3.5 2.1 0 3.3 1.4 3.3 3.5V18M10.5 9.6V18" /></svg>
    </a>
  );
}

function MemberCard({ member, index, compact = false }: { member: TeamMember; index: number; compact?: boolean }) {
  const tone = portraitTones[index % portraitTones.length];
  return (
    <article className={[styles.memberCard, compact ? styles.compactCard : ""].filter(Boolean).join(" ")}>
      <Portrait member={member} tone={tone} />
      <h3>{member.name}</h3>
      <p>{member.role}</p>
      <LinkedInLink member={member} />
    </article>
  );
}

function PlaceholderCard({ compact = false, tone = "blue" }: { compact?: boolean; tone?: string }) {
  return (
    <article className={[styles.memberCard, styles.placeholderCard, compact ? styles.compactCard : ""].filter(Boolean).join(" ")} aria-hidden="true">
      <div className={[styles.memberPortrait, styles[tone]].filter(Boolean).join(" ")} />
    </article>
  );
}

function PlaceholderTeamStage() {
  return (
    <div className={`${styles.teamStage} ${styles.placeholderStage}`} aria-hidden="true">
      <div className={styles.sideColumn}>
        <PlaceholderCard tone="violet" />
        <PlaceholderCard tone="blue" />
      </div>
      <div className={styles.centerColumn}>
        <article className={`${styles.founderCard} ${styles.placeholderCard}`}>
          <div className={styles.founderPortrait} />
        </article>
        <PlaceholderCard compact tone="indigo" />
      </div>
      <div className={styles.sideColumn}>
        <PlaceholderCard tone="teal" />
        <PlaceholderCard tone="cyan" />
      </div>
    </div>
  );
}

export async function TeamShowcase() {
  const apiMembers = await getTeamMembers();
  const members = apiMembers.length > 0 ? apiMembers : fallbackTeamMembers;
  const featuredIndex = members.findIndex((member) => member.member_type === "leadership");
  const featured = members[featuredIndex >= 0 ? featuredIndex : 0];
  const supporting = featured ? members.filter((member) => member.id !== featured.id) : [];
  const leftMembers = supporting.slice(0, 2);
  const rightMembers = supporting.slice(2, 4);
  const remainingMembers = supporting.slice(4);

  return (
    <section id="team" className={styles.page} aria-labelledby="team-title">
      <Container className={styles.teamContainer}>
        <header className={styles.heading}>
          <p>Meet Vyntics</p>
          <div className={styles.titleRow}>
            <h2 id="team-title">Our Team</h2>
          </div>
          <p className={styles.intro}>The people responsible for the systems we design, build, and deliver.</p>
        </header>

        {!featured ? (
          <PlaceholderTeamStage />
        ) : (
          <div className={styles.teamStage}>
            <div className={styles.sideColumn}>
              {leftMembers.map((member, index) => <MemberCard member={member} index={index} key={member.id} />)}
            </div>

            <div className={styles.centerColumn}>
              <article className={styles.founderCard}>
                <Portrait member={featured} tone="leadership" featured />
                <p className={styles.founderLabel}>{featured.role}</p>
                <h3>{featured.name}</h3>
                {featured.bio && <p className={styles.founderBio}>{featured.bio}</p>}
                <LinkedInLink member={featured} />
              </article>
              {remainingMembers.map((member, index) => (
                <MemberCard member={member} index={index + 4} compact key={member.id} />
              ))}
            </div>

            <div className={styles.sideColumn}>
              {rightMembers.map((member, index) => <MemberCard member={member} index={index + 2} key={member.id} />)}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
