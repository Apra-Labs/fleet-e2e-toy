import { Note, CreateNoteInput, UpdateNoteInput } from "../models/note";

const baseURL = process.env.NOTEAPI_URL ?? "http://localhost:3000";

async function fetchJSON<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${baseURL}${path}`;
  const options: RequestInit = { method };

  if (body) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok) {
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.error ?? text;
    } catch {
      // Keep the raw text
    }
    throw new Error(`API error ${response.status}: ${message}`);
  }

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API error ${response.status}: Invalid JSON response`);
  }
}

export async function listNotes(tag?: string, q?: string): Promise<Note[]> {
  const params = new URLSearchParams();
  if (tag) params.append("tag", tag);
  if (q) params.append("q", q);
  const query = params.toString();
  const path = `/notes${query ? `?${query}` : ""}`;
  return fetchJSON<Note[]>("GET", path);
}

export async function getNote(id: string): Promise<Note> {
  return fetchJSON<Note>("GET", `/notes/${id}`);
}

export async function createNote(
  title: string,
  content: string,
  tags?: string[]
): Promise<Note> {
  const input: CreateNoteInput = {
    title,
    content,
    tags: tags ?? [],
  };
  return fetchJSON<Note>("POST", "/notes", input);
}

export async function updateNote(
  id: string,
  updates: UpdateNoteInput
): Promise<Note> {
  return fetchJSON<Note>("PUT", `/notes/${id}`, updates);
}

export async function deleteNote(id: string): Promise<void> {
  await fetchJSON<void>("DELETE", `/notes/${id}`);
}
