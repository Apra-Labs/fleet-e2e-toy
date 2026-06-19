import { Note, CreateNoteInput, UpdateNoteInput } from "../models/note";

const BASE_URL = process.env["NOTEAPI_URL"] ?? "http://localhost:3000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `NoteAPI error ${response.status}: ${text}`
    );
  }
  return response.json() as Promise<T>;
}

export async function listNotes(params?: {
  tag?: string;
  q?: string;
}): Promise<Note[]> {
  const url = new URL(`${BASE_URL}/api/notes`);
  if (params?.tag) url.searchParams.set("tag", params.tag);
  if (params?.q) url.searchParams.set("q", params.q);
  const response = await fetch(url.toString());
  return handleResponse<Note[]>(response);
}

export async function getNote(id: string): Promise<Note> {
  const response = await fetch(`${BASE_URL}/api/notes/${id}`);
  return handleResponse<Note>(response);
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const response = await fetch(`${BASE_URL}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Note>(response);
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput
): Promise<Note> {
  const response = await fetch(`${BASE_URL}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Note>(response);
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/notes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `NoteAPI error ${response.status}: ${text}`
    );
  }
}
