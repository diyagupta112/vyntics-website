import { ApiAuthenticationError, ApiError } from "./errors";
import type { ApiMethodOptions, ApiRequestOptions, ApiValidationIssue } from "./types";
import { getPublicEnvironment } from "@/lib/config/public-env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ErrorPayload = { detail?: unknown };

function buildApiUrl(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new ApiError({
      kind: "unexpected",
      message: "The API request path is invalid.",
    });
  }

  const { apiBaseUrl } = getPublicEnvironment();
  let baseUrl: URL;

  try {
    baseUrl = new URL(`${apiBaseUrl}/`);
  } catch {
    throw new ApiError({
      kind: "unexpected",
      message: "The API base URL is invalid.",
    });
  }

  if (
    !["http:", "https:"].includes(baseUrl.protocol) ||
    baseUrl.username ||
    baseUrl.password
  ) {
    throw new ApiError({
      kind: "unexpected",
      message: "The API base URL is invalid.",
    });
  }

  const requestUrl = new URL(path.slice(1), baseUrl);

  if (requestUrl.origin !== baseUrl.origin) {
    throw new ApiError({
      kind: "unexpected",
      message: "The API request path is invalid.",
    });
  }

  return requestUrl.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function parseValidationIssues(payload: unknown): ApiValidationIssue[] {
  if (!payload || typeof payload !== "object") return [];
  const detail = (payload as ErrorPayload).detail;
  if (!Array.isArray(detail)) return [];

  return detail.flatMap((item): ApiValidationIssue[] => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    if (typeof candidate.msg !== "string" || !Array.isArray(candidate.loc)) return [];

    const location = candidate.loc.filter(
      (part): part is string | number => typeof part === "string" || typeof part === "number",
    );

    return [
      {
        location,
        message: candidate.msg,
        ...(typeof candidate.type === "string" ? { type: candidate.type } : {}),
      },
    ];
  });
}

function getValidationMessage(payload: unknown, issues: ApiValidationIssue[]): string {
  if (payload && typeof payload === "object") {
    const detail = (payload as ErrorPayload).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }

  return issues[0]?.message ?? "Some submitted values are invalid.";
}

function createHttpError(status: number, payload: unknown): ApiError {
  if (status === 401) return new ApiAuthenticationError(401);

  if (status === 403) {
    return new ApiError({
      kind: "permission",
      message: "You do not have permission to perform this action.",
      status,
    });
  }

  if (status === 422) {
    const validationIssues = parseValidationIssues(payload);
    return new ApiError({
      kind: "validation",
      message: getValidationMessage(payload, validationIssues),
      status,
      validationIssues,
    });
  }

  if (status === 404) {
    return new ApiError({
      kind: "not_found",
      message: "The requested resource was not found.",
      status,
    });
  }

  if (status === 409) {
    return new ApiError({
      kind: "conflict",
      message: "The request conflicts with the current resource state.",
      status,
    });
  }

  if (status === 503) {
    return new ApiError({
      kind: "service_unavailable",
      message: "The service is temporarily unavailable. Please try again later.",
      status,
    });
  }

  return new ApiError({
    kind: "unexpected",
    message: "The request could not be completed.",
    status,
  });
}

async function getAccessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new ApiAuthenticationError();
  }

  return session.access_token;
}

async function requestResponse(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const requestUrl = buildApiUrl(path);
  const accessToken = await getAccessToken();
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  const hasJsonBody = "json" in options;
  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: options.method ?? "GET",
      headers,
      body: hasJsonBody ? JSON.stringify(options.json) : options.body,
      cache: options.cache,
      signal: options.signal,
    });
  } catch {
    throw new ApiError({
      kind: "network",
      message: "The backend could not be reached. Please try again later.",
    });
  }

  if (!response.ok) {
    throw createHttpError(response.status, await parseResponseBody(response));
  }
  return response;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await requestResponse(path, options);
  return (response.status === 204 ? undefined : await parseResponseBody(response)) as T;
}

export type ApiDownload = { blob: Blob; disposition: string | null };


function withMethod(method: NonNullable<ApiRequestOptions["method"]>, options?: ApiMethodOptions) {
  return { ...options, method } as ApiRequestOptions;
}

export const apiClient = {
  request: apiRequest,
  async download(path: string, options?: ApiMethodOptions): Promise<ApiDownload> {
    const response = await requestResponse(path, withMethod("GET", options));
    const blob = await response.blob();
    if (!blob.size) throw new ApiError({ kind: "unexpected", message: "The downloaded file is empty." });
    return { blob, disposition: response.headers.get("Content-Disposition") };
  },
  get<T = unknown>(path: string, options?: ApiMethodOptions) {
    return apiRequest<T>(path, withMethod("GET", options));
  },
  post<T = unknown>(path: string, options?: ApiMethodOptions) {
    return apiRequest<T>(path, withMethod("POST", options));
  },
  patch<T = unknown>(path: string, options?: ApiMethodOptions) {
    return apiRequest<T>(path, withMethod("PATCH", options));
  },
  put<T = unknown>(path: string, options?: ApiMethodOptions) {
    return apiRequest<T>(path, withMethod("PUT", options));
  },
  delete<T = void>(path: string, options?: ApiMethodOptions) {
    return apiRequest<T>(path, withMethod("DELETE", options));
  },
};
