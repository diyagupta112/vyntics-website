import type { HierarchyRow } from "../content-guidelines";
import styles from "./content-guidelines.module.css";

export function HierarchyExample({ rows, label }: Readonly<{ rows: HierarchyRow[]; label: string }>) {
  return (
    <ul aria-label={label} className={styles.hierarchy}>
      {rows.map((row, index) => (
        <li className={styles[`depth${row.depth}`]} key={`${row.label}-${index}`}>
          <span className={styles.tag}>{row.label}</span>
          <span>{row.text}</span>
        </li>
      ))}
    </ul>
  );
}
