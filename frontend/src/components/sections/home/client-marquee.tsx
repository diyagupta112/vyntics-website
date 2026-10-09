import Image from "next/image";
import { Container } from "@/components/ui/container";
import styles from "./client-marquee.module.css";

const clients = [
  { name: "ProEd", src: "/images/clients/proedlogo-transparent.png", width: 1598, height: 984, logoClass: styles.proEd },
  { name: "Iturbe Properties", src: "/images/clients/iturbelogo-transparent.png", width: 1774, height: 887, logoClass: styles.iturbe },
  { name: "Rollout IT", src: "/images/clients/rolloutitlogo-transparent.png", width: 2035, height: 773, logoClass: styles.rollout },
  { name: "SMGQ Law", src: "/images/clients/smgqlogo-transparent.png", width: 1549, height: 1015, logoClass: styles.smgq },
] as const;

export function ClientMarquee() {
  return (
    <section className={styles.section} aria-labelledby="client-marquee-title">
      <Container className={styles.headingContainer}>
        <p id="client-marquee-title" className={styles.heading}>
          We have access to data from Law companies, Real Estate, IT, and EdTech teams.
        </p>
      </Container>

      <div className={styles.logos} aria-label="Companies that work with Vyntics">
        {clients.map((client) => (
          <div className={styles.logoItem} key={client.name}>
            <Image
              alt={`${client.name} logo`}
              className={`${styles.logo} ${client.logoClass}`}
              height={client.height}
              sizes="(max-width: 480px) 70vw, (max-width: 800px) 36vw, 18vw"
              src={client.src}
              width={client.width}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
