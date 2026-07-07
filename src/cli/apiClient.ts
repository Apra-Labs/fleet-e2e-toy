/**
 * Typed HTTP client used by CLI commands to talk to the running NoteAPI.
 *
 * Base URL comes from the NOTEAPI_URL env var, defaulting to
 * http://localhost:3000. All endpoints target /api/notes.
 */

import { Note, CreateNoteInput, UpdateNoteInput } from "../models/note";

export interface ListNotesFilter {
  tag?: string;
  q?: string;
}

function getBaseUrl(): string {
  return process.env.NOTEAPI_URL ?? "http://localhost:3000";
}

interface ErrorBody {
  error?: string;
  errors?: { field: string; message: string }[];
}

function extractErrorMessage(body: unknown): string {
  if (body && typeof body === "object") {
    const obj = body as ErrorBody;
    if (typeof obj.error === "string") {
      return obj.error;
    }
    if (Array.isArray(obj.errors)) {
      return obj.errors.map((e) => e.message).join("; ");
    }
  }
  return "Request failed";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error(`cannot reach NoteAPI at ${url}`);
  }

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    throw new Error(extractErrorMessage(body));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listNotes(filter?: ListNotesFilter): Promise<Note[]> {
  const params = new URLSearchParams();
  if (filter?.tag) {
    params.set("tag", filter.tag);
  }
  if (filter?.q) {
    params.set("q", filter.q);
  }
  const query = params.toString();
  const path = query ? `/api/notes?${query}` : "/api/notes";
  return request<Note[]>(path);
}

export async function getNote(id: string): Promise<Note> {
  return request<Note>(`/api/notes/${encodeURIComponent(id)}`);
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  return request<Note>("/api/notes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
  return request<Note>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteNote(id: string): Promise<void> {
  await request<void>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
