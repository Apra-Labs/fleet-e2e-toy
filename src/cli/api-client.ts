// Thin HTTP client wrapper around the built-in fetch, used by CLI commands
// to talk to the NoteAPI server.

export const DEFAULT_API_BASE_URL = process.env.NOTEAPI_URL ?? "http://localhost:3000";

export interface ApiResult {
  status: number;
  data: unknown;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  url: string;
  constructor(url: string) {
    super(`Could not connect to API at ${url}`);
    this.url = url;
    this.name = "NetworkError";
  }
}

/**
 * Performs an HTTP request against the NoteAPI server.
 * Throws ApiError for 4xx/5xx responses and NetworkError when the request
 * itself fails (connection refused, DNS failure, etc).
 */
export async function apiRequest(
  path: string,
  options: { method?: string; body?: unknown; baseUrl?: string } = {}
): Promise<ApiResult> {
  const baseUrl = options.baseUrl ?? DEFAULT_API_BASE_URL;
  const url = `${baseUrl}${path}`;
  const method = options.method ?? "GET";

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new NetworkError(url);
  }

  let data: unknown = null;
  if (response.status !== 204) {
    const text = await response.text();
    if (text.length > 0) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).error)
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return { status: response.status, data };
}
