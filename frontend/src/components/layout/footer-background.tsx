"use client";

import { ShaderBackground } from "../../../shader-r";
import styles from "./footer-background.module.css";

export function FooterBackground() {
  return <div className={styles.background} aria-hidden="true">
    <ShaderBackground className={styles.shader} />
  </div>;
}
