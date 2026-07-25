import { Note, CreateNoteInput, UpdateNoteInput } from "../models/note";

/**
 * Base URL for the NoteAPI. Defaults to http://localhost:3000, overridable
 * via the NOTEAPI_URL environment variable.
 */
export function getBaseUrl(): string {
  return (process.env.NOTEAPI_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Typed error thrown when the API responds with a non-2xx status, or when the
 * request itself fails (network error, unreachable host). Carries the HTTP
 * status (0 for transport-level failures) so callers can map it to an exit code.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(message: string, status: number, body: unknown = undefined) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method: string;
  path: string;
  body?: unknown;
}

/**
 * Extracts a human-readable message from a parsed API error body of the form
 * `{ error: string }` or `{ errors: string[] }`, falling back to a status line.
 */
function messageFromBody(body: unknown, status: number, statusText: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.error === "string") {
      return record.error;
    }
    if (Array.isArray(record.errors)) {
      return record.errors.join("; ");
    }
  }
  return `Request failed with status ${status} ${statusText}`.trim();
}

/**
 * Performs an HTTP request against the NoteAPI and returns the parsed JSON.
 * Throws an ApiError on any non-2xx response (carrying the status) or on a
 * transport-level failure (status 0). A 204 No Content resolves to undefined.
 */
async function request<T>(options: RequestOptions): Promise<T> {
  const url = `${getBaseUrl()}${options.path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers: options.body === undefined ? {} : { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new ApiError(`Could not reach NoteAPI at ${url}: ${detail}`, 0);
  }

  const text = await response.text();
  let parsed: unknown = undefined;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      messageFromBody(parsed, response.status, response.statusText),
      response.status,
      parsed
    );
  }

  return parsed as T;
}

/**
 * Thin, typed wrapper around the NoteAPI endpoints. Each method returns parsed
 * JSON and throws an ApiError (carrying the HTTP status) on failure.
 */
export const apiClient = {
  listNotes(query?: { tag?: string; q?: string }): Promise<Note[]> {
    const params = new URLSearchParams();
    if (query?.tag) params.set("tag", query.tag);
    if (query?.q) params.set("q", query.q);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<Note[]>({ method: "GET", path: `/api/notes${suffix}` });
  },

  getNote(id: string): Promise<Note> {
    return request<Note>({ method: "GET", path: `/api/notes/${encodeURIComponent(id)}` });
  },

  createNote(input: CreateNoteInput): Promise<Note> {
    return request<Note>({ method: "POST", path: "/api/notes", body: input });
  },

  updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
    return request<Note>({
      method: "PUT",
      path: `/api/notes/${encodeURIComponent(id)}`,
      body: input,
    });
  },

  deleteNote(id: string): Promise<void> {
    return request<void>({
      method: "DELETE",
      path: `/api/notes/${encodeURIComponent(id)}`,
    });
  },
};
