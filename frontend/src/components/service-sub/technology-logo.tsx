import Image from "next/image";
import { getTechnologyLogoFiles } from "@/content/technology-logos";
import styles from "./editorial-tool-grid.module.css";
export { hasTechnologyLogo, parentBrandLogoOwners } from "@/content/technology-logos";
/** Adjacent HTML names provide the accessible label; vendor artwork stays decorative. */
export function TechnologyLogo({ name, compact = false, hideFallback = false, allowParentBrandLogo = true }: { name: string; compact?: boolean; hideFallback?: boolean; allowParentBrandLogo?: boolean }) {
  const files = getTechnologyLogoFiles(name, allowParentBrandLogo);
  if (!files.length && hideFallback) return null;
  const brand = name === "Salesforce" ? "salesforce" : files[0] === "aws.svg" ? "aws" : name === "Google Cloud" || name === "Google BigQuery" ? "google" : name === "dbt" || name === "dbt tests" || name === "Fivetran" || name.startsWith("Tableau") || name === "MuleSoft" ? "wide" : undefined;
  return <span className={`${styles.logoFrame}${compact ? ` ${styles.compactLogo}` : ""}`} data-brand={brand} aria-hidden="true">
    {files.length > 1 ? <span className={styles.logoGroup}>{files.map((file, index) => <Image key={file} className={styles.logoImage} src={`/images/services/logos/${file}`} alt={`${name.split(" & ")[index] ?? name} logo`} width={160} height={160} />)}</span> : files.length === 1 ? <Image className={styles.logoImage} src={`/images/services/logos/${files[0]}`} alt={`${name} logo`} width={160} height={160} /> : <span className={styles.logoFallback}>{name.slice(0, 1)}</span>}
  </span>;
}
