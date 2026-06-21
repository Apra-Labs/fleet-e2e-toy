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

describe("read command end-to-end", () => {
  it("reads a note by id and prints it", async () => {
    const createRes = await request(app)
      .post("/api/notes")
      .send({ title: "Test Note", content: "Some content", tags: ["tag1"] });
    const id = (createRes.body as Note).id;

    const { stdout, exitCode } = await runMain(["read", "--id", id]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Test Note");
    expect(stdout).toContain("Some content");
    expect(stdout).toContain(id);
  });

  it("missing --id yields non-zero exit and validation message", async () => {
    const { stderr, exitCode } = await runMain(["read"]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("--id is required");
  });

  it("unknown id yields 'Note not found' and non-zero exit", async () => {
    const { stderr, exitCode } = await runMain(["read", "--id", "nonexistent-id"]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("Note not found");
  });

  it("does not print a stack trace on unknown id", async () => {
    const { stderr } = await runMain(["read", "--id", "nonexistent-id"]);

    expect(stderr).not.toContain("Error:");
    expect(stderr).not.toContain("    at ");
  });
});
