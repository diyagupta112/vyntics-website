import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./page.module.css";

export function ConsultationLink({ children }: { children: ReactNode }) {
  return <Link className={`${styles.consultationAction} siteCta`} href="/case-studies#contact" data-case-study-reveal="text" data-case-study-delay="0.08">{children}</Link>;
}
