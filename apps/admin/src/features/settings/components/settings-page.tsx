"use client";

import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { useCurrentAdmin } from "@/features/auth/lib/current-admin";
import type { AdminRole } from "@/features/auth/types";

import styles from "./settings-page.module.css";

function roleLabel(role: AdminRole) {
  return role === "superadmin" ? "Super Admin" : "Admin";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
  }).format(new Date(value));
}

function SettingsCard({
  children,
  description,
  id,
  title,
}: Readonly<{
  children: ReactNode;
  description: string;
  id: string;
  title: string;
}>) {
  return (
    <Card aria-labelledby={id} className={styles.card} role="region">
      <div className={styles.cardHeading}>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </Card>
  );
}

export function SettingsPage() {
  const { admin, error, loading, retry } = useCurrentAdmin();

  return (
    <div className={styles.page}>
      <PageHeader
        title="Settings"
        description="Manage your admin account and review your access details."
      />

      {loading ? (
        <div aria-label="Loading account settings" className={styles.loadingGrid} role="status">
          <div className={`${styles.skeleton} ${styles.profileSkeleton}`} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : null}

      {!loading && error ? (
        <Card className={styles.errorState} role="alert">
          <h2>Unable to load your account information</h2>
          <p>{error}</p>
          <Button onClick={retry} variant="secondary">
            Try Again
          </Button>
        </Card>
      ) : null}

      {!loading && !error && admin ? (
        <div className={styles.settingsGrid}>
          <SettingsCard
            description="Your administrator account details."
            id="profile-settings-heading"
            title="Profile"
          >
            <dl className={styles.profileDetails}>
              <div>
                <dt>Email</dt>
                <dd>{admin.email}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd><span className={styles.badge}>{roleLabel(admin.role)}</span></dd>
              </div>
              <div>
                <dt>Account status</dt>
                <dd>
                  <span className={`${styles.badge} ${admin.is_active ? styles.activeBadge : styles.inactiveBadge}`}>
                    {admin.is_active ? "Active" : "Inactive"}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd><time dateTime={admin.created_at}>{formatDate(admin.created_at)}</time></dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd><time dateTime={admin.updated_at}>{formatDate(admin.updated_at)}</time></dd>
              </div>
            </dl>
          </SettingsCard>

          <SettingsCard
            description="Your access level is managed by the Vyntics backend."
            id="access-settings-heading"
            title="Access & Permissions"
          >
            <dl className={styles.compactDetails}>
              <div>
                <dt>Access level</dt>
                <dd><span className={styles.badge}>{roleLabel(admin.role)}</span></dd>
              </div>
              <div>
                <dt>Access summary</dt>
                <dd>You have access to administrative features available to your role.</dd>
              </div>
            </dl>
          </SettingsCard>

          <SettingsCard
            description="Safe information about your current authenticated session."
            id="security-settings-heading"
            title="Authentication & Security"
          >
            <dl className={styles.compactDetails}>
              <div>
                <dt>Session</dt>
                <dd><span className={`${styles.badge} ${styles.activeBadge}`}>Authenticated</span></dd>
              </div>
              <div>
                <dt>Session protection</dt>
                <dd>Supabase Auth</dd>
              </div>
            </dl>
          </SettingsCard>

          <SettingsCard
            description="End your current authenticated Admin session."
            id="actions-settings-heading"
            title="Account Actions"
          >
            <div className={styles.accountAction}>
              <div>
                <h3>Sign out of this account</h3>
                <p>You will need to authenticate again to access the Admin Panel.</p>
              </div>
              <LogoutButton label="Sign Out" />
            </div>
          </SettingsCard>

          <SettingsCard
            description="Information about the current application."
            id="application-settings-heading"
            title="Application"
          >
            <dl className={styles.compactDetails}>
              <div>
                <dt>Application</dt>
                <dd>Vyntics Admin Panel</dd>
              </div>
            </dl>
          </SettingsCard>
        </div>
      ) : null}
    </div>
  );
}
