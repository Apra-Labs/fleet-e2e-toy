import * as http from "http";
import * as https from "https";
import { Note } from "../models/note";

const BASE_URL = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? "3000"}`;

interface ApiResponse<T> {
  status: number;
  body: T;
}

/** Perform an HTTP GET request and parse the JSON response body. */
function get<T>(path: string): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const lib = url.startsWith("https") ? https : http;

    const req = lib.get(url, (res) => {
      let data = "";
      res.on("data", (chunk: string) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const body = JSON.parse(data) as T;
          resolve({ status: res.statusCode ?? 0, body });
        } catch {
          reject(new Error(`Failed to parse response from ${url}`));
        }
      });
    });

    req.on("error", (err: Error) => {
      reject(new Error(`Network error: ${err.message}`));
    });

    req.end();
  });
}

/** Perform an HTTP request with a body (POST, PUT, DELETE) and parse JSON response. */
function request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const lib = url.startsWith("https") ? https : http;
    const bodyStr = body !== undefined ? JSON.stringify(body) : "";
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
      },
    };

    const req = lib.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk: string) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = data.length > 0 ? (JSON.parse(data) as T) : ({} as T);
          resolve({ status: res.statusCode ?? 0, body: parsed });
        } catch {
          reject(new Error(`Failed to parse response from ${url}`));
        }
      });
    });

    req.on("error", (err: Error) => {
      reject(new Error(`Network error: ${err.message}`));
    });

    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

/** Fetch all notes, optionally filtered by tag and/or query string. */
export async function fetchNotes(
  tag?: string,
  q?: string
): Promise<Note[]> {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const qs = params.toString();
  const path = `/api/notes${qs ? `?${qs}` : ""}`;

  const res = await get<Note[] | { error: string }>(path);
  if (res.status < 200 || res.status >= 300) {
    const err = (res.body as { error?: string }).error ?? "Unknown error";
    throw new Error(`API error (${res.status}): ${err}`);
  }
  return res.body as Note[];
}

/** Fetch a single note by ID. */
export async function fetchNote(id: string): Promise<Note> {
  const res = await get<Note | { error: string }>(`/api/notes/${encodeURIComponent(id)}`);
  if (res.status < 200 || res.status >= 300) {
    const err = (res.body as { error?: string }).error ?? "Unknown error";
    throw new Error(`API error (${res.status}): ${err}`);
  }
  return res.body as Note;
}

/** Create a new note via POST /api/notes. */
export async function createNote(title: string, content: string, tags: string[]): Promise<Note> {
  const res = await request<Note | { error: string }>("POST", "/api/notes", { title, content, tags });
  if (res.status < 200 || res.status >= 300) {
    const err = (res.body as { error?: string }).error ?? "Unknown error";
    throw new Error(`API error (${res.status}): ${err}`);
  }
  return res.body as Note;
}

/** Update an existing note via PUT /api/notes/:id. */
export async function updateNote(
  id: string,
  updates: { title?: string; content?: string; tags?: string[] }
): Promise<Note> {
  const res = await request<Note | { error: string }>("PUT", `/api/notes/${encodeURIComponent(id)}`, updates);
  if (res.status < 200 || res.status >= 300) {
    const err = (res.body as { error?: string }).error ?? "Unknown error";
    throw new Error(`API error (${res.status}): ${err}`);
  }
  return res.body as Note;
}

/** Delete a note via DELETE /api/notes/:id. */
export async function deleteNote(id: string): Promise<void> {
  const res = await request<{ error?: string }>("DELETE", `/api/notes/${encodeURIComponent(id)}`);
  if (res.status < 200 || res.status >= 300) {
    const err = (res.body as { error?: string }).error ?? "Unknown error";
    throw new Error(`API error (${res.status}): ${err}`);
  }
}
