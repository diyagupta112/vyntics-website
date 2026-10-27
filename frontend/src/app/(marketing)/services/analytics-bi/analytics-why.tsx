import Image from "next/image";
import { analyticsContent } from "./analytics-bi-content";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import reasonStyles from "@/components/pages/service-reason-card.module.css";
import styles from "../cloud/cloud-why.module.css";

export function AnalyticsWhy() {
  return <section id="analytics-why" className={styles.section} aria-labelledby="analytics-why-title" data-cloud-section="Why Vyntics for analytics">
    <Container className={styles.layout}>
        <div className={styles.image} data-reveal="analytics-why-image">
          <Image src={analyticsContent.whyImage.src} alt={analyticsContent.whyImage.alt} fill sizes="(max-width: 900px) 100vw, 40vw" />
        </div>
        <div className={styles.content}>
          <header data-reveal="analytics-why-heading" data-reveal-delay="90">
            <p className={styles.eyebrow}>Why choose us</p>
            <h2 id="analytics-why-title">Why <span>Vyntics</span> for Analytics</h2>
            <p className={styles.introduction}>{analyticsContent.whyIntroduction}</p>
          </header>
          <ul className={styles.reasons}>
            {analyticsContent.reasons.map((reason, index) => <li className={reasonStyles.card} key={reason.title} data-reveal={`analytics-why-reason-${index}`} data-reveal-delay={String(Math.min(180 + index * 90, 450))}>
              <svg viewBox="0 0 28 28" aria-hidden="true"><path d={reason.path} /></svg>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </li>)}
          </ul>
        </div>
    </Container>
    <ScrollReveals scope="#analytics-why" />
  </section>;
}
