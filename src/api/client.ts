import type { ApiError, ApiErrorBody, ApiErrorCode } from "./types";

export const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  throw new Error("VITE_API_URL is not defined");
}

interface RequestOptions extends RequestInit {
  token?: string;
  /** Return the full `{ data, meta }` envelope instead of only `data`. */
  withMeta?: boolean;
}

export interface ApiResponse<T, M = unknown> {
  data: T;
  meta?: M;
}

export function apiClient<T, M = unknown>(
  endpoint: string,
  options: RequestOptions & { withMeta: true },
): Promise<ApiResponse<T, M>>;
export function apiClient<T>(
  endpoint: string,
  options?: RequestOptions & { withMeta?: false },
): Promise<T>;
export async function apiClient<T, M = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T | ApiResponse<T, M>> {
  const { token, headers, withMeta = false, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  // ── Error path
  if (!response.ok) {
    let body: unknown = null;

    try {
      body = await response.json();
    } catch {
      // Body is not JSON
    }

    const synthesisedCode = statusToCode(response.status);

    const apiError: ApiError = {
      status: response.status,
      error: isErrorEnvelope(body)
        ? body.error
        : { code: synthesisedCode, message: response.statusText || synthesisedCode },
    };
    if (response.status === 401 && token) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.replace("/login");
    }
    throw apiError;
  }

  // ── Success (204 No Content has no body)
  const envelope: ApiResponse<T, M> =
    response.status === 204 ? { data: undefined as T } : await response.json();

  return withMeta ? envelope : envelope.data;
}

/** Checks that an unknown value has the { error: { code, message } } shape. */
export function isErrorEnvelope(v: unknown): v is { error: ApiErrorBody } {
  return (
    typeof v === "object" &&
    v !== null &&
    "error" in v &&
    typeof (v as { error?: unknown }).error === "object" &&
    (v as { error: { code?: unknown } }).error !== null &&
    typeof (v as { error: { code?: unknown } }).error.code === "string"
  );
}

/** Maps an HTTP status to the canonical API error code. */
export function statusToCode(status: number): ApiErrorCode {
  switch (status) {
    case 400: return "VALIDATION_ERROR";
    case 401: return "UNAUTHORIZED";
    case 404: return "NOT_FOUND";
    case 409: return "CONFLICT";
    case 500: return "INTERNAL_ERROR";
    case 503: return "SERVICE_UNAVAILABLE";
    default:  return "UNKNOWN_ERROR";
  }
}
