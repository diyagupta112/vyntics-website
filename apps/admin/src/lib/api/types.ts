export type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiValidationIssue = {
  location: Array<string | number>;
  message: string;
  type?: string;
};

type ApiRequestBase = {
  cache?: RequestCache;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export type ApiRequestOptions = ApiRequestBase &
  (
    | {
        body?: BodyInit | null;
        json?: never;
      }
    | {
        body?: never;
        json: unknown;
      }
  ) & {
    method?: ApiMethod;
  };

export type ApiMethodOptions = Omit<ApiRequestOptions, "method">;
