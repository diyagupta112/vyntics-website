import type { CSSProperties } from "react";
import Image from "next/image";
import { InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from "@/components/layout/social-icons";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { ContactForm } from "../home/contact-form";
import styles from "./contact-us.module.css";

const email = "contact@vyntics.com";
const { location } = siteConfig;
const socials = [
  { name: "LinkedIn", href: siteConfig.socialLinks.linkedin, color: "#0a66c2", Icon: LinkedInIcon },
  { name: "Instagram", href: siteConfig.socialLinks.instagram, color: "#c13584", Icon: InstagramIcon },
  { name: "X", href: siteConfig.socialLinks.twitter, color: "#0b0b0f", Icon: TwitterIcon },
  { name: "YouTube", href: siteConfig.socialLinks.youtube, color: "#e0352b", Icon: YouTubeIcon },
];
const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(location.name)}&ll=${location.latitude},${location.longitude}&z=18&output=embed`;

export function ContactUs() {
  return <>
    <section className={styles.hero} aria-labelledby="contact-us-title">
      <Image className={styles.heroImage} src="/images/contact-us.jpg" alt="Colleagues talking around a meeting table in a bright office" fill priority sizes="100vw" />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.heroCopy}>
        <h1 id="contact-us-title">Contact us</h1>
        <p className={styles.lead}>Tell us about your project or question, We&apos;ll get back to you shortly</p>
      </div>
    </section>

    <section className={styles.panelSection} aria-label="Contact Vyntics">
      <Container>
        <div className={styles.panel}>
          <div className={styles.top}>
            <div className={styles.map}>
              <iframe title={`Map showing ${location.name}, ${siteConfig.address}`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
            <div className={styles.formColumn}>
              <h2 className={styles.formTitle}>Send us a message</h2>
              <ContactForm submitLabel="Send Message" />
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.infoColumn}>
              <p className={styles.infoHeading}>Contact details</p>
              <address className={styles.details}>
                <a href={`mailto:${email}`}>
                  <span className={styles.icon}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg></span>
                  <span className={styles.detailText}><small>Email</small>{email}</span>
                </a>
                <a href={siteConfig.mapHref} target="_blank" rel="noreferrer" aria-label={`Open ${siteConfig.address} in Google Maps`}>
                  <span className={styles.icon}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg></span>
                  <span className={styles.detailText}><small>Location</small>{siteConfig.address}</span>
                </a>
              </address>
            </div>
            <div className={`${styles.infoColumn} ${styles.socialColumn}`}>
              <p className={styles.infoHeading}>Follow us</p>
              <p className={styles.socialLead}>Connect with Vyntics and stay in touch with what we&apos;re building.</p>
              <svg className={styles.gradientDefs} width="0" height="0" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="instagram-gradient" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#f5a623" /><stop offset="0.45" stopColor="#d62976" /><stop offset="1" stopColor="#7b3fc4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className={styles.socialGrid} role="group" aria-label="Vyntics social media">
                {socials.map(({ name, href, color, Icon }) => <a key={name} className={styles.socialCard} href={href} target="_blank" rel="noreferrer"
                  data-platform={name.toLowerCase()} aria-label={`Vyntics on ${name} (opens in a new tab)`} style={{ "--brand": color } as CSSProperties}>
                  <span className={styles.socialIcon}><Icon /></span>
                  <span className={styles.socialName} aria-hidden="true">{name}</span>
                </a>)}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  </>;
}
