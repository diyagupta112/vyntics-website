import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import styles from "./site-footer.module.css";
import { serviceNavigation } from "@/content/service-navigation";


const exploreLinks = [
  { label: "About us", href: "/about" },
  { label: "Career", href: "/careers" },
  { label: "Rewards", href: "/rewards" },
  { label: "Case studies", href: "/case-studies" },
  { label: "How We Work", href: "/#approach" },
  { label: "Latest Insights", href: "/blog" },
  { label: "Technologies", href: "/technologies" },
  { label: "Why Vyntics", href: "/#why-vyntics" },
  { label: "Client Stories", href: "/#testimonials" },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 9.5V18M6.5 6.5v.01M10.5 18v-4.8c0-2.1 1.2-3.7 3.4-3.7 2.3 0 3.6 1.5 3.6 4.2V18M10.5 9.5V18" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.3" cy="6.8" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 4 14 16M19 4 5 20" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer id="footer" className={styles.footer}>
      <Container>
        <div className={styles.mainGrid}>
          <div className={styles.brandColumn}>
            <Link className={styles.brand} href="/" aria-label={`${siteConfig.name} home`}>
              <span className={styles.logoBox}>
                <Image src="/images/vyntics-mark.png" alt="" width={64} height={48} />
              </span>
              <span>VYNTICS</span>
            </Link>
            <p>
              Production-ready AI, data, and cloud systems built by the engineers
              you work with directly.
            </p>
            <a className={styles.primaryLink} href="mailto:contact@vyntics.com">
              Start a conversation <ArrowIcon />
            </a>
          </div>

          {serviceNavigation.map((group) => (
            <nav className={styles.linkColumn} aria-label={group.label} key={group.label}>
              <h2><Link href={group.href}>{group.label}</Link></h2>
              <ul>
                {group.children?.map((item) => (
                  <li key={item.label}><Link href={item.href}>{item.label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}

          <nav className={styles.linkColumn} aria-label="Explore Vyntics">
            <h2>Explore</h2>
            <ul>
              {exploreLinks.map((link) => (
                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div className={`${styles.linkColumn} ${styles.contactColumn}`}>
            <h2>Get in touch</h2>
            <ul className={styles.contactList}>
              <li><a href="mailto:contact@vyntics.com">contact@vyntics.com</a></li>
              <li>
                <a
                  className={styles.mapLink}
                  href={siteConfig.mapHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${siteConfig.address} in Google Maps`}
                >
                  <MapPinIcon />
                  <span>{siteConfig.address}</span>
                </a>
              </li>
            </ul>
            <div className={styles.socialLinks} aria-label="Vyntics social media">
              <a data-platform="linkedin" href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="Vyntics on LinkedIn"><LinkedInIcon /></a>
              <a data-platform="instagram" href={siteConfig.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Vyntics on Instagram"><InstagramIcon /></a>
              <a data-platform="twitter" href={siteConfig.socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Vyntics on X, formerly Twitter"><TwitterIcon /></a>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Built for production. Owned by you.</p>
        </div>
      </Container>
    </footer>
  );
}
