import type { ReactNode } from "react";

import styles from "./layout.module.css";

type AuthLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className={styles.authLayout}>
      <section className={styles.visual} aria-label="Vyntics brand">
        <div className={styles.visualContent}>
          <p>VYNTICS</p>
          <span>Administration for the work behind our digital experiences.</span>
        </div>
        <div className={styles.visualMark} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
      <section className={styles.loginArea}>
        <div className={styles.authContainer}>{children}</div>
      </section>
    </main>
  );
}
