import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import type { CaseStudyListItem } from "@/lib/case-studies";
import styles from "./case-study-related-card.module.css";

// Adapted from PrebuiltUI's Cards / Blog Card visual treatment.
export function CaseStudyRelatedCard({ study }: { study: CaseStudyListItem }) {
  return <Link className={styles.card} href={`/case-studies/${encodeURIComponent(study.slug)}`}>
    <OptimizedImage src={study.cover_image_url} alt={`${study.title} project cover`} width={960} height={540} sizes="(max-width: 700px) 100vw, 33vw" />
    <h3>{study.title}</h3>
    {study.tags.length > 0 && <p className={styles.category}>{study.tags.slice(0, 2).join(" · ")}</p>}
    <p className={styles.summary}>{study.excerpt}</p>
    <span>View Case Study <span aria-hidden="true">→</span></span>
  </Link>;
}
