import { Container } from "@/components/ui/container";
import { getTeamMembers, type TeamMemberSummary } from "@/lib/team";
import { TeamStage } from "./team-stage";
import styles from "./team-showcase.module.css";

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
  const members = await getTeamMembers();
  const featured = members.find((member) => member.member_type === "leadership") ?? members[0];
  const supporting: TeamMemberSummary[] = featured
    ? members
        .filter((member) => member.id !== featured.id)
        .map(({ id, name, role, photo_url, display_order, member_type }) => ({
          id,
          name,
          role,
          photo_url,
          display_order,
          member_type,
        }))
    : [];

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

        {featured ? <TeamStage featured={featured} supporting={supporting} /> : <PlaceholderTeamStage />}
      </Container>
    </section>
  );
}
