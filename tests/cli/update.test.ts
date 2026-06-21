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
  mockApiClient.updateNote.mockImplementation(async (id: string, input) => {
    const res = await request(app).put(`/api/notes/${encodeURIComponent(id)}`).send(input);
    if (res.status >= 200 && res.status < 300) return res.body as Note;
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

describe("update command end-to-end", () => {
  async function seedNote(title: string, content: string): Promise<Note> {
    const res = await request(app).post("/api/notes").send({ title, content, tags: [] });
    return res.body as Note;
  }

  it("updates the title of an existing note", async () => {
    const note = await seedNote("Original Title", "Original content");

    const { stdout, exitCode } = await runMain([
      "update",
      "--id", note.id,
      "--title", "Updated Title",
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Updated Title");
  });

  it("updated title persists when read back", async () => {
    const note = await seedNote("Old Title", "Some content");

    await runMain(["update", "--id", note.id, "--title", "New Title"]);

    const { stdout: readOut, exitCode: readExit } = await runMain(["read", "--id", note.id]);
    expect(readExit).toBe(0);
    expect(readOut).toContain("New Title");
    // Content unchanged
    expect(readOut).toContain("Some content");
  });

  it("missing --id yields non-zero exit and validation message", async () => {
    const { stderr, exitCode } = await runMain(["update", "--title", "X"]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("--id is required");
  });

  it("no fields provided yields validation error and non-zero exit", async () => {
    const note = await seedNote("A Note", "Content");

    const { stderr, exitCode } = await runMain(["update", "--id", note.id]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("--title or --content is required");
  });

  it("unknown id yields 'Note not found' and non-zero exit", async () => {
    const { stderr, exitCode } = await runMain([
      "update",
      "--id", "nonexistent-id",
      "--title", "New Title",
    ]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("Note not found");
  });

  it("does not print a stack trace on unknown id", async () => {
    const { stderr } = await runMain([
      "update",
      "--id", "nonexistent-id",
      "--title", "New Title",
    ]);

    expect(stderr).not.toContain("    at ");
  });
});
