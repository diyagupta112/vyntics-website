import { Container } from "@/components/ui/container";
import styles from "./client-marquee.module.css";

const clients = [
  { name: "ProEd", logoClass: styles.proEd },
  { name: "Iturbe Properties", logoClass: styles.iturbe },
  { name: "Rollout IT", logoClass: styles.rollout },
  { name: "SMGQ Law", logoClass: styles.smgq },
] as const;

export function ClientMarquee() {
  return (
    <section className={styles.section} aria-labelledby="client-marquee-title">
      <Container className={styles.headingContainer}>
        <p id="client-marquee-title" className={styles.heading}>
          We have access to data from law companies, real estate, IT, and EdTech teams.
        </p>
      </Container>

      <div className={styles.logos} aria-label="Companies that work with Vyntics">
        {clients.map((client) => (
          <div className={styles.logoItem} key={client.name}>
            <span
              className={`${styles.logo} ${client.logoClass}`}
              role="img"
              aria-label={`${client.name} logo`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
