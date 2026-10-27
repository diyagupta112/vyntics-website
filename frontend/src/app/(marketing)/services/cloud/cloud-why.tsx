import Image from "next/image";
import cloudImage from "../../../../../public/images/services/why-choose-cloud.jpg";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import reasonStyles from "@/components/pages/service-reason-card.module.css";
import styles from "./cloud-why.module.css";

const reasons = [
  { title: "Practical Architecture", description: "Secure, scalable infrastructure shaped around your workloads and recovery needs.", path: "M4 9 12 4l8 5-8 5-8-5Zm0 6 8 5 8-5M4 20l8 5 8-5" },
  { title: "Migration With A Plan", description: "Move applications and databases in controlled stages, checking dependencies, access, and reliability before handing over.", path: "M4 6h6v6H4zM14 16h6v6h-6zM16 6h5v5M21 6l-9 9" },
  { title: "Cost Awareness", description: "Architecture shaped around your budget, with monitoring and cost awareness connected to delivery.", path: "M4 20h17M7 16v-4M12 16V8M17 16V4" },
  { title: "Build, Optimize, Support", description: "Connect delivery with documentation and ongoing support so the environment remains useful as your business changes.", path: "M20 8a8 8 0 1 0 1 8M20 3v5h-5M8 12l3 3 5-6" },
] as const;

export function CloudWhy() {
  return <section id="cloud-why" className={styles.section} aria-labelledby="cloud-why-title" data-cloud-section="Why Vyntics for Cloud">
    <Container className={styles.layout}>
        <div className={styles.image} data-reveal="cloud-why-image">
          <Image src={cloudImage} alt="Vyntics team collaborating around a laptop on a cloud project." fill sizes="(max-width: 900px) 100vw, 40vw" />
        </div>
        <div className={styles.content}>
          <header data-reveal="cloud-why-heading" data-reveal-delay="90">
            <p className={styles.eyebrow}>Why choose us</p>
            <h2 id="cloud-why-title">Why <span>Vyntics</span> for Cloud</h2>
            <p className={styles.introduction}>As a cloud solutions company, we make the tradeoffs clear before delivery.</p>
          </header>
          <ul className={styles.reasons}>
            {reasons.map((reason, index) => <li className={reasonStyles.card} key={reason.title} data-reveal={`cloud-why-reason-${index}`} data-reveal-delay={String(Math.min(180 + index * 90, 450))}>
              <svg viewBox="0 0 28 28" aria-hidden="true"><path d={reason.path} /></svg>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </li>)}
          </ul>
        </div>
    </Container>
    <ScrollReveals scope="#cloud-why" />
  </section>;
}
