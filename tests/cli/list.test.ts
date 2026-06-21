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

describe("list command end-to-end", () => {
  it("prints all notes when store has notes", async () => {
    await request(app).post("/api/notes").send({ title: "Alpha", content: "Content A", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Beta", content: "Content B", tags: ["personal"] });

    const { stdout, exitCode } = await runMain(["list"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Alpha");
    expect(stdout).toContain("Beta");
  });

  it("prints 'No notes found' when store is empty", async () => {
    const { stdout, exitCode } = await runMain(["list"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("No notes found");
  });

  it("--tag filters notes by tag", async () => {
    await request(app).post("/api/notes").send({ title: "Work Note", content: "Body", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Personal Note", content: "Body", tags: ["personal"] });

    // listNotes with tag filter: list command fetches all then filters client-side by tag
    // But the mock only supports `q` search param; we need to handle tag filtering in the mock
    // The list command does client-side tag filtering, so listNotes is called without tag param
    const { stdout, exitCode } = await runMain(["list", "--tag", "work"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Work Note");
    expect(stdout).not.toContain("Personal Note");
  });

  it("--tag returns 'No notes found' if no matching tag", async () => {
    await request(app).post("/api/notes").send({ title: "Work Note", content: "Body", tags: ["work"] });

    const { stdout, exitCode } = await runMain(["list", "--tag", "nonexistent"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("No notes found");
  });

  it("--q searches notes by title/content", async () => {
    await request(app).post("/api/notes").send({ title: "Meeting notes", content: "Discuss project", tags: [] });
    await request(app).post("/api/notes").send({ title: "Shopping list", content: "Milk, eggs", tags: [] });

    const { stdout, exitCode } = await runMain(["list", "--q", "meeting"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Meeting notes");
    expect(stdout).not.toContain("Shopping list");
  });

  it("API error path yields non-zero exit and writes to stderr", async () => {
    mockApiClient.listNotes.mockRejectedValue(new CliError("Service unavailable", 503));

    const { stderr, exitCode } = await runMain(["list"]);

    expect(exitCode).toBe(1);
    expect(stderr).toBeTruthy();
    expect(stderr).toContain("Service unavailable");
  });
});
