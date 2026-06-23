import { Note, CreateNoteInput, UpdateNoteInput } from "../models/note";

/**
 * Error thrown by the HTTP client when a request fails or the API
 * returns a non-success status. Carries the HTTP status code (0 when
 * the request never reached the server) and a human-readable message.
 */
export class CliError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CliError";
    this.status = status;
  }
}

function baseUrl(): string {
  return process.env.API_BASE_URL ?? "http://localhost:3000";
}

interface ApiErrorBody {
  error?: string;
  errors?: { field: string; message: string }[];
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (isApiErrorBody(body)) {
      if (typeof body.error === "string") {
        return body.error;
      }
      if (Array.isArray(body.errors)) {
        return body.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
      }
    }
  } catch {
    // Body was not JSON — fall through to the status text.
  }
  return res.statusText || `HTTP ${res.status}`;
}

async function request<T>(
  path: string,
  init: RequestInit,
  parse: boolean
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new CliError(0, `Request failed: ${message}`);
  }

  if (!res.ok) {
    throw new CliError(res.status, await parseErrorMessage(res));
  }

  if (!parse) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export function listNotes(query?: {
  tag?: string;
  q?: string;
}): Promise<Note[]> {
  const params = new URLSearchParams();
  if (query?.tag) params.set("tag", query.tag);
  if (query?.q) params.set("q", query.q);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<Note[]>(`/api/notes${suffix}`, { method: "GET" }, true);
}

export function getNote(id: string): Promise<Note> {
  return request<Note>(
    `/api/notes/${encodeURIComponent(id)}`,
    { method: "GET" },
    true
  );
}

export function createNote(input: CreateNoteInput): Promise<Note> {
  return request<Note>(
    "/api/notes",
    { method: "POST", body: JSON.stringify(input) },
    true
  );
}

export function updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
  return request<Note>(
    `/api/notes/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(input) },
    true
  );
}

export function deleteNote(id: string): Promise<void> {
  return request<void>(
    `/api/notes/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    false
  );
}
