import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import styles from "./site-footer.module.css";

const solutionLinks = [
  { label: "Custom AI Solutions", href: "/#services-ai" },
  { label: "Data Engineering", href: "/#services-data" },
  { label: "Analytics & BI", href: "/#services-analytics" },
  { label: "Cloud Solutions", href: "/#services-cloud" },
  { label: "More Services", href: "/#services-others" },
];

const exploreLinks = [
  { label: "Featured Work", href: "/#work" },
  { label: "How We Work", href: "/#approach" },
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

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
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

          <nav className={styles.linkColumn} aria-label="Footer solutions">
            <h2>Solutions</h2>
            <ul>
              {solutionLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.linkColumn} aria-label="Explore Vyntics">
            <h2>Explore</h2>
            <ul>
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.linkColumn}>
            <h2>Get in touch</h2>
            <ul className={styles.contactList}>
              <li><a href="mailto:contact@vyntics.com">contact@vyntics.com</a></li>
              <li><a href="tel:+917062104893">+91 70621 04893</a></li>
              <li><span>Jaipur, Rajasthan, India</span></li>
            </ul>
            <Link className={styles.demoLink} href="/#contact">
              Book a strategy call <ArrowIcon />
            </Link>
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
