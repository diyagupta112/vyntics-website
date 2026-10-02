export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type AuditLogListItem = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
};

export type AuditLogDetail = AuditLogListItem & {
  context: { [key: string]: JsonValue };
};

export type AuditLogPage = {
  items: AuditLogListItem[];
  page: number;
  page_size: number;
  total: number;
};

export type AuditLogFilters = {
  action?: string;
  actorId?: string;
  from?: string;
  resourceId?: string;
  resourceType?: string;
  to?: string;
};

export type AuditLogListOptions = AuditLogFilters & {
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
};
