import { Suspense } from "react";
import { BadgeLogo } from "@/components/sections/recognitions/badge-logo";
import { Container } from "@/components/ui/container";
import { getBadges } from "@/lib/badges";
import styles from "./data-engineering-databricks-credential.module.css";

export type PartnerCredentialContent = { badgeName: string; sectionTitle: string; eyebrow: string; heading: string; body: string; titleId: string };

const DATABRICKS: PartnerCredentialContent = {
  badgeName: "Databricks Brickbuilder Partner",
  sectionTitle: "Recognized for Data Excellence",
  eyebrow: "Databricks Partnership",
  heading: "Recognized as a Databricks Brickbuilder Partner",
  body: "Vyntics brings modern data engineering expertise and Databricks capabilities together to help organizations build scalable data platforms, streamline data pipelines, and turn complex data into a foundation for better analytics and decision-making.",
  titleId: "databricks-credential-title",
};

async function Credential({ content }: { content: PartnerCredentialContent }) {
  const badge = (await getBadges().catch(() => [])).find(item => item.name === content.badgeName);
  const logo = badge?.logo_url ?? null;
  return (
    <div className={styles.layout} data-has-badge={logo ? "true" : "false"}>
      {logo ? <div className={styles.badge}><BadgeLogo src={logo} name={content.badgeName} className={styles.image} /></div> : null}
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h3>{content.heading}</h3>
        <p>{content.body}</p>
      </div>
    </div>
  );
}

export function DataEngineeringDatabricksCredential({ content = DATABRICKS }: { content?: PartnerCredentialContent }) {
  return (
    <section className={styles.section} aria-labelledby={content.titleId}>
      <Container>
        <header className={styles.intro}><h2 id={content.titleId}>{content.sectionTitle}</h2></header>
        <Suspense fallback={<div className={styles.loading} role="status" aria-label="Loading Databricks partnership" />}>
          <Credential content={content} />
        </Suspense>
      </Container>
    </section>
  );
}
