import { ContactForm } from "./contact-form";
import { Container } from "@/components/ui/container";
import styles from "./contact-cta.module.css";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";

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
  title = "Together, let's review your statistics",
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
            <ArrowFillButton className={styles.emailLink} href={primaryAction.href}>{primaryAction.label}</ArrowFillButton>
          )}

          <ArrowFillButton className={styles.emailLink} href="mailto:contact@vyntics.com" native>contact@vyntics.com</ArrowFillButton>
        </div>

        <ContactForm submitLabel={submitLabel} />
      </Container>
    </section>
  );
}
