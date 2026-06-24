import { Note, CreateNoteInput, UpdateNoteInput } from "../models/note";

function getBaseUrl(): string {
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  if (process.env.PORT) {
    return `http://localhost:${process.env.PORT}`;
  }
  return "http://localhost:3000";
}

async function handleResponse(response: Response): Promise<unknown> {
  if (response.ok) {
    if (response.status === 204) {
      return;
    }
    return response.json();
  }

  let errorMessage = `HTTP Error ${response.status}`;
  try {
    const body = (await response.json()) as Record<string, unknown> | null | undefined;
    if (body) {
      if (typeof body.error === "string") {
        errorMessage = body.error;
      } else if (Array.isArray(body.errors)) {
        errorMessage = body.errors
          .map((e: unknown) => {
            const err = e as { field?: string; message?: string };
            return err.field && err.message ? `${err.field}: ${err.message}` : String(e);
          })
          .join(", ");
      }
    }
  } catch {
    // Ignore JSON parse errors
  }
  throw new Error(errorMessage);
}

export async function listNotes(filters?: { tag?: string; q?: string }): Promise<Note[]> {
  const url = new URL(`${getBaseUrl()}/api/notes`);
  if (filters?.tag) {
    url.searchParams.append("tag", filters.tag);
  }
  if (filters?.q) {
    url.searchParams.append("q", filters.q);
  }

  const response = await fetch(url.toString());
  return (await handleResponse(response)) as Note[];
}

export async function getNote(id: string): Promise<Note> {
  const response = await fetch(`${getBaseUrl()}/api/notes/${encodeURIComponent(id)}`);
  return (await handleResponse(response)) as Note;
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const response = await fetch(`${getBaseUrl()}/api/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return (await handleResponse(response)) as Note;
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
  const response = await fetch(`${getBaseUrl()}/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return (await handleResponse(response)) as Note;
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/api/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await handleResponse(response);
}
