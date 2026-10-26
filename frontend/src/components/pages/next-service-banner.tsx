import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import { explorationServices, serviceExplorationOrder, type ServicePillar } from "@/content/service-exploration";
import styles from "./next-service-banner.module.css";

const panelGradients = [
  "/images/top-right-gradient.webp",
  "/images/diagonal-sweep-gradient.webp",
  "/images/bottom-left-gradient.webp",
];

export function NextServiceBanner({ currentService, id, sectionClassName, introduction = "Explore the other ways we can help you build, connect and grow your technology." }: {
  currentService?: ServicePillar;
  id: string;
  sectionClassName?: string;
  introduction?: string;
}) {
  if (!currentService) return null;
  return <section id={id} className={`${sectionClassName ?? styles.section} ${styles.noTopRule}`} aria-labelledby={`${id}-title`} data-cloud-section="What comes next">
    <Container>
      <header className={styles.heading} data-reveal={`${id}-heading`}>
        <p className={styles.eyebrow}>Our services</p>
        <h2 id={`${id}-title`}>What Comes Next</h2>
        <p className={styles.intro}>{introduction}</p>
      </header>
      <div className={styles.grid}>
        {serviceExplorationOrder[currentService].map((slug, index) => {
          const service = explorationServices[slug];
          return <Link href={`/services/${slug}`} key={slug} className={`${styles.card} ${styles[slug]}`} aria-label={`Explore ${service.name}`} data-reveal={`${id}-${slug}`} data-reveal-delay={String((index + 1) * 90)}>
            <div className={styles.photoBackdrop} aria-hidden="true">
              <Image src={service.image} alt={`Background image for Vyntics ${service.name} services`} aria-hidden="true" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 25vw" quality={75} className={styles.backdropImage} />
            </div>
            <div className={styles.imageArea}>
              <Image src={service.image} alt={`Illustration for Vyntics ${service.name} services`} aria-hidden="true" fill sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1000px) 50vw, 25vw" quality={75} className={styles.image} />
            </div>
            <div className={styles.panel}>
              <div className={styles.background} aria-hidden="true">
                <div className={`${styles.gradient} ${index === 3 ? styles.mirrored : ""}`}>
                  <Image src={panelGradients[index % panelGradients.length]} alt={`Soft gradient behind the ${service.name} service panel`} aria-hidden="true" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 25vw" className={styles.gradientImage} />
                </div>
              </div>
              <div className={styles.content}>
                <div className={styles.titleRow}>
                  <svg className={styles.icon} viewBox="0 0 28 28" aria-hidden="true"><path d={service.iconPath} /></svg>
                  <h3>{service.name}</h3>
                  <span className={styles.arrow} aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4 10h11m-4-4 4 4-4 4" /></svg></span>
                </div>
                <div className={styles.details}>
                  <p>{service.description}</p>
                </div>
              </div>
              <span className={styles.explore}>Explore {service.name}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg></span>
            </div>
          </Link>;
        })}
      </div>
    </Container>
    <ScrollReveals scope={`#${id}`} />
  </section>;
}
