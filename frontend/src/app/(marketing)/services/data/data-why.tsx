import Image from "next/image";
import dataImage from "../../../../../public/images/technology-data-team.png";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import reasonStyles from "@/components/pages/service-reason-card.module.css";
import styles from "../cloud/cloud-why.module.css";

const reasons = [
  { title: "Engineering before tooling", description: "We choose technology after the workload, constraints, ownership, and recovery requirements are understood.", path: "M4 9 12 4l8 5-8 5-8-5Zm0 6 8 5 8-5M4 20l8 5 8-5" },
  { title: "Built for failure", description: "Retries, backfills, reconciliation, observability, and runbooks are designed into the system before production.", path: "M20 8a8 8 0 1 0 1 8M20 3v5h-5M8 12l3 3 5-6" },
  { title: "Definitions with owners", description: "Important models and metrics have clear meaning, accountable owners, lineage, and a controlled change path.", path: "M4 6h6v6H4zM14 16h6v6h-6zM16 6h5v5M21 6l-9 9" },
  { title: "Direct technical delivery", description: "The engineers shaping the architecture stay involved through implementation, validation, and handover.", path: "M4 20h17M7 16v-4M12 16V8M17 16V4" },
] as const;

export function DataWhy() {
  return <section id="data-why" className={styles.section} aria-labelledby="data-why-title">
    <Container className={styles.layout}>
      <div className={styles.image} data-reveal="data-why-image">
        <Image src={dataImage} alt="Data specialists collaborating around analytical systems." fill sizes="(max-width: 900px) 100vw, 40vw" />
      </div>
      <div className={styles.content}>
        <header data-reveal="data-why-heading" data-reveal-delay="90">
          <p className={styles.eyebrow}>Why choose us</p>
          <h2 id="data-why-title">Why Vyntics for <span>Data Engineering</span></h2>
          <p className={styles.introduction}>We make the architecture, ownership, and operational tradeoffs clear before delivery.</p>
        </header>
        <ul className={styles.reasons}>
          {reasons.map((reason, index) => <li className={reasonStyles.card} key={reason.title} data-reveal={`data-why-reason-${index}`} data-reveal-delay={String(Math.min(180 + index * 90, 450))}>
            <svg viewBox="0 0 28 28" aria-hidden="true"><path d={reason.path} /></svg>
            <h3>{reason.title}</h3>
            <p>{reason.description}</p>
          </li>)}
        </ul>
      </div>
    </Container>
    <ScrollReveals scope="#data-why" />
  </section>;
}
