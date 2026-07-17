// Shared HTTP client for the NoteAPI CLI.
//
// Every request targets the NoteAPI base URL, which is read from the
// NOTEAPI_URL environment variable and falls back to http://localhost:3000.
// Responses are parsed as JSON and, on error status codes, the API error
// body is normalized into a single clear message.

/** Resolve the NoteAPI base URL from the environment (no trailing slash). */
export function getBaseUrl(): string {
  const raw = process.env.NOTEAPI_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** Field-level validation error, matching the server's `{ errors: [...] }` shape. */
export interface ApiFieldError {
  field: string;
  message: string;
}

/** Error thrown when the API responds with a non-2xx status. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFieldError(value: unknown): value is ApiFieldError {
  return (
    isRecord(value) &&
    typeof value.field === "string" &&
    typeof value.message === "string"
  );
}

/**
 * Normalize an API error body into a single human-readable message.
 *
 * The server uses two distinct error shapes:
 *   - `{ error: string }`                         — 404s and generic 400s
 *   - `{ errors: [{ field, message }, ...] }`      — POST/PUT validation failures
 *
 * Anything that matches neither shape (empty body, HTML, unexpected JSON)
 * falls back to a generic message that still includes the status code.
 *
 * This function is pure so it can be unit-tested without a running server.
 */
export function normalizeApiError(status: number, body: unknown): string {
  if (isRecord(body) && typeof body.error === "string" && body.error.length > 0) {
    return body.error;
  }

  if (isRecord(body) && Array.isArray(body.errors)) {
    const fieldErrors = body.errors.filter(isFieldError);
    if (fieldErrors.length > 0) {
      return fieldErrors.map((e) => `${e.field}: ${e.message}`).join("; ");
    }
  }

  return `Request failed with status ${status}`;
}

/** Options accepted by {@link request}. */
export interface RequestOptions {
  method?: string;
  /** Body to send as JSON. When present, a JSON Content-Type header is set. */
  body?: unknown;
}

/**
 * Issue a request to the NoteAPI and return the parsed JSON response.
 *
 * On a non-2xx status the parsed error body is normalized via
 * {@link normalizeApiError} and thrown as an {@link ApiError}. A 204
 * No Content response (or any empty body) resolves to `undefined`.
 */
export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, init);

  // Parse the body defensively: it may be empty (204) or non-JSON (proxy/HTML).
  const text = await res.text();
  let parsed: unknown = undefined;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = undefined;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, normalizeApiError(res.status, parsed));
  }

  return parsed as T;
}
