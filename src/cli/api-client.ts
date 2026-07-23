import { CreateNoteInput, Note, UpdateNoteInput } from "../models/note";

export interface ApiClientOptions {
  baseUrl?: string;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function resolveBaseUrl(options?: ApiClientOptions): string {
  return options?.baseUrl ?? process.env.NOTEAPI_URL ?? "http://localhost:3000";
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; errors?: { field: string; message: string }[] };
    if (body.error) return body.error;
    if (body.errors) return body.errors.map((e) => `${e.field}: ${e.message}`).join(", ");
  } catch {
    // response body was not JSON — fall through to generic message
  }
  return `Request failed with status ${res.status}`;
}

export async function listNotes(
  filters: { tag?: string; q?: string } = {},
  options?: ApiClientOptions
): Promise<Note[]> {
  const baseUrl = resolveBaseUrl(options);
  const url = new URL("/api/notes", baseUrl);
  if (filters.tag) url.searchParams.set("tag", filters.tag);
  if (filters.q) url.searchParams.set("q", filters.q);

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new ApiError(`Could not reach NoteAPI at ${baseUrl}: ${(err as Error).message}`);
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorBody(res));
  }

  return (await res.json()) as Note[];
}

export async function getNote(id: string, options?: ApiClientOptions): Promise<Note> {
  const baseUrl = resolveBaseUrl(options);
  const url = new URL(`/api/notes/${encodeURIComponent(id)}`, baseUrl);

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new ApiError(`Could not reach NoteAPI at ${baseUrl}: ${(err as Error).message}`);
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorBody(res));
  }

  return (await res.json()) as Note;
}

export async function createNote(input: CreateNoteInput, options?: ApiClientOptions): Promise<Note> {
  const baseUrl = resolveBaseUrl(options);
  const url = new URL("/api/notes", baseUrl);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch (err) {
    throw new ApiError(`Could not reach NoteAPI at ${baseUrl}: ${(err as Error).message}`);
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorBody(res));
  }

  return (await res.json()) as Note;
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput,
  options?: ApiClientOptions
): Promise<Note> {
  const baseUrl = resolveBaseUrl(options);
  const url = new URL(`/api/notes/${encodeURIComponent(id)}`, baseUrl);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch (err) {
    throw new ApiError(`Could not reach NoteAPI at ${baseUrl}: ${(err as Error).message}`);
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorBody(res));
  }

  return (await res.json()) as Note;
}

export async function deleteNote(id: string, options?: ApiClientOptions): Promise<void> {
  const baseUrl = resolveBaseUrl(options);
  const url = new URL(`/api/notes/${encodeURIComponent(id)}`, baseUrl);

  let res: Response;
  try {
    res = await fetch(url, { method: "DELETE" });
  } catch (err) {
    throw new ApiError(`Could not reach NoteAPI at ${baseUrl}: ${(err as Error).message}`);
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorBody(res));
  }
}
