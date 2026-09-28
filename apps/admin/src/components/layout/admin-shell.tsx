import type { ReactNode } from "react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { Sidebar } from "./sidebar";
import styles from "./admin-shell.module.css";

type AdminShellProps = Readonly<{
  children: ReactNode;
  userEmail: string;
}>;

export function AdminShell({ children, userEmail }: AdminShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.workspace}>
        <header className={styles.header}>
          <p>Admin workspace</p>
          <div className={styles.account}>
            <span>{userEmail}</span>
            <LogoutButton />
          </div>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
