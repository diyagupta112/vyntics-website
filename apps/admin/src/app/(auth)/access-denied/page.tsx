import type { Metadata } from "next";
import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { getAdminAccessMessage, type AdminAccessFailure } from "@/features/auth/lib/admin-access";

import styles from "./page.module.css";

export const metadata: Metadata = { title: "Access unavailable" };

type AccessDeniedPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const { reason } = await searchParams;
  const safeReason: AdminAccessFailure = reason === "permission" ? "permission" : "service";

  return (
    <section className={styles.panel} aria-labelledby="access-title">
      <p className={styles.eyebrow}>Vyntics Admin Panel</p>
      <h1 id="access-title">
        {safeReason === "permission" ? "Permission denied" : "Service unavailable"}
      </h1>
      <p>{getAdminAccessMessage(safeReason)}</p>
      <div className={styles.actions}>
        <Link className={styles.retry} href="/dashboard">
          Try again
        </Link>
        <LogoutButton />
      </div>
    </section>
  );
}
