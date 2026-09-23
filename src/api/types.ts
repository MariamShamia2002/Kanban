// error
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR"
  | "UNKNOWN_ERROR";

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  //Present only on VALIDATION_ERROR. Keys are field names; values are display-ready strings. */
  fields?: Record<string, string>;
}

export interface ApiError {
  status: number;
  error: ApiErrorBody;
}