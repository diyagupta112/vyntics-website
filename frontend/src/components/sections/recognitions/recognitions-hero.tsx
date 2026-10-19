import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { getBadges } from "@/lib/badges";
import page from "@/app/(marketing)/recognitions/page.module.css";
import styles from "./recognitions-hero.module.css";
import { recognitionUpdates } from "@/content/recognitions-updates";
import { StackingFeed } from "./stacking-feed";

export async function RecognitionsHero() {
  // Share the existing public data source and request cache with recognition cards.
  const badges = await getBadges().catch(() => []);
  const updates = recognitionUpdates(badges);

  return <RecognitionsHeroShell><StackingFeed items={updates} /></RecognitionsHeroShell>;
}

export function RecognitionsHeroShell({ children, loading = false }: { children: ReactNode; loading?: boolean }) {
  return <section style={loading ? { minHeight: "calc(100svh - 5rem)" } : undefined} className={styles.hero} aria-label="Recognitions and certifications">
    <Container className={styles.layout}>
      <div className={styles.content}>
        <p className={page.eyebrow}>RECOGNITIONS &amp; CERTIFICATIONS</p>
        <h1><span>Recognized for</span>{" "}<span>the quality</span>{" "}<span>of our work</span></h1>
        <p className={styles.intro}>Vyntics is an OpenAI Select Partner and a Databricks Brickbuilder Partner, with a team delivering data, AI, cloud, CRM, analytics and BI solutions.</p>
        <div className={styles.actions}>
          <a className={`${page.button} siteCta`} href="#strategy-call">Book a strategy call</a>
        </div>
      </div>
      <div className={styles.visual}>{children}</div>
    </Container>
  </section>;
}
