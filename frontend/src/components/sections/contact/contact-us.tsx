import { InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from "@/components/layout/social-icons";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { ContactUsForm } from "./contact-us-form";
import styles from "./contact-us.module.css";

const email = "contact@vyntics.com";
const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(siteConfig.address)}&output=embed`;

export function ContactUs() {
  return <>
    <section className={styles.hero} aria-labelledby="contact-us-title">
      <Container>
        <p className={styles.eyebrow}>Contact us</p>
        <h1 id="contact-us-title">Let&apos;s start a conversation.</h1>
        <p className={styles.lead}>Tell us about your project or question. We will get back to you shortly.</p>
      </Container>
    </section>

    <section className={styles.cardSection} aria-label="Contact Vyntics">
      <Container>
        <div className={styles.card}>
          <div className={styles.info}>
            <h2>Get in touch</h2>
            <p className={styles.infoLead}>Have a project in mind or a question about working with Vyntics? We would love to hear from you.</p>
            <address className={styles.details}>
              <a href={siteConfig.mapHref} target="_blank" rel="noreferrer" aria-label={`Open ${siteConfig.address} in Google Maps`}>
                <span className={styles.detailIcon}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg></span>
                <span><small>Address</small>{siteConfig.address}</span>
              </a>
              <a href={`mailto:${email}`}>
                <span className={styles.detailIcon}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg></span>
                <span><small>Email</small>{email}</span>
              </a>
            </address>
            <div className={styles.social}>
              <p>Follow us</p>
              <div className={styles.socialLinks} role="group" aria-label="Vyntics social media">
                <a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="Vyntics on LinkedIn"><LinkedInIcon /></a>
                <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Vyntics on Instagram"><InstagramIcon /></a>
                <a href={siteConfig.socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Vyntics on X, formerly Twitter"><TwitterIcon /></a>
                <a href={siteConfig.socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="Vyntics on YouTube"><YouTubeIcon /></a>
              </div>
            </div>
          </div>
          <ContactUsForm />
        </div>
      </Container>
    </section>

    <section className={styles.mapSection} aria-labelledby="contact-map-title">
      <Container>
        <p className={styles.mapLabel} id="contact-map-title">Visit us</p>
        <div className={styles.map}>
          <iframe title={`Map showing ${siteConfig.address}`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </Container>
    </section>
  </>;
}
