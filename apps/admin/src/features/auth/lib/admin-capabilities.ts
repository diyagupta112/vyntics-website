"use client";

import { useCurrentAdmin } from "./current-admin";

export type AdminCapabilities = {
  canReadAuditLogs: boolean;
};

export function useAdminCapabilities(): AdminCapabilities {
  const { admin } = useCurrentAdmin();
  return { canReadAuditLogs: admin?.role === "superadmin" };
}
