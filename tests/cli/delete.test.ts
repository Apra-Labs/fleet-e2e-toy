import request from "supertest";
import app from "../../src/app";
import { noteStore, Note } from "../../src/models/note";
import { CliError } from "../../src/cli/types";

// Mock apiClient before importing anything that depends on it
jest.mock("../../src/cli/apiClient");

import * as apiClient from "../../src/cli/apiClient";
import { main } from "../../src/cli/cli";

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

beforeEach(() => {
  noteStore.clear();
  jest.clearAllMocks();

  // Default: proxy through in-process Express app
  mockApiClient.deleteNote.mockImplementation(async (id: string) => {
    const res = await request(app).delete(`/api/notes/${encodeURIComponent(id)}`);
    if (res.status >= 200 && res.status < 300) return undefined;
    const msg = (res.body as Record<string, unknown>)?.error ?? `Request failed with status ${res.status}`;
    throw new CliError(String(msg), res.status);
  });

  mockApiClient.getNote.mockImplementation(async (id: string) => {
    const res = await request(app).get(`/api/notes/${encodeURIComponent(id)}`);
    if (res.status >= 200 && res.status < 300) return res.body as Note;
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

describe("delete command end-to-end", () => {
  async function seedNote(title: string, content: string): Promise<Note> {
    const res = await request(app).post("/api/notes").send({ title, content, tags: [] });
    return res.body as Note;
  }

  it("deletes an existing note and exits with code 0", async () => {
    const note = await seedNote("Delete Me", "Content");

    const { exitCode } = await runMain(["delete", "--id", note.id]);

    expect(exitCode).toBe(0);
  });

  it("deleted note is gone when read back", async () => {
    const note = await seedNote("Gone Note", "Will be deleted");

    await runMain(["delete", "--id", note.id]);

    const { stderr, exitCode } = await runMain(["read", "--id", note.id]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("Note not found");
  });

  it("missing --id yields non-zero exit and validation message", async () => {
    const { stderr, exitCode } = await runMain(["delete"]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("--id is required");
  });

  it("unknown id yields 'Note not found' and non-zero exit", async () => {
    const { stderr, exitCode } = await runMain(["delete", "--id", "nonexistent-id"]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("Note not found");
  });

  it("does not print a stack trace on unknown id", async () => {
    const { stderr } = await runMain(["delete", "--id", "nonexistent-id"]);

    expect(stderr).not.toContain("    at ");
  });
});
