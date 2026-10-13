import Image from "next/image";
import { crmContent as content } from "./crm-revenue-ops-content";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import reasonStyles from "@/components/pages/service-reason-card.module.css";
import styles from "../cloud/cloud-why.module.css";

export function PageWhy() {
  return <section id="crm-why" className={styles.section} aria-labelledby="crm-why-title" data-cloud-section="Why Vyntics for crm">
    <Container className={styles.layout}>
        <div className={styles.image} data-reveal="crm-why-image">
          <Image src={content.whyImage.src} alt={content.whyImage.alt} fill sizes="(max-width: 900px) 100vw, 40vw" />
        </div>
        <div className={styles.content}>
          <header data-reveal="crm-why-heading" data-reveal-delay="90">
            <p className={styles.eyebrow}>{content.whyEyebrow}</p>
            <h2 id="crm-why-title">Why Vyntics for <span>{content.shortName}</span></h2>
            <p className={styles.introduction}>{content.whyIntroduction}</p>
          </header>
          <ul className={styles.reasons}>
            {content.reasons.map((reason, index) => <li className={reasonStyles.card} key={reason.title} data-reveal={`crm-why-reason-${index}`} data-reveal-delay={String(Math.min(180 + index * 90, 450))}>
              <svg viewBox="0 0 28 28" aria-hidden="true"><path d={reason.path} /></svg>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </li>)}
          </ul>
        </div>
    </Container>
    <ScrollReveals scope="#crm-why" />
  </section>;
}
