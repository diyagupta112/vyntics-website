import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import type { SubSection, CloudSubPage } from "@/content/cloud-sub-services/pages";
import sectionStyles from "@/app/(marketing)/services/data/page.module.css";
import styles from "./service-sub.module.css";
import improvements from "./migration-improvements.module.css";
import signs from "./signs-grid.module.css";
import architectureServices from "./architecture-services.module.css";
import diagnostic from "./diagnostic-signals.module.css";
import { ServiceTools } from "@/components/pages/service-tools";

function ArchitectureServiceIcon({ index }: { index: number }) {
  const paths = [
    "M4 4h16v5H4zM4 13h6v7H4zM14 13h6v7h-6zM7 9v4m10-4v4",
    "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
    "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6",
    "M4 4h16v6H4zM4 14h8v6H4zM7 7h.01M7 17h.01M15 17a4 4 0 0 1 6-3m0-3v3h-3m3 3a4 4 0 0 1-6 3",
    "M12 3a7 7 0 1 0 7 7M12 7v5l3 2m2-9 2-2m-2 2h3v3",
    "M4 4h16v12H4zM8 20h8m-4-4v4m-5-7 3-3 2 2 4-4",
  ];
  return <svg className={architectureServices.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={paths[index]} /></svg>;
}

export function DraftCardSection({ section, variant = "cards", signalEyebrow = "Cloud signals", displayTitle, visual }: {
  section: SubSection;
  variant?: "cards" | "connected" | "signs" | "services" | "diagnostic";
  signalEyebrow?: string;
  displayTitle?: string;
  visual?: { src: string; alt: string };
}) {
  const connected = variant === "connected";
  const numbered = variant === "signs";
  const serviceCards = variant === "services";
  const fiveServiceCards = serviceCards && section.items.length === 5;
  const sixServiceCards = serviceCards && section.items.length === 6;
  const threeServiceCards = serviceCards && section.items.length === 3;
  if (connected) return <MigrationBenefits section={section} visual={visual} />;
  if (variant === "diagnostic") return <DiagnosticSignals section={section} eyebrow={signalEyebrow} />;
  return <section id={section.id} className={`${sectionStyles.section} ${styles.section}${numbered ? ` ${signs.section}` : ""}${serviceCards ? ` ${architectureServices.section}` : ""}`} aria-labelledby={`${section.id}-title`}>
    <Container className={serviceCards ? architectureServices.inner : undefined}>
      <header className={styles.heading} data-reveal={`${section.id}-heading`}>
        <h2 id={`${section.id}-title`}>{displayTitle ?? (numbered ? "Signs you need to change" : section.title)}</h2>
        <p>{section.introduction}</p>
      </header>
      <div className={numbered ? signs.grid : serviceCards ? `${architectureServices.grid}${fiveServiceCards ? ` ${architectureServices.fiveItems}` : ""}${sixServiceCards ? ` ${architectureServices.sixItems}` : ""}${threeServiceCards ? ` ${architectureServices.threeItems}` : ""}` : styles.cards}>
        {section.items.map((item, index) => <article className={numbered ? `${signs.card}${index === 0 ? ` ${signs.highlighted}` : ""}` : serviceCards ? architectureServices.card : item.href ? `${styles.card} ${styles.linkCard}` : styles.card} key={item.title} data-reveal={`${section.id}-item-${index}`} data-reveal-delay={Math.min(index * 90, 450)}>
          {numbered && <span className={signs.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}
          {serviceCards && <ArchitectureServiceIcon index={index} />}
          <h3>{item.title}</h3><p>{item.description}</p>
          {serviceCards && <Link className={architectureServices.cta} href="/#contact">Talk to our experts <span aria-hidden="true">→</span></Link>}
          {!serviceCards && item.href && <Link href={item.href}>{item.linkLabel ?? item.title} <span aria-hidden="true">→</span></Link>}
        </article>)}
      </div>
    </Container>
  </section>;
}

function DiagnosticSignals({ section, eyebrow }: { section: SubSection; eyebrow: string }) {
  return <section id={section.id} className={`${sectionStyles.section} ${styles.section} ${signs.section}`} aria-labelledby={`${section.id}-title`}>
    <Container>
      <header className={`${styles.heading} ${diagnostic.heading}`} data-reveal={`${section.id}-heading`}>
        {eyebrow && <p className={diagnostic.eyebrow}>{eyebrow}</p>}
        <h2 id={`${section.id}-title`}>{section.title}</h2>
        <p>{section.introduction}</p>
      </header>
      <div className={diagnostic.list}>
        <div className={diagnostic.columnHeaders}>
          <span />
          <span className={diagnostic.symptomHeader}>What you might be experiencing</span>
          <span className={diagnostic.causeHeader}>What it usually means</span>
        </div>
        <ul>
          {section.items.map((item, index) => <li className={diagnostic.row} key={item.title} data-reveal={`${section.id}-item-${index}`} data-reveal-delay={Math.min(index * 90, 450)}>
            <span className={diagnostic.index} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div className={diagnostic.symptom}><span className={diagnostic.mobileLabel}>What you might be experiencing</span><h3>{item.title}</h3></div>
            <div className={diagnostic.cause}><span className={diagnostic.mobileLabel}>What it usually means</span><p>{item.description}</p></div>
          </li>)}
        </ul>
      </div>
    </Container>
  </section>;
}

function MigrationBenefits({ section, visual }: { section: SubSection; visual?: { src: string; alt: string } }) {
  const image = visual ?? {
    src: "/images/services/sub-services/benefits/cloud-architecture-and-migration.jpg",
    alt: "Three colleagues collaborating around a laptop, with one holding a tablet",
  };
  return <section id={section.id} className={`${sectionStyles.section} ${styles.section}`} aria-labelledby={`${section.id}-title`}>
    <Container>
      <div className={improvements.layout}>
        <div className={improvements.content}>
          <header className={`${styles.heading} ${improvements.heading}`} data-reveal={`${section.id}-heading`}>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            <p>{section.introduction}</p>
          </header>
          <ol className={improvements.list}>
            {section.items.map((item, index) => <li className={improvements.item} key={item.title} data-reveal={`${section.id}-item-${index}`} data-reveal-delay={Math.min(index * 90, 450)}>
              <span className={improvements.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{item.title}</h3><p>{item.description}</p></div>
            </li>)}
          </ol>
        </div>
        <div className={improvements.visual} data-reveal={`${section.id}-image`} data-reveal-delay="90">
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 960px) 100vw, (max-width: 1440px) 43vw, 500px" />
        </div>
      </div>
    </Container>
  </section>;
}

export function DraftArchitectureDiagram({ diagram, pageKey }: { diagram: NonNullable<CloudSubPage["diagram"]>; pageKey: string }) {
  const id = `${pageKey}-architecture`;
  return <section id={id} className={`${sectionStyles.section} ${styles.section}`} aria-labelledby={`${id}-title`}>
    <Container>
      <header className={styles.heading} data-reveal={`${id}-heading`}><h2 id={`${id}-title`}>{diagram.title}</h2></header>
      <figure className={styles.diagram} data-reveal={`${id}-diagram`}>
        {diagram.type === "migration" ? <div className={styles.migrationDiagram}>
          <div><h3>Before: on premises</h3><ul>{["Servers", "Database", "File storage"].map(node => <li key={node}>{node}</li>)}</ul></div>
          <p className={styles.connector}>Planned migration <span aria-hidden="true">→</span></p>
          <div><h3>After: in the cloud</h3><ul>{["Load balancer", "Application services", "Managed database", "Cloud storage"].map(node => <li key={node}>{node}</li>)}</ul></div>
        </div> : <ol className={styles.pipeline} aria-label="Example deployment sequence">
          {["Code commit", "Build", "Test", "Security scan", "Deploy to production", "Monitor"].map((stage, index) => <li key={stage}><span>{stage}</span>{index < 5 && <span aria-hidden="true">→</span>}</li>)}
        </ol>}
        <figcaption>{diagram.caption}</figcaption>
      </figure>
    </Container>
  </section>;
}

export function DraftToolLinks({ tools, pageKey, title = "Tools we use", introduction = "We select tools around your delivery process, application requirements, and the systems your team can maintain." }: { tools: readonly string[]; pageKey: string; presentation?: "chips" | "editorial"; title?: string; introduction?: string }) {
  return <ServiceTools id={`${pageKey}-tools`} name={pageKey} eyebrow="" title={title} introduction={introduction} technologies={tools}
    presentation="platforms" balancedPlatforms showTechnologyLinks note={null} revealPrefix={`${pageKey}-tools`} />;
}
