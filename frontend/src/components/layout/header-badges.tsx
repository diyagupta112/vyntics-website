import { Suspense } from "react";
import { getBadges, type Badge } from "@/lib/badges";
import { FooterBadgeImage } from "./footer-badge-image";
import styles from "./header-badges.module.css";

const MAX_HEADER_BADGES = 3;

function BadgeTile({ badge }: { badge: Badge }) {
  const tile = <FooterBadgeImage src={badge.logo_url} alt={badge.name} title={badge.name} className={styles.image} letterClassName={styles.letter} />;
  const size = /openai/i.test(badge.name) ? ` ${styles.large}` : "";
  return badge.website_url
    ? <a className={`${styles.tile} ${styles.link}${size}`} href={badge.website_url} target="_blank" rel="noopener noreferrer" title={badge.name}>{tile}</a>
    : <span className={`${styles.tile}${size}`} title={badge.name}>{tile}</span>;
}

async function BadgeRow({ variant }: { variant: "bar" | "drawer" }) {
  let badges: Badge[];
  try {
    // getBadges is request-cached, so the footer and every header slot share one API call.
    badges = (await getBadges()).slice().sort((a, b) => a.display_order - b.display_order).slice(0, MAX_HEADER_BADGES);
  } catch {
    return null;
  }
  if (badges.length === 0) return null;
  return (
    <div className={variant === "bar" ? styles.bar : styles.drawer}>
      {variant === "bar" ? <span className={styles.divider} aria-hidden="true" /> : null}
      <div className={styles.row}>{badges.map(badge => <BadgeTile key={badge.id} badge={badge} />)}</div>
    </div>
  );
}

function BadgeSkeleton({ variant }: { variant: "bar" | "drawer" }) {
  return (
    <div className={variant === "bar" ? styles.bar : styles.drawer} aria-hidden="true">
      {variant === "bar" ? <span className={styles.divider} /> : null}
      <div className={styles.row}><span className={`${styles.tile} ${styles.skeleton}`} /><span className={`${styles.tile} ${styles.skeleton}`} /></div>
    </div>
  );
}

/** Partner badges for the navbar (variant "bar") or the mobile menu drawer (variant "drawer"). */
export function HeaderBadges({ variant = "bar" }: { variant?: "bar" | "drawer" }) {
  return <Suspense fallback={<BadgeSkeleton variant={variant} />}><BadgeRow variant={variant} /></Suspense>;
}
