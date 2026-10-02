import { apiClient } from "@/lib/api/client";
import type {
  AuditLogDetail,
  AuditLogListOptions,
  AuditLogPage,
} from "../types";

function addOptionalParameter(
  parameters: URLSearchParams,
  name: string,
  value?: string,
) {
  const normalized = value?.trim();
  if (normalized) parameters.set(name, normalized);
}

export function buildAuditLogListPath({
  action,
  actorId,
  from,
  page = 1,
  pageSize = 25,
  resourceId,
  resourceType,
  to,
}: AuditLogListOptions = {}): string {
  const parameters = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  addOptionalParameter(parameters, "actor_id", actorId);
  addOptionalParameter(parameters, "action", action);
  addOptionalParameter(parameters, "resource_type", resourceType);
  addOptionalParameter(parameters, "resource_id", resourceId);
  addOptionalParameter(parameters, "from", from);
  addOptionalParameter(parameters, "to", to);

  return `/admin/audit-logs?${parameters.toString()}`;
}

const detailPath = (auditLogId: string) =>
  `/admin/audit-logs/${encodeURIComponent(auditLogId)}`;

export const auditLogsApi = {
  list(options: AuditLogListOptions = {}) {
    return apiClient.get<AuditLogPage>(buildAuditLogListPath(options), {
      signal: options.signal,
    });
  },
  get(auditLogId: string, signal?: AbortSignal) {
    return apiClient.get<AuditLogDetail>(detailPath(auditLogId), { signal });
  },
  async checkAccess(): Promise<boolean> {
    try {
      await this.list({ page: 1, pageSize: 1 });
      return true;
    } catch {
      return false;
    }
  },
};
