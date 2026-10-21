import Image from "next/image";
import aiImage from "../../../../../public/images/services/why-choose-ai.jpg";
import { Container } from "@/components/ui/container";
import { ScrollReveals } from "@/components/ui/scroll-reveals";
import reasonStyles from "@/components/pages/service-reason-card.module.css";
import styles from "../cloud/cloud-why.module.css";

const reasons = [
  { title: "Use case before model", description: "We define the user, decision, evidence, workflow, risk, and measurable outcome before choosing a model or framework.", path: "M4 9 12 4l8 5-8 5-8-5Zm0 6 8 5 8-5M4 20l8 5 8-5" },
  { title: "Evaluation from the start", description: "Retrieval, answer quality, structured outputs, tool use, safety, latency, and cost are tested against representative cases.", path: "M4 20h17M7 16v-4M12 16V8M17 16V4" },
  { title: "Control is part of the design", description: "Permissions, human approval, audit trails, uncertainty, refusals, and recovery paths are built into the operating workflow.", path: "M20 8a8 8 0 1 0 1 8M20 3v5h-5M8 12l3 3 5-6" },
  { title: "Direct technical delivery", description: "The engineers shaping the architecture stay involved through integration, production release, monitoring, and handover.", path: "M4 6h6v6H4zM14 16h6v6h-6zM16 6h5v5M21 6l-9 9" },
] as const;

export function AiWhy() {
  return <section id="ai-why" className={styles.section} aria-labelledby="ai-why-title">
    <Container className={styles.layout}>
      <div className={styles.image} data-reveal="ai-why-image">
        <Image src={aiImage} alt="Vyntics team discussing an AI project around a meeting table with laptops and printed charts" fill quality={90} sizes="(max-width: 900px) 100vw, 1000px" />
      </div>
      <div className={styles.content}>
        <header data-reveal="ai-why-heading" data-reveal-delay="90">
          <p className={styles.eyebrow}>Why choose us</p>
          <h2 id="ai-why-title">Why Vyntics for <span>AI Solutions</span></h2>
          <p className={styles.introduction}>We make the use case, evidence, controls, and operating tradeoffs clear before delivery.</p>
        </header>
        <ul className={styles.reasons}>
          {reasons.map((reason, index) => <li className={reasonStyles.card} key={reason.title} data-reveal={`ai-why-reason-${index}`} data-reveal-delay={String(Math.min(180 + index * 90, 450))}>
            <svg viewBox="0 0 28 28" aria-hidden="true"><path d={reason.path} /></svg>
            <h3>{reason.title}</h3>
            <p>{reason.description}</p>
          </li>)}
        </ul>
      </div>
    </Container>
    <ScrollReveals scope="#ai-why" />
  </section>;
}
