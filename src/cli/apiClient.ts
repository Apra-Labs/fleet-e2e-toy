import { Note } from "../models/note";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://localhost:3001/api/notes";

/** Typed error thrown when the API returns a non-2xx response. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Shape of the server's error body. */
interface ErrorBody {
  error?: string;
  errors?: string[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as ErrorBody;
      if (body.error) {
        message = body.error;
      } else if (body.errors && body.errors.length > 0) {
        message = body.errors.join("; ");
      }
    } catch {
      // Body could not be parsed; keep the generic message
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content — return void cast to T
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

/** List notes, optionally filtered by tag or search query. */
export async function listNotes(params?: {
  tag?: string;
  q?: string;
}): Promise<Note[]> {
  const url = new URL(API_BASE_URL);
  if (params?.tag) url.searchParams.set("tag", params.tag);
  if (params?.q) url.searchParams.set("q", params.q);

  const res = await fetch(url.toString());
  return handleResponse<Note[]>(res);
}

/** Fetch a single note by ID. */
export async function getNote(id: string): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`);
  return handleResponse<Note>(res);
}

/** Create a new note. */
export async function createNote(body: {
  title: string;
  content: string;
  tags?: string[];
}): Promise<Note> {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<Note>(res);
}

/** Update an existing note (partial update). */
export async function updateNote(
  id: string,
  updates: { title?: string; content?: string }
): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return handleResponse<Note>(res);
}

/** Delete a note. Resolves to void on success (204). */
export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return handleResponse<void>(res);
}
