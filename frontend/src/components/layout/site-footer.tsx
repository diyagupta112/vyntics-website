import { Suspense, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent/cookie-settings-button";
import { Container } from "@/components/ui/container";
import { serviceNavigation } from "@/content/service-navigation";
import { siteConfig } from "@/config/site";
import { getBadges, type Badge } from "@/lib/badges";
import { FooterBadgeImage } from "./footer-badge-image";
import styles from "./site-footer.module.css";
import { InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from "./social-icons";
import { FooterBackground } from "./footer-background";

type FooterItem = {
  label: string;
  href?: string;
};

type ServiceGroup = {
  label: string;
  href?: string;
  items: readonly FooterItem[];
};

// Share the header's service destinations and order.
const serviceGroups: readonly ServiceGroup[] = serviceNavigation.map(group => ({
  label: group.label,
  href: group.href,
  items: (group.children ?? []).map(item => ({ label: item.label, href: item.href })),
}));

// One heading track plus enough shared tracks for the longest service list.
const serviceGridStyle = {
  "--service-track-count": 1 + Math.max(0, ...serviceGroups.map((group) => group.items.length)),
} as CSSProperties;

const companyLinks: readonly FooterItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Technologies", href: "/technologies" },
  { label: "Recognitions", href: "/recognitions" },
  { label: "Contact Us", href: "/contact-us" },
];

const resourceLinks: readonly FooterItem[] = [
  { label: "Blogs", href: "/blog" },
  { label: "Case Studies", href: "/case-studies" },
];

const youtubeUrl = "youtube" in siteConfig.socialLinks && typeof siteConfig.socialLinks.youtube === "string"
  ? siteConfig.socialLinks.youtube
  : undefined;

function ItemList({ items, sharedRows = false, className = "" }: { items: readonly FooterItem[]; sharedRows?: boolean; className?: string }) {
  return (
    <ul className={`${styles.itemList} ${className}`.trim()}>
      {items.map((item, index) => (
        <li key={item.label} style={sharedRows ? { "--service-row": index + 2 } as CSSProperties : undefined}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
        </li>
      ))}
    </ul>
  );
}

function ServiceCluster({ group, column }: { group: ServiceGroup; column: number }) {
  return (
    <section className={styles.serviceCluster} aria-label={group.label} style={{ "--service-column": column } as CSSProperties}>
      <h3>{group.href ? <Link href={group.href}>{group.label}</Link> : group.label}</h3>
      <ItemList items={group.items} sharedRows />
    </section>
  );
}

function RecognitionsIntro() {
  return (
    <div className={styles.recognitionsIntro}>
      <h2 className={styles.navigationHeading} id="footer-recognitions-title">Partners &amp; Recognitions</h2>
      <p>Trusted by the platforms we build on</p>
    </div>
  );
}

function RecognitionsSkeleton() {
  return (
    <section className={styles.recognitions} aria-labelledby="footer-recognitions-title" aria-busy="true" style={{ "--badge-count": 2 } as CSSProperties}>
      <div className={styles.recognitionsGroup}>
      <RecognitionsIntro />
      <span className={styles.recognitionsDivider} aria-hidden="true" />
      <ul className={styles.recognitionsList}>
        {[0, 1].map(index => (
          <li key={index}>
            <div className={styles.badgeItem}>
              <span className={`${styles.badgeTile} ${styles.skeleton}`} />
              <span className={`${styles.skeletonBar} ${styles.skeleton}`} />
            </div>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}

function BadgeItem({ badge }: { badge: Badge }) {
  const content = (
    <>
      <span className={styles.badgeTile}>
        <FooterBadgeImage src={badge.logo_url} alt={badge.name} title={badge.name} className={styles.badgeImage} letterClassName={styles.badgeLetter} />
      </span>
      <span className={styles.badgeText}>
        <span className={styles.badgeName}>{badge.name}</span>
      </span>
    </>
  );
  return badge.website_url
    ? <a className={styles.badgeItem} href={badge.website_url} target="_blank" rel="noopener noreferrer">{content}</a>
    : <div className={styles.badgeItem}>{content}</div>;
}

async function Recognitions() {
  let badges: Badge[];
  try {
    badges = (await getBadges()).slice().sort((a, b) => a.display_order - b.display_order);
  } catch (error) {
    console.error("Footer recognitions unavailable", error);
    return null;
  }
  // Nothing to show: hide the whole strip, including its divider.
  if (badges.length === 0) return null;
  return (
    <section className={styles.recognitions} aria-labelledby="footer-recognitions-title" style={{ "--badge-count": badges.length } as CSSProperties}>
      <div className={styles.recognitionsGroup}>
      <RecognitionsIntro />
      <span className={styles.recognitionsDivider} aria-hidden="true" />
      <ul className={styles.recognitionsList}>
        {badges.map(badge => <li key={badge.id}><BadgeItem badge={badge} /></li>)}
      </ul>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer id="footer" className={styles.footer}>
      <FooterBackground />
      <span className={styles.decorativeWordmark} aria-hidden="true">VYNTICS</span>
      <Container className={styles.closingContainer}>
        <div className={styles.footerMain}>
          <div className={styles.brandBlock}>
            <div className={styles.brandIdentity}>
              <Link className={styles.brand} href="/" aria-label={`${siteConfig.name} home`}>
                <span className={styles.logoBox}>
                  <Image src="/images/vyntics-mark.png" alt="Vyntics logo" width={107} height={81} />
                </span>
                <span>VYNTICS</span>
              </Link>
            </div>
            <section className={styles.contact} aria-label="Get in touch">
              <a className={styles.email} href="mailto:contact@vyntics.com">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg>
                <span>contact@vyntics.com</span>
              </a>
              <address className={styles.address}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>
                <a href={siteConfig.mapHref} target="_blank" rel="noreferrer">{siteConfig.address}</a>
              </address>
              <div className={styles.socialBlock}>
                <p className={styles.navigationHeading}>Socials</p>
                <div className={styles.socialLinks} role="group" aria-label="Vyntics social media">
                  <a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="Vyntics on LinkedIn"><LinkedInIcon /></a>
                  <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Vyntics on Instagram"><InstagramIcon /></a>
                  <a href={siteConfig.socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Vyntics on X, formerly Twitter"><TwitterIcon /></a>
                  {youtubeUrl ? <a href={youtubeUrl} target="_blank" rel="noreferrer" aria-label="Vyntics on YouTube"><YouTubeIcon /></a> : <span className={styles.socialPlaceholder} role="img" aria-label="Vyntics on YouTube - link coming soon" title="YouTube link coming soon"><YouTubeIcon /></span>}
                </div>
              </div>
            </section>
          </div>

          <div className={styles.navigationZone}>
            <nav className={styles.services} aria-labelledby="footer-services-title">
              <h2 className={styles.navigationHeading} id="footer-services-title">Services</h2>
              <div className={styles.serviceList} style={serviceGridStyle}>
                {serviceGroups.map((group, index) => <ServiceCluster group={group} column={index + 1} key={group.label} />)}
              </div>
            </nav>
          </div>
          <div className={styles.supportingNavigation}>
            <nav className={styles.companyNav} aria-labelledby="footer-company-title">
              <h2 className={styles.navigationHeading} id="footer-company-title">Company</h2>
              <ItemList items={companyLinks} className={styles.companyLinks} />
            </nav>
            <nav className={styles.resourcesNav} aria-labelledby="footer-resources-title">
              <h2 className={styles.navigationHeading} id="footer-resources-title">Resources</h2>
              <ItemList items={resourceLinks} />
            </nav>
          </div>
        </div>

        <Suspense fallback={<RecognitionsSkeleton />}><Recognitions /></Suspense>

        <div className={styles.utilityBar}>
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
          <div className={styles.legalLinks}>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
            <CookieSettingsButton className={styles.cookieSettings} />
          </div>
        </div>

      </Container>
    </footer>
  );
}
