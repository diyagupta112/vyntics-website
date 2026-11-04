import Link from "next/link";
import { Container } from "@/components/ui/container";
import { serviceNavigation } from "@/content/service-navigation";
import { HeroSmoke } from "./hero-smoke";
import { HeroVideo } from "./hero-video";
import styles from "./hero.module.css";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";


export function Hero() {
  return (
    <section className={styles.hero} data-home-hero>
      <HeroSmoke />
      <Container className={styles.inner}>
        <h1>AI and data, built by the engineers you speak with.</h1>
        <p className={styles.intro}>
          No handoffs, no account managers. The people who scope your project build it.
        </p>
        <ArrowFillButton className={styles.cta} href="/contact-us">Book a strategy call</ArrowFillButton>
        <HeroVideo />
        <nav aria-label="Our services">
          <ul className={styles.proof}>
            {serviceNavigation.map((service) => (
              <li key={service.href}>
                <Link href={service.href}>{service.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
