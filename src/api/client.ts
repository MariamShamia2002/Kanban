import type { ApiError, ApiErrorCode,ApiErrorBody } from "./types";

export const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  throw new Error("VITE_API_URL is not defined");
}

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {"Content-Type": "application/json" ,
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
      error:
        isErrorEnvelope(body)
          ? body.error
          : { code: synthesisedCode, message: response.statusText || synthesisedCode },
    };

    throw apiError;
  }

  // ── 204 No Content 
  if (response.status === 204) {
    return undefined as T;
  }

  if (response.status===401){
    window.location.href = "/login";
    
  }
  // ── Success 
  const body = await response.json();
  return body.data as T;
}

/** Checks that an unknown value has the { error: { code, message } } shape. */
export function isErrorEnvelope(
  v: unknown,
): v is {error: ApiErrorBody }{
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