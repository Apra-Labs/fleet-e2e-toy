import {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
} from "../models/note";

/**
 * Exit codes used by the CLI. Chosen so that callers can map error classes
 * to conventional process exit statuses.
 */
export const ExitCode = {
  USAGE: 2,
  NOT_FOUND: 4,
  VALIDATION: 5,
  NETWORK: 6,
  SERVER: 7,
} as const;

export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode];

/**
 * Typed error thrown by the client on any non-2xx response or transport
 * failure. Carries a human-readable message and a suggested process exit code.
 */
export class CliError extends Error {
  readonly exitCode: ExitCodeValue;

  constructor(message: string, exitCode: ExitCodeValue) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
  }
}

export interface ListParams {
  tag?: string;
  q?: string;
}

function baseUrl(): string {
  return process.env.API_URL ?? "http://localhost:3000";
}

function suggestedExitCode(status: number): ExitCodeValue {
  if (status === 404) return ExitCode.NOT_FOUND;
  if (status === 400) return ExitCode.VALIDATION;
  return ExitCode.SERVER;
}

interface ApiErrorBody {
  error?: string;
  errors?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (isRecord(body)) {
      const parsed = body as ApiErrorBody;
      if (typeof parsed.error === "string") return parsed.error;
      if (Array.isArray(parsed.errors)) return parsed.errors.join("; ");
    }
  } catch {
    // fall through to status text
  }
  return `Request failed with status ${res.status}`;
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<{ status: number; body: T }> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, init);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new CliError(
      `Could not reach NoteAPI at ${baseUrl()}: ${detail}`,
      ExitCode.NETWORK
    );
  }

  if (!res.ok) {
    throw new CliError(await readErrorMessage(res), suggestedExitCode(res.status));
  }

  if (res.status === 204) {
    return { status: res.status, body: undefined as T };
  }

  const body = (await res.json()) as T;
  return { status: res.status, body };
}

export async function listNotes(params: ListParams = {}): Promise<Note[]> {
  const query = new URLSearchParams();
  if (params.tag) query.set("tag", params.tag);
  if (params.q) query.set("q", params.q);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const { body } = await request<Note[]>(`/api/notes${suffix}`);
  return body;
}

export async function getNote(id: string): Promise<Note> {
  const { body } = await request<Note>(`/api/notes/${encodeURIComponent(id)}`);
  return body;
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const { body } = await request<Note>("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return body;
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput
): Promise<Note> {
  const { body } = await request<Note>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return body;
}

export async function deleteNote(id: string): Promise<void> {
  await request<void>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
