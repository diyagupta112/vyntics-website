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
    title: "Access to the engineers directly",
    description: "The folks that create your system are the ones you speak with on the initial call. Account managers and transferring the work to another team are absent.",
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="m16 3 2.2 7.8L26 13l-7.8 2.2L16 23l-2.2-7.8L6 13l7.8-2.2L16 3Z" />
        <path d="m25 21 .9 3.1L29 25l-3.1.9L25 29l-.9-3.1L21 25l3.1-.9L25 21Z" />
      </svg>
    ),
  },
  {
    title: "Constructed for Production",
    description: "We design with actual workloads and users in mind. Every system is designed not only to look beautiful in a demo but also to continue operating after launch.",
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
    title: "You have it.",
    description: "Documentation and a seamless handoff accompany every project we create. You are free to hire us again or not, and the systems and code are yours.",
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
          <p className={styles.badge}>Reasons for Vyntics</p>
          <h2 id="why-vyntics-title">created by professionals. You are the owner.</h2>
          <p>There should be no barriers between you and the workers. From the initial call to launch and beyond, you work with the same engineers.</p>
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
