import request from "supertest";
import app from "../../src/app";
import { noteStore } from "../../src/models/note";
import { CliError } from "../../src/cli/types";
import { Note } from "../../src/models/note";

// Mock apiClient before importing anything that depends on it
jest.mock("../../src/cli/apiClient");

import * as apiClient from "../../src/cli/apiClient";
import { main } from "../../src/cli/cli";

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

beforeEach(() => {
  noteStore.clear();
  jest.clearAllMocks();

  // Default: proxy through in-process Express app
  mockApiClient.listNotes.mockImplementation(async (query?: string) => {
    const url = query ? `/api/notes?q=${encodeURIComponent(query)}` : "/api/notes";
    const res = await request(app).get(url);
    if (res.status >= 200 && res.status < 300) return res.body as Note[];
    const msg = (res.body as Record<string, unknown>)?.error ?? `Request failed with status ${res.status}`;
    throw new CliError(String(msg), res.status);
  });

  mockApiClient.getNote.mockImplementation(async (id: string) => {
    const res = await request(app).get(`/api/notes/${encodeURIComponent(id)}`);
    if (res.status >= 200 && res.status < 300) return res.body as Note;
    const msg = (res.body as Record<string, unknown>)?.error ?? `Request failed with status ${res.status}`;
    throw new CliError(String(msg), res.status);
  });

  mockApiClient.createNote.mockImplementation(async (input) => {
    const res = await request(app).post("/api/notes").send(input);
    if (res.status >= 200 && res.status < 300) return res.body as Note;
    const msg = (res.body as Record<string, unknown>)?.error ?? `Request failed with status ${res.status}`;
    throw new CliError(String(msg), res.status);
  });

  mockApiClient.deleteNote.mockImplementation(async (id: string) => {
    const res = await request(app).delete(`/api/notes/${encodeURIComponent(id)}`);
    if (res.status >= 200 && res.status < 300) return;
    const msg = (res.body as Record<string, unknown>)?.error ?? `Request failed with status ${res.status}`;
    throw new CliError(String(msg), res.status);
  });
});

/** Capture stdout/stderr during main() and return them. */
async function runMain(argv: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];

  const origStdoutWrite = process.stdout.write.bind(process.stdout);
  const origStderrWrite = process.stderr.write.bind(process.stderr);

  process.stdout.write = ((chunk: string) => {
    stdoutChunks.push(chunk);
    return true;
  }) as typeof process.stdout.write;

  process.stderr.write = ((chunk: string) => {
    stderrChunks.push(chunk);
    return true;
  }) as typeof process.stderr.write;

  let exitCode: number;
  try {
    exitCode = await main(argv);
  } finally {
    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;
  }

  return {
    stdout: stdoutChunks.join(""),
    stderr: stderrChunks.join(""),
    exitCode,
  };
}

describe("--json flag output mode", () => {
  it("list --json outputs valid JSON array", async () => {
    await request(app).post("/api/notes").send({ title: "Alpha", content: "Content A", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Beta", content: "Content B", tags: [] });

    const { stdout, exitCode } = await runMain(["list", "--json"]);

    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as Note[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].title).toBe("Alpha");
  });

  it("list --json outputs empty array when no notes", async () => {
    const { stdout, exitCode } = await runMain(["list", "--json"]);

    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as Note[];
    expect(parsed).toEqual([]);
  });

  it("read --json outputs valid JSON note", async () => {
    const createRes = await request(app)
      .post("/api/notes")
      .send({ title: "Test Note", content: "Body text", tags: ["a"] });
    const id = (createRes.body as Note).id;

    const { stdout, exitCode } = await runMain(["read", "--id", id, "--json"]);

    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as Note;
    expect(parsed.id).toBe(id);
    expect(parsed.title).toBe("Test Note");
  });

  it("create --json outputs valid JSON note with id", async () => {
    const { stdout, exitCode } = await runMain([
      "create", "--title", "My Note", "--content", "My content", "--json",
    ]);

    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as Note;
    expect(typeof parsed.id).toBe("string");
    expect(parsed.title).toBe("My Note");
    expect(parsed.content).toBe("My content");
  });

  it("delete --json outputs JSON confirmation", async () => {
    const createRes = await request(app)
      .post("/api/notes")
      .send({ title: "To Delete", content: "Gone", tags: [] });
    const id = (createRes.body as Note).id;

    const { stdout, exitCode } = await runMain(["delete", "--id", id, "--json"]);

    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as { deleted: boolean; id: string };
    expect(parsed.deleted).toBe(true);
    expect(parsed.id).toBe(id);
  });

  it("human-readable output is default (no --json)", async () => {
    await request(app).post("/api/notes").send({ title: "Human Note", content: "Content", tags: [] });

    const { stdout, exitCode } = await runMain(["list"]);

    expect(exitCode).toBe(0);
    // Should not be JSON array format
    expect(stdout).toContain("Human Note");
    expect(() => {
      // Human-readable format: "id: title" per line, not a JSON array
      const trimmed = stdout.trim();
      if (trimmed.startsWith("[")) {
        // It would be JSON — that's wrong without --json flag
        throw new Error("Unexpected JSON output without --json flag");
      }
    }).not.toThrow();
  });
});
