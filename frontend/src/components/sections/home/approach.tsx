import { Container } from "@/components/ui/container";
import styles from "./approach.module.css";

const steps = [
  {
    number: "01",
    label: "Discover",
    title: "Deep Discovery",
    description: "We understand your data landscape, business goals, and pain points before writing a single line of code.",
  },
  {
    number: "02",
    label: "Architect",
    title: "System Design",
    description: "We design the right architecture for your scale-not over-engineered, not under-built. Always documented.",
  },
  {
    number: "03",
    label: "Build",
    title: "Focused Execution",
    description: "Our experts work on every task hands-on. Production quality from sprint one.",
  },
  {
    number: "04",
    label: "Scale",
    title: "Grow With You",
    description: "We hand off cleanly, document everything, and stay available as your data ambitions grow.",
  },
] as const;

export function Approach() {
  return (
    <section id="approach" className={styles.section} aria-labelledby="approach-title">
      <Container>
        <div className={styles.headingBlock}>
          <p className={styles.eyebrow}>How we work</p>
          <h2 id="approach-title">A Proven Delivery Process</h2>
          <p>From the first conversation to a production system that keeps delivering.</p>
        </div>

        <div className={styles.process}>
          <svg className={styles.route} viewBox="0 0 1000 320" preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.routeBase} d="M125 50 C245 50 245 270 375 270 C505 270 505 50 625 50 C745 50 745 270 875 270" />
            <path className={styles.routeActive} pathLength="1" d="M125 50 C245 50 245 270 375 270 C505 270 505 50 625 50 C745 50 745 270 875 270" />
            <path className={styles.arrowHead} d="m354 260 21 10-21 10" />
            <path className={styles.arrowHead} d="m604 40 21 10-21 10" />
            <path className={styles.arrowHead} d="m854 260 21 10-21 10" />
          </svg>

          <ol className={styles.steps}>
            {steps.map((step) => (
              <li className={styles.step} key={step.number}>
                <div className={styles.stepInner}>
                  <p className={styles.stepLabel}>{step.number} · {step.label}</p>
                  <h3>{step.title}</h3>
                  <p className={styles.description}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
