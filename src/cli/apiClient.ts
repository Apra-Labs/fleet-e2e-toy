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
