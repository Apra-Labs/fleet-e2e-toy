/**
 * Integration tests for CLI CRUD subcommands end-to-end.
 *
 * Strategy: start the Express app on a random port, point API_URL at it,
 * then invoke run() from src/cli/index capturing stdout/stderr and the
 * returned exit code. No mocking of the HTTP client.
 */
import * as http from "http";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { run } from "../src/cli/index";

let server: http.Server;
let baseUrl: string;

// Buffers for capturing process output
let stdoutCapture: string;
let stderrCapture: string;
let originalStdoutWrite: typeof process.stdout.write;
let originalStderrWrite: typeof process.stderr.write;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(0, "127.0.0.1", () => {
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    baseUrl = `http://127.0.0.1:${port}`;
    process.env.API_URL = baseUrl;
    done();
  });
});

afterAll((done) => {
  delete process.env.API_URL;
  server.close(done);
});

beforeEach(() => {
  noteStore.clear();
  stdoutCapture = "";
  stderrCapture = "";

  // Capture stdout
  originalStdoutWrite = process.stdout.write.bind(process.stdout);
  (process.stdout.write as unknown) = (chunk: string | Uint8Array): boolean => {
    stdoutCapture += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  };

  // Capture stderr
  originalStderrWrite = process.stderr.write.bind(process.stderr);
  (process.stderr.write as unknown) = (chunk: string | Uint8Array): boolean => {
    stderrCapture += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  };
});

afterEach(() => {
  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;
});

// Helper to run CLI and return { exitCode, stdout, stderr }
async function cli(argv: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const exitCode = await run(argv);
  return { exitCode, stdout: stdoutCapture, stderr: stderrCapture };
}

// ─── create ─────────────────────────────────────────────────────────────────

describe("create", () => {
  it("returns exit 0 and prints an id", async () => {
    const result = await cli(["create", "--title", "Hello", "--content", "World"]);
    expect(result.exitCode).toBe(0);
    // The id should be a non-empty string on its own line
    expect(result.stdout.trim()).toMatch(/\S+/);
    expect(result.stderr).toBe("");
  });

  it("returns exit non-zero when --title is missing", async () => {
    const result = await cli(["create", "--content", "no title"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("error");
  });

  it("returns exit non-zero when --content is missing", async () => {
    const result = await cli(["create", "--title", "no content"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("error");
  });
});

// ─── list ────────────────────────────────────────────────────────────────────

describe("list", () => {
  it("prints the created note", async () => {
    // Create a note first (capture and discard output)
    const createResult = await cli(["create", "--title", "My Note", "--content", "Body"]);
    expect(createResult.exitCode).toBe(0);
    const noteId = createResult.stdout.trim();

    // Reset capture buffers between CLI calls
    stdoutCapture = "";
    stderrCapture = "";

    const listResult = await cli(["list"]);
    expect(listResult.exitCode).toBe(0);
    expect(listResult.stdout).toContain("My Note");
    expect(listResult.stdout).toContain(noteId);
  });

  it("filters correctly with --tag", async () => {
    await cli(["create", "--title", "Tagged Note", "--content", "Body", "--tag", "work"]);
    stdoutCapture = "";
    stderrCapture = "";
    await cli(["create", "--title", "Untagged Note", "--content", "Body"]);
    stdoutCapture = "";
    stderrCapture = "";

    const result = await cli(["list", "--tag", "work"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Tagged Note");
    expect(result.stdout).not.toContain("Untagged Note");
  });

  it("filters correctly with --q", async () => {
    await cli(["create", "--title", "Meeting Notes", "--content", "discuss project"]);
    stdoutCapture = "";
    stderrCapture = "";
    await cli(["create", "--title", "Shopping List", "--content", "milk eggs"]);
    stdoutCapture = "";
    stderrCapture = "";

    const result = await cli(["list", "--q", "meeting"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Meeting Notes");
    expect(result.stdout).not.toContain("Shopping List");
  });
});

// ─── read ────────────────────────────────────────────────────────────────────

describe("read", () => {
  it("prints the matching note", async () => {
    const createResult = await cli(["create", "--title", "Read Me", "--content", "Some content"]);
    const noteId = createResult.stdout.trim();
    stdoutCapture = "";
    stderrCapture = "";

    const result = await cli(["read", "--id", noteId]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Read Me");
    expect(result.stdout).toContain("Some content");
    expect(result.stdout).toContain(noteId);
  });

  it("exits non-zero and prints a wrapped error for unknown id (no stack trace)", async () => {
    const result = await cli(["read", "--id", "nonexistent-id-xyz"]);
    expect(result.exitCode).not.toBe(0);
    // Error must be a JSON-wrapped message, not a stack trace
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
    expect(typeof parsed.error).toBe("string");
    // Must not contain stack trace artifacts
    expect(result.stderr).not.toContain("at ");
  });
});

// ─── update ──────────────────────────────────────────────────────────────────

describe("update", () => {
  it("changes the note and exits 0", async () => {
    const createResult = await cli([
      "create",
      "--title",
      "Original Title",
      "--content",
      "Original Content",
    ]);
    const noteId = createResult.stdout.trim();
    stdoutCapture = "";
    stderrCapture = "";

    const result = await cli(["update", "--id", noteId, "--title", "Updated Title"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Updated Title");
    expect(result.stdout).toContain("Original Content");
  });

  it("exits non-zero for unknown id", async () => {
    const result = await cli(["update", "--id", "no-such-id", "--title", "Nope"]);
    expect(result.exitCode).not.toBe(0);
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
  });
});

// ─── delete ──────────────────────────────────────────────────────────────────

describe("delete", () => {
  it("removes the note and subsequent read fails", async () => {
    const createResult = await cli(["create", "--title", "Delete Me", "--content", "Bye"]);
    const noteId = createResult.stdout.trim();
    stdoutCapture = "";
    stderrCapture = "";

    const deleteResult = await cli(["delete", "--id", noteId]);
    expect(deleteResult.exitCode).toBe(0);

    stdoutCapture = "";
    stderrCapture = "";

    const readResult = await cli(["read", "--id", noteId]);
    expect(readResult.exitCode).not.toBe(0);
  });

  it("exits non-zero for unknown id", async () => {
    const result = await cli(["delete", "--id", "ghost-id-abc"]);
    expect(result.exitCode).not.toBe(0);
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
  });
});
