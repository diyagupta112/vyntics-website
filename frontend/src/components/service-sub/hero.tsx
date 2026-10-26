import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import type { CloudSubPage } from "@/content/cloud-sub-services/pages";
import { subServiceHeroImages } from "@/content/sub-service-hero-images";
import { HeroOpticalAlign } from "./hero-optical-align";
import imageStyles from "./hero-image.module.css";
import heroStyles from "@/components/pages/services-hero.module.css";
import buttons from "@/app/(marketing)/services/cloud/page.module.css";
import styles from "./service-sub.module.css";

type SubServiceHeroPage = Pick<CloudSubPage, "slug" | "name" | "hero"> & { key: string };

/** Page-local adaptation of the site's hero styling, with a separate outcome and image slot. */
export function CloudSubHero({ page, opticalAlign = false, showOutcome = true, processId }: { page: SubServiceHeroPage; opticalAlign?: boolean; showOutcome?: boolean; processId?: string }) {
  const id = `${page.key}-hero`;
  const image = subServiceHeroImages[page.slug] ?? { src: page.hero.expectedImage, alt: page.hero.imageAlt };
  return <section id={id} className={`${heroStyles.hero} ${heroStyles.flexible}`} aria-labelledby={`${page.key}-title`}>
    <Container className={`${heroStyles.layout} ${heroStyles.flexible}`}>
      <div className={`${heroStyles.copy} ${styles.heroCopy}`} data-title-fit={page.hero.title.length > 44 ? "long" : "standard"}>
        <p className={heroStyles.eyebrow} data-reveal={`${id}-eyebrow`}>{page.name}</p>
        <h1 id={`${page.key}-title`} data-reveal={`${id}-title`} data-reveal-delay="90">{page.hero.title}</h1>
        {opticalAlign && <HeroOpticalAlign titleId={`${page.key}-title`} />}
        <p className={heroStyles.description} data-reveal={`${id}-introduction`} data-reveal-delay="180">{page.hero.introduction}</p>
        {showOutcome && <p className={styles.outcome} data-reveal={`${id}-outcome`} data-reveal-delay="180">{page.hero.outcome}</p>}
        <div className={buttons.heroActions} style={showOutcome ? undefined : { marginTop: "var(--hero-actions-gap)" }} data-reveal={`${id}-actions`} data-reveal-delay="270">
          <Link className={buttons.primaryAction} href="/#contact">{page.hero.cta} <span aria-hidden="true">→</span></Link>
          <Link className={buttons.secondaryAction} href={`#${processId ?? `${page.key}-process`}`}>See our process</Link>
        </div>
      </div>
      <div className={`${heroStyles.visual} ${styles.heroVisual}`}>
        <div className={styles.heroFrame}><Image className={imageStyles.image} src={image.src} alt={image.alt} fill preload sizes="(max-width:900px) 100vw, 60vw" /></div>
      </div>
    </Container>
    <ScrollReveals scope={`#${id}`} />
  </section>;
}
