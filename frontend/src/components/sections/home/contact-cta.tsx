import Link from "next/link";
import { ContactForm } from "./contact-form";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import styles from "./contact-cta.module.css";

type ContactCtaProps = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  sectionId?: string;
  submitLabel?: string;
  showEyebrowAccent?: boolean;
  primaryAction?: { href: string; label: string };
};

export function ContactCta({
  eyebrow,
  title = "Together, let's review your statistics.",
  intro = "Set up a complimentary 30-minute strategy session. Just have a straight discussion with our specialists about your data and AI concerns without the need for sales teams or presentation decks.",
  sectionId = "contact",
  submitLabel = "Send message",
  showEyebrowAccent = true,
  primaryAction,
}: ContactCtaProps = {}) {
  return (
    <section id={sectionId} className={styles.section} aria-labelledby={`${sectionId}-title`}>
      <Container className={styles.layout}>
        <div className={styles.content}>
          {eyebrow && <p className={`${styles.eyebrow} ${showEyebrowAccent ? "" : styles.withoutEyebrowAccent}`}>{eyebrow}</p>}
          <h2 id={`${sectionId}-title`}>{title}</h2>
          <p className={styles.intro}>{intro}</p>
          {primaryAction && (
            <Link className={`${styles.emailLink} siteCta`} href={primaryAction.href}>
              {primaryAction.label}
            </Link>
          )}

          <a className={styles.emailLink} href="mailto:contact@vyntics.com">
            <span aria-hidden="true">→</span> contact@vyntics.com
          </a>

          <address className={styles.contactDetails}>
            <a href={siteConfig.mapHref} target="_blank" rel="noreferrer" aria-label={`Open ${siteConfig.address} in Google Maps`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>
              {siteConfig.address}
            </a>
          </address>
        </div>

        <ContactForm submitLabel={submitLabel} />
      </Container>
    </section>
  );
}
