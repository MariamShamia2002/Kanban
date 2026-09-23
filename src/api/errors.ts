import type { ApiError, ApiErrorCode } from "./types";

export type { ApiError, ApiErrorBody, ApiErrorCode } from "./types";

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "error" in err &&
    typeof (err as ApiError).error?.code === "string"
  );
}

function hasCode(err: unknown, code: ApiErrorCode): boolean {
  return isApiError(err) && err.error.code === code;
}

export function getFieldErrors(err: unknown): Record<string, string> {
  if (isApiError(err) && err.error.code === "VALIDATION_ERROR") {
    return err.error.fields ?? {};
  }
  return {};
}

export const isValidationError = (err: unknown) =>
  hasCode(err, "VALIDATION_ERROR");

export const isUnauthorized = (err: unknown) =>
  hasCode(err, "UNAUTHORIZED") ||
  (isApiError(err) && err.status === 401);

export const isNotFound = (err: unknown) =>
  hasCode(err, "NOT_FOUND") ||
  (isApiError(err) && err.status === 404);

export const isConflict = (err: unknown) =>
  hasCode(err, "CONFLICT") ||
  (isApiError(err) && err.status === 409);

export const isServiceUnavailable = (err: unknown) =>
  hasCode(err, "SERVICE_UNAVAILABLE") ||
  (isApiError(err) && err.status === 503);

export const isInternalError = (err: unknown) =>
  hasCode(err, "INTERNAL_ERROR") ||
  (isApiError(err) && err.status === 500);

export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
): string {
  return isApiError(err) ? err.error.message : fallback;
}