import Link from "next/link";

import { GUIDELINES_PATH, guidelines, type GuidelineType } from "../content-guidelines";
import { HierarchyExample } from "./guideline-parts";
import styles from "./content-guidelines.module.css";

/** Short, collapsible guide shown next to the content editor. The full text lives in Settings. */
export function ContentGuide({ type }: Readonly<{ type: GuidelineType }>) {
  const guide = guidelines.types[type];
  return (
    <details className={styles.guide} data-testid="content-guide" open>
      <summary>Content Guidelines for {guide.title}</summary>
      <ul>{guide.quick.map((point) => <li key={point}>{point}</li>)}</ul>
      {type === "caseStudy" ? <HierarchyExample label="Case Study heading hierarchy" rows={guide.example.slice(0, 5)} /> : null}
      <Link className={styles.guideLink} href={GUIDELINES_PATH} rel="noopener noreferrer" target="_blank">
        View full guidelines →<span className={styles.srOnly}> (opens in a new tab)</span>
      </Link>
    </details>
  );
}
