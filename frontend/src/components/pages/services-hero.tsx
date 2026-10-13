import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { servicesHeroVisuals } from "@/content/services-hero-visuals";
import type { ServicePillar } from "@/content/service-exploration";
import buttons from "@/app/(marketing)/services/cloud/page.module.css";
import styles from "./services-hero.module.css";

type Action = { href: string; label: string };
type HeroProps = {
  service: ServicePillar; headingId: string; eyebrow: string; title: string; description: string;
  primaryAction: Action; secondaryAction?: Action;
  capabilities: readonly (Action & { points?: readonly string[] })[];
  titleLines?: readonly string[];
  badge?: { label: string; title: string };
  visual?: ReactNode;
};
function Arrow() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>;
}
export function ServicesHero({ service, headingId, eyebrow, title, description, primaryAction, secondaryAction, capabilities, titleLines, badge, visual }: HeroProps) {
  const image = servicesHeroVisuals[service];
  const id = `${headingId}-hero`;
  const mask = `${headingId}-sweep`;
  return <section id={id} className={styles.hero} aria-labelledby={headingId} data-cloud-section="Hero" data-service-hero={service}>
    <Container className={styles.layout}>
      <div className={styles.copy}>
        <p className={styles.eyebrow} data-reveal={`${id}-eyebrow`}>{eyebrow}</p>
        <h1 id={headingId} data-reveal={`${id}-title`} data-reveal-delay="90">{titleLines ? titleLines.map((line, index) => <span key={line}>{index > 0 && " "}{line}</span>) : title}</h1>
        <p className={styles.description} data-reveal={`${id}-description`} data-reveal-delay="180">{description}</p>
        <div className={buttons.heroActions} data-reveal={`${id}-actions`} data-reveal-delay="270">
          <Link className={buttons.primaryAction} href={primaryAction.href}>{primaryAction.label} <Arrow /></Link>
          {secondaryAction && <Link className={buttons.secondaryAction} href={secondaryAction.href}>{secondaryAction.label}</Link>}
        </div>
      </div>
      <div className={styles.visual}>
        <svg className={styles.maskDefinitions} width="0" height="0" aria-hidden="true"><defs>
          <clipPath id={mask} clipPathUnits="objectBoundingBox">
            <path d="M.20,0 H.42 C.40,.17 .35,.28 .25,.43 C.12,.62 .12,.75 .23,.85 C.33,.95 .49,.94 .57,.84 C.51,.67 .31,.63 .30,.48 C.29,.32 .15,.20 .20,0 Z" />
            <path d="M.70,.07 C.86,-.01 1,.02 1,.15 V.88 C.91,.97 .78,1 .66,1 C.65,.82 .47,.68 .36,.57 C.25,.46 .36,.21 .70,.07 Z" />
          </clipPath>
        </defs></svg>
        <div className={styles.imageArea} style={{ clipPath: `url(#${mask})` }}>
          <Image src={image.image} alt={image.alt} fill preload={!visual} quality={service === "analytics-bi" ? 90 : 75} sizes={service === "analytics-bi" ? "(max-width: 560px) 180vw, (max-width: 900px) 120vw, 90vw" : "(max-width: 900px) 100vw, 60vw"} className={styles.image} style={{ objectPosition: image.position }} />
        </div>
        {visual && <div className={styles.media} style={{ "--hero-mask": `url(#${mask})` } as CSSProperties}>{visual}</div>}
        {badge && <div className={styles.badge} data-reveal={`${id}-category`} data-reveal-delay="90"><span>{badge.label}</span><strong>{badge.title}</strong></div>}
        <nav className={styles.panels} data-count={capabilities.length} data-has-media={!!visual} aria-label={`${eyebrow} capabilities`} data-hero-services>
          {capabilities.map((capability, index) => <Link className={styles.panel} href={capability.href} key={capability.href} data-reveal={`${id}-panel-${index}`} data-reveal-delay={String(index * 90)}>
            <span className={styles.panelNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.panelTitle}>{capability.label}</span>
            {!!capability.points?.length && <ul>{capability.points.map(point => <li key={point}><span aria-hidden="true">✓</span>{point}</li>)}</ul>}
            <span className={styles.panelArrow} aria-hidden="true">↗</span>
          </Link>)}
        </nav>
      </div>
    </Container>
    <ScrollReveals scope={`#${id}`} />
  </section>;
}
