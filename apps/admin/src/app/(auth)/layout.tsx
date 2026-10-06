import type { ReactNode } from "react";

import styles from "./layout.module.css";

type AuthLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className={styles.authLayout}>
      <section className={styles.visual} aria-label="Vyntics brand">
        <p className={styles.brandName}>VYNTICS</p>
        <p className={styles.brandStatement}>Administration for the work behind our digital experiences.</p>
      </section>
      <section className={styles.loginArea}>
        <div className={styles.authContainer}>{children}</div>
      </section>
    </main>
  );
}
