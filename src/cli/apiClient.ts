import { Note, CreateNoteInput, UpdateNoteInput } from "../models/note";

const BASE_URL = (process.env.NOTEAPI_URL ?? "http://localhost:3000") + "/api/notes";

/**
 * Extract a human-readable error message from a non-2xx response body.
 */
async function extractErrorMessage(response: Response): Promise<string> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return `HTTP ${response.status} ${response.statusText}`;
  }

  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (typeof obj.error === "string") return obj.error;
    if (Array.isArray(obj.errors)) {
      return obj.errors
        .map((e: unknown) =>
          e && typeof e === "object" && typeof (e as Record<string, unknown>).message === "string"
            ? (e as Record<string, unknown>).message
            : String(e)
        )
        .join("; ");
    }
  }

  return `HTTP ${response.status} ${response.statusText}`;
}

async function checkResponse(response: Response): Promise<void> {
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }
}

/**
 * List all notes, optionally filtered by tag or search query.
 */
export async function listNotes(opts?: { tag?: string; q?: string }): Promise<Note[]> {
  const url = new URL(BASE_URL);
  if (opts?.tag !== undefined) url.searchParams.set("tag", opts.tag);
  if (opts?.q !== undefined) url.searchParams.set("q", opts.q);

  const response = await fetch(url.toString());
  await checkResponse(response);
  return response.json() as Promise<Note[]>;
}

/**
 * Get a single note by ID.
 */
export async function getNote(id: string): Promise<Note> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`);
  await checkResponse(response);
  return response.json() as Promise<Note>;
}

/**
 * Create a new note.
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await checkResponse(response);
  return response.json() as Promise<Note>;
}

/**
 * Update an existing note by ID.
 */
export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await checkResponse(response);
  return response.json() as Promise<Note>;
}

/**
 * Delete a note by ID.
 */
export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await checkResponse(response);
}
