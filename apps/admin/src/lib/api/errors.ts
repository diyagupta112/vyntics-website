import type { ApiValidationIssue } from "./types";

export type ApiErrorKind =
  | "authentication"
  | "permission"
  | "validation"
  | "not_found"
  | "conflict"
  | "service_unavailable"
  | "network"
  | "unexpected";

type ApiErrorOptions = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  validationIssues?: ApiValidationIssue[];
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly validationIssues: ApiValidationIssue[];

  constructor({ kind, message, status, validationIssues = [] }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.validationIssues = validationIssues;
  }
}

export class ApiAuthenticationError extends ApiError {
  constructor(status?: number) {
    super({
      kind: "authentication",
      message: "Your authentication session is unavailable or has expired.",
      status,
    });
    this.name = "ApiAuthenticationError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
