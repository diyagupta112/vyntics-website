import { Container } from "@/components/ui/container";
import styles from "./client-marquee.module.css";

const clients = [
  { name: "ProEd", logoClass: styles.proEd, effectClass: styles.proEdEffect },
  { name: "Iturbe Properties", logoClass: styles.iturbe, effectClass: styles.iturbeEffect },
  { name: "Rollout IT", logoClass: styles.rollout, effectClass: styles.rolloutEffect },
  { name: "SMGQ Law", logoClass: styles.smgq, effectClass: styles.smgqEffect },
] as const;

const marqueeClients = [...clients, ...clients];

function LogoGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={styles.group} aria-hidden={duplicate || undefined}>
      {marqueeClients.map((client, index) => (
        <div className={`${styles.card} ${client.effectClass}`} key={`${client.name}-${index}`}>
          <span className={styles.hoverPattern} aria-hidden="true" />
          <span
            className={`${styles.logo} ${client.logoClass}`}
            role={duplicate || index >= clients.length ? undefined : "img"}
            aria-label={duplicate || index >= clients.length ? undefined : `${client.name} logo`}
            aria-hidden={duplicate || index >= clients.length || undefined}
          />
        </div>
      ))}
    </div>
  );
}

export function ClientMarquee() {
  return (
    <section className={styles.section} aria-labelledby="client-marquee-title">
      <Container className={styles.headingContainer}>
        <p id="client-marquee-title" className={styles.heading}>
          Trusted by teams across law, real estate, IT &amp; EdTech
        </p>
      </Container>

      <div className={styles.marquee}>
        <div className={styles.track}>
          <LogoGroup />
          <LogoGroup duplicate />
        </div>
      </div>
    </section>
  );
}
