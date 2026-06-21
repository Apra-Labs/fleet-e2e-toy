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
  mockApiClient.createNote.mockImplementation(async (input) => {
    const res = await request(app).post("/api/notes").send(input);
    if (res.status >= 200 && res.status < 300) return res.body as Note;
    const msg = (res.body as Record<string, unknown>)?.error ?? `Request failed with status ${res.status}`;
    throw new CliError(String(msg), res.status);
  });

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

describe("create command end-to-end", () => {
  it("creates a note with --title and --content and returns a note with id", async () => {
    const { stdout, exitCode } = await runMain([
      "create",
      "--title", "My Note",
      "--content", "Note content",
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("My Note");
    expect(stdout).toContain("Note content");
    // Output should include an id field
    expect(stdout).toMatch(/ID:/);
  });

  it("created note persists and can be found via list", async () => {
    const { exitCode: createExit } = await runMain([
      "create",
      "--title", "Persistent Note",
      "--content", "Persist this",
    ]);
    expect(createExit).toBe(0);

    const { stdout: listOut, exitCode: listExit } = await runMain(["list"]);
    expect(listExit).toBe(0);
    expect(listOut).toContain("Persistent Note");
  });

  it("created note persists and can be found via read", async () => {
    // Capture the created note's id from stdout
    const { stdout: createOut, exitCode: createExit } = await runMain([
      "create",
      "--title", "Readable Note",
      "--content", "Can be read",
    ]);
    expect(createExit).toBe(0);

    // Extract id from "ID:      <id>" line
    const idMatch = createOut.match(/ID:\s+(\S+)/);
    expect(idMatch).toBeTruthy();
    const id = idMatch![1];

    const { stdout: readOut, exitCode: readExit } = await runMain(["read", "--id", id]);
    expect(readExit).toBe(0);
    expect(readOut).toContain("Readable Note");
  });

  it("missing --title yields non-zero exit and validation message", async () => {
    const { stderr, exitCode } = await runMain(["create", "--content", "Some content"]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("--title is required");
  });

  it("missing --content yields non-zero exit and validation message", async () => {
    const { stderr, exitCode } = await runMain(["create", "--title", "A Title"]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("--content is required");
  });

  it("--tag with comma-separated values populates tags array", async () => {
    // The CLI parser (parse.ts) uses Record<string, string|boolean> so repeated flags
    // overwrite each other; comma-separated tags within a single --tag value is supported.
    const { stdout, exitCode } = await runMain([
      "create",
      "--title", "Tagged Note",
      "--content", "Has tags",
      "--tag", "work,important",
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("work");
    expect(stdout).toContain("important");
  });
});
