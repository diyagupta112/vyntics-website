import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import styles from "./why-vyntics.module.css";

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
};

const features: Feature[] = [
  {
    title: "Direct access to the engineers",
    description: "The people you talk to on the first call are the people who build your system. There are no account managers and no passing the work to a different team.",
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="m16 3 2.2 7.8L26 13l-7.8 2.2L16 23l-2.2-7.8L6 13l7.8-2.2L16 3Z" />
        <path d="m25 21 .9 3.1L29 25l-3.1.9L25 29l-.9-3.1L21 25l3.1-.9L25 21Z" />
      </svg>
    ),
  },
  {
    title: "Built for Production",
    description: "We build for real workloads and real users. Every system is made to keep running after launch, not just to look good in a demo.",
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="8" cy="16" r="3" />
        <circle cx="24" cy="8" r="3" />
        <circle cx="24" cy="24" r="3" />
        <path d="m10.7 14.7 10.6-5.4M10.7 17.3l10.6 5.4" />
      </svg>
    ),
  },
  {
    title: "You own it",
    description: "Everything we build comes with documentation and a clean handoff. The code and systems are yours, and you can hire us again or not.",
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 25V13m0 12h22" />
        <path d="m8 20 6-6 4 3 8-9" />
        <path d="M20 8h6v6" />
      </svg>
    ),
  },
];

export function WhyVyntics() {
  return (
    <section id="why-vyntics" className={styles.section} aria-labelledby="why-vyntics-title">
      <Container>
        <div className={styles.headingBlock}>
          <p className={styles.badge}>Why Vyntics</p>
          <h2 id="why-vyntics-title">Built by experts. Owned by you.</h2>
          <p>No layers between you and the people doing the work. You deal with the same engineers from the first call through launch and after.</p>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <article className={styles.card} key={feature.title}>
              <div className={styles.orb}>
                <span className={styles.orbGlow} aria-hidden="true" />
                <span className={styles.icon}>{feature.icon}</span>
              </div>
              <div className={styles.copy}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
