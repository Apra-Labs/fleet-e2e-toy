import { Note, CreateNoteInput, UpdateNoteInput } from "../models/note";
import { CliError } from "./types";

const baseUrl = process.env.NOTEAPI_URL ?? "http://localhost:3000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    // 204 No Content has no body
    if (res.status === 204) {
      return undefined as unknown as T;
    }
    return res.json() as Promise<T>;
  }

  let message = `Request failed with status ${res.status}`;
  try {
    const body = await res.json() as Record<string, unknown>;
    if (typeof body.error === "string") {
      message = body.error;
    }
  } catch {
    // ignore parse errors; use default message
  }

  throw new CliError(message, res.status);
}

export async function listNotes(query?: string): Promise<Note[]> {
  const url = new URL(`${baseUrl}/api/notes`);
  if (query) {
    url.searchParams.set("q", query);
  }
  const res = await fetch(url.toString());
  return handleResponse<Note[]>(res);
}

export async function getNote(id: string): Promise<Note> {
  const res = await fetch(`${baseUrl}/api/notes/${encodeURIComponent(id)}`);
  return handleResponse<Note>(res);
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const res = await fetch(`${baseUrl}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Note>(res);
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
  const res = await fetch(`${baseUrl}/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Note>(res);
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/api/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return handleResponse<void>(res);
}
