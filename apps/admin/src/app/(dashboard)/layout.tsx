import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import { AuthSessionBoundary } from "@/features/auth/components/auth-session-boundary";
import { requireAdminAccess } from "@/features/auth/lib/protected-route";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const admin = await requireAdminAccess();

  return (
    <AuthSessionBoundary>
      <AdminShell userEmail={admin.email}>{children}</AdminShell>
    </AuthSessionBoundary>
  );
}
