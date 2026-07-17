// Shared HTTP client for the CLI.
//
// This module talks to the NoteAPI over HTTP (never in-process into the store),
// so the CLI exercises the real API surface just like any external consumer.
// It deliberately defines its own response types that mirror the server's Note
// shape and imports nothing from src/models or src/utils — the CLI lives on the
// far side of a process boundary and must not depend on server internals.

// Base URL for the API, taken from NOTEAPI_URL (default http://localhost:3000).
// Any trailing slash is stripped so path joins stay clean.
export function getBaseUrl(): string {
  const raw = process.env.NOTEAPI_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

// CLI-local mirror of the server's Note. Kept independent on purpose.
export interface CliNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Inputs the CLI sends for create/update. Update is partial.
export interface CreateNotePayload {
  title: string;
  content: string;
  tags: string[];
}

export type UpdateNotePayload = Partial<CreateNotePayload>;

// Error thrown for any non-2xx response or network failure. Carries an
// already-cleaned message (never a raw stack trace) plus the HTTP status when
// available, so callers can print the message and exit non-zero.
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Shape of an error body the API may return: either { error: string } or
// { errors: string[] }. Both are handled when building a clean message.
interface ErrorBody {
  error?: unknown;
  errors?: unknown;
}

// Turn a parsed error body into a single human-readable message.
function messageFromErrorBody(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const { error, errors } = body as ErrorBody;
    if (typeof error === "string" && error.trim() !== "") {
      return error;
    }
    if (Array.isArray(errors) && errors.length > 0) {
      return errors.map((e) => String(e)).join("; ");
    }
  }
  return `Request failed with status ${status}`;
}

// Perform a request and normalize the outcome:
//  - network failures become ApiError with a clean message
//  - non-2xx responses become ApiError sourced from error/errors in the body
//  - 204/empty bodies resolve to undefined
//  - otherwise the parsed JSON body is returned
async function request<T>(
  method: string,
  path: string,
  payload?: unknown
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers:
        payload === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new ApiError(`Could not reach NoteAPI at ${url}: ${reason}`);
  }

  const text = await response.text();
  let parsed: unknown = undefined;
  if (text.trim() !== "") {
    try {
      parsed = JSON.parse(text);
    } catch {
      // Non-JSON body. On error, fall through to a status-based message;
      // on success this is unexpected, so surface a clean parse error.
      if (!response.ok) {
        throw new ApiError(
          `Request failed with status ${response.status}`,
          response.status
        );
      }
      throw new ApiError(
        `Received an invalid response from NoteAPI at ${url}`,
        response.status
      );
    }
  }

  if (!response.ok) {
    throw new ApiError(
      messageFromErrorBody(parsed, response.status),
      response.status
    );
  }

  return parsed as T;
}

// Typed helpers bound to the /api/notes endpoints.
export function get<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export function post<T>(path: string, payload: unknown): Promise<T> {
  return request<T>("POST", path, payload);
}

export function put<T>(path: string, payload: unknown): Promise<T> {
  return request<T>("PUT", path, payload);
}

export function del<T = void>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

// Convenience wrappers for the concrete note endpoints.
export const notesClient = {
  list(query?: { tag?: string; q?: string }): Promise<CliNote[]> {
    const params = new URLSearchParams();
    if (query?.tag) params.set("tag", query.tag);
    if (query?.q) params.set("q", query.q);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return get<CliNote[]>(`/api/notes${suffix}`);
  },

  getById(id: string): Promise<CliNote> {
    return get<CliNote>(`/api/notes/${encodeURIComponent(id)}`);
  },

  create(payload: CreateNotePayload): Promise<CliNote> {
    return post<CliNote>("/api/notes", payload);
  },

  update(id: string, payload: UpdateNotePayload): Promise<CliNote> {
    return put<CliNote>(`/api/notes/${encodeURIComponent(id)}`, payload);
  },

  remove(id: string): Promise<void> {
    return del<void>(`/api/notes/${encodeURIComponent(id)}`);
  },
};
