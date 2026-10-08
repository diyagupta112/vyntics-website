import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { serviceNavigation } from "@/content/service-navigation";
import { siteConfig } from "@/config/site";
import styles from "./site-footer.module.css";
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

// Share the header's real service destinations while keeping the footer order.
const serviceGroups: readonly ServiceGroup[] = [
  "Cloud Foundations", "Data Engineering", "Analytics & BI", "AI Solutions", "CRM & Revenue Ops",
].map(label => {
  const group = serviceNavigation.find(item => item.label === label);
  if (!group) throw new Error(`Missing service navigation group: ${label}`);
  return { label: group.label, href: group.href, items: (group.children ?? []).map(item => ({ label: item.label, href: item.href })) };
});

const companyLinks: readonly FooterItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Technologies", href: "/technologies" },
  { label: "Rewards", href: "/rewards" },
];

const resourceLinks: readonly FooterItem[] = [
  { label: "Blog", href: "/blog" },
  { label: "Case Studies", href: "/case-studies" },
];

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 9.5V18M6.5 6.5v.01M10.5 18v-4.8c0-2.1 1.2-3.7 3.4-3.7 2.3 0 3.6 1.5 3.6 4.2V18M10.5 9.5V18" /></svg>;
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
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 4 14 16M19 4 5 20" /></svg>;
}

function ItemList({ items }: { items: readonly FooterItem[] }) {
  return (
    <ul className={styles.itemList}>
      {items.map((item) => (
        <li key={item.label}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
        </li>
      ))}
    </ul>
  );
}

function ServiceCluster({ group }: { group: ServiceGroup }) {
  return (
    <section className={styles.serviceCluster} aria-label={group.label}>
      <h3>{group.href ? <Link href={group.href}>{group.label}</Link> : group.label}</h3>
      <ItemList items={group.items} />
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer id="footer" className={styles.footer}>
      <FooterBackground />
      <Container className={styles.closingContainer}>
        <div className={styles.footerMain}>
          <div className={styles.brandBlock}>
            <Link className={styles.brand} href="/" aria-label={`${siteConfig.name} home`}>
              <span className={styles.logoBox}>
                <Image src="/images/vyntics-mark.png" alt="" width={107} height={81} />
              </span>
              <span>VYNTICS</span>
            </Link>
            <section className={styles.contact} aria-label="Get in touch">
              {/* Use native fragment navigation so repeated clicks always reach the contact form. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className={styles.conversationLink} href="/#contact">
                <span>Start a Conversation</span>
                <svg className={styles.conversationArrow} viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" /></svg>
              </a>
              <span className={styles.email}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg>
                <span>contact@vyntics.com</span>
              </span>
              <address className={styles.address}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>
                <span>{siteConfig.address}</span>
              </address>
              <div className={styles.socialLinks} role="group" aria-label="Vyntics social media">
                <a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="Vyntics on LinkedIn"><LinkedInIcon /></a>
                <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Vyntics on Instagram"><InstagramIcon /></a>
                <a href={siteConfig.socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Vyntics on X, formerly Twitter"><TwitterIcon /></a>
              </div>
              <p className={styles.brandStatement}>Turning complex problems into impactful solutions.</p>
            </section>
          </div>

          <div className={styles.navigationZone}>
            <nav className={styles.services} aria-labelledby="footer-services-title">
              <h2 className={styles.navigationHeading} id="footer-services-title">Services</h2>
              <div className={styles.serviceList}>
                {serviceGroups.map((group) => <ServiceCluster group={group} key={group.label} />)}
              </div>
            </nav>
            <div className={styles.supportingNavigation}>
              <nav aria-labelledby="footer-company-title">
                <h2 className={styles.navigationHeading} id="footer-company-title">Company</h2>
                <ItemList items={companyLinks} />
              </nav>
              <nav aria-labelledby="footer-resources-title">
                <h2 className={styles.navigationHeading} id="footer-resources-title">Resources</h2>
                <ItemList items={resourceLinks} />
              </nav>
            </div>
          </div>
          <span className={styles.decorativeWordmark} aria-hidden="true">VYNTICS</span>
        </div>

        <div className={styles.utilityBar}>
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
        </div>

      </Container>
    </footer>
  );
}
