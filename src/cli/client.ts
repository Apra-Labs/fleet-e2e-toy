import { Note, CreateNoteInput, UpdateNoteInput } from "../models/note";

// Base URL for the NoteAPI server. Overridable via NOTEAPI_URL, defaults to
// the same port the server listens on in src/index.ts.
export function baseUrl(): string {
  return process.env.NOTEAPI_URL ?? "http://localhost:3000";
}

// Error carrying the HTTP status so callers/entrypoint can exit non-zero.
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiErrorBody {
  error?: string;
}

async function request<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const url = `${baseUrl()}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: init?.method ?? "GET",
      headers:
        init?.body !== undefined
          ? { "Content-Type": "application/json" }
          : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new ApiError(0, `request to ${url} failed: ${detail}`);
  }

  const text = await response.text();

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    if (text) {
      try {
        const parsed = JSON.parse(text) as ApiErrorBody;
        if (parsed.error) {
          message = parsed.error;
        }
      } catch {
        message = text;
      }
    }
    throw new ApiError(response.status, message);
  }

  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export interface ListQuery {
  tag?: string;
  q?: string;
}

// Typed HTTP client for the NoteAPI resource.
export const client = {
  list(query: ListQuery = {}): Promise<Note[]> {
    const params = new URLSearchParams();
    if (query.tag) params.set("tag", query.tag);
    if (query.q) params.set("q", query.q);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<Note[]>(`/api/notes${suffix}`);
  },

  read(id: string): Promise<Note> {
    return request<Note>(`/api/notes/${encodeURIComponent(id)}`);
  },

  create(input: CreateNoteInput): Promise<Note> {
    return request<Note>(`/api/notes`, { method: "POST", body: input });
  },

  update(id: string, input: UpdateNoteInput): Promise<Note> {
    return request<Note>(`/api/notes/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: input,
    });
  },

  delete(id: string): Promise<void> {
    return request<void>(`/api/notes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
