/**
 * Integration tests for CLI CRUD subcommands end-to-end (BD: gh-toy-5ek).
 *
 * Starts the Express app on an ephemeral port, points the CLI apiClient at it
 * via API_URL env var, then exercises create → list → filter → read → update →
 * delete in sequence. Also asserts that missing --id exits non-zero with a
 * clear error message.
 *
 * Because apiClient.ts computes BASE_URL at module load time from API_URL, we
 * use jest.isolateModules() to load CLI commands after the env var is set.
 */

import * as http from "http";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { parseArgs, ParsedArgs } from "../src/cli/args";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CommandFn = (args: ParsedArgs) => number;

interface Capture {
  stdout: string;
  stderr: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Capture stdout/stderr while invoking a command, then flush async continuations.
 * stdout/stderr interception is maintained until the async chain resolves so
 * that output written inside .then()/.catch() callbacks is also captured.
 */
async function runCommand(fn: CommandFn, argv: string[]): Promise<{ exitCode: number; capture: Capture }> {
  const capture: Capture = { stdout: "", stderr: "" };
  const origStdout = process.stdout.write.bind(process.stdout);
  const origStderr = process.stderr.write.bind(process.stderr);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process.stdout as any).write = (chunk: string | Uint8Array): boolean => {
    capture.stdout += chunk.toString();
    return true;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process.stderr as any).write = (chunk: string | Uint8Array): boolean => {
    capture.stderr += chunk.toString();
    return true;
  };

  process.exitCode = 0;
  const syncExitCode = fn(parseArgs(argv));

  // Wait for real I/O (Node http client) + promise chains to settle.
  // Use a generous timeout so the HTTP round-trip completes before we restore.
  await new Promise<void>((resolve) => setTimeout(resolve, 200));

  process.stdout.write = origStdout;
  process.stderr.write = origStderr;

  // Some commands set process.exitCode in their async error handler
  process.exitCode = 0;
  return { exitCode: syncExitCode, capture };
}

/** Synchronous variant: no async flushing (for sync error cases). */
function runSync(fn: CommandFn, argv: string[]): { exitCode: number; capture: Capture } {
  const capture: Capture = { stdout: "", stderr: "" };
  const origStdout = process.stdout.write.bind(process.stdout);
  const origStderr = process.stderr.write.bind(process.stderr);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process.stdout as any).write = (chunk: string | Uint8Array): boolean => {
    capture.stdout += chunk.toString();
    return true;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process.stderr as any).write = (chunk: string | Uint8Array): boolean => {
    capture.stderr += chunk.toString();
    return true;
  };

  let exitCode: number;
  try {
    exitCode = fn(parseArgs(argv));
  } finally {
    process.stdout.write = origStdout;
    process.stderr.write = origStderr;
  }

  return { exitCode, capture };
}

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

let server: http.Server;

// Loaded lazily (after API_URL is set) so that apiClient picks up the URL.
let createCommand: CommandFn;
let listCommand: CommandFn;
let readCommand: CommandFn;
let updateCommand: CommandFn;
let deleteCommand: CommandFn;

beforeAll((done) => {
  noteStore.clear();
  server = http.createServer(app);
  server.listen(0, "127.0.0.1", () => {
    const addr = server.address() as { port: number };
    process.env.API_URL = `http://127.0.0.1:${addr.port}`;

    // Load CLI command modules AFTER setting API_URL so BASE_URL is correct.
    // jest.isolateModules with require() is the only supported synchronous way
    // to reload modules with a fresh module registry inside a callback.
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      createCommand = require("../src/cli/commands/create").createCommand;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      listCommand = require("../src/cli/commands/list").listCommand;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      readCommand = require("../src/cli/commands/read").readCommand;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      updateCommand = require("../src/cli/commands/update").updateCommand;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      deleteCommand = require("../src/cli/commands/delete").deleteCommand;
    });

    done();
  });
});

afterAll((done) => {
  delete process.env.API_URL;
  server.close(done);
});

// ---------------------------------------------------------------------------
// Error cases: missing --id exits non-zero synchronously
// ---------------------------------------------------------------------------

describe("CLI error cases: missing --id", () => {
  beforeEach(() => {
    noteStore.clear();
    process.exitCode = 0;
  });

  it("read without --id exits non-zero with a clear error on stderr", () => {
    const { exitCode, capture } = runSync(readCommand, ["read"]);
    expect(exitCode).not.toBe(0);
    expect(capture.stderr).toMatch(/--id/i);
    expect(capture.stderr).not.toMatch(/^\s+at /m);
  });

  it("update without --id exits non-zero with a clear error on stderr", () => {
    const { exitCode, capture } = runSync(updateCommand, ["update", "--title", "x"]);
    expect(exitCode).not.toBe(0);
    expect(capture.stderr).toMatch(/--id/i);
    expect(capture.stderr).not.toMatch(/^\s+at /m);
  });

  it("delete without --id exits non-zero with a clear error on stderr", () => {
    const { exitCode, capture } = runSync(deleteCommand, ["delete"]);
    expect(exitCode).not.toBe(0);
    expect(capture.stderr).toMatch(/--id/i);
    expect(capture.stderr).not.toMatch(/^\s+at /m);
  });
});

// ---------------------------------------------------------------------------
// Full CRUD cycle end-to-end
// ---------------------------------------------------------------------------

describe("CLI CRUD end-to-end", () => {
  let createdNoteId: string;

  // Clear the store once before the entire CRUD cycle so notes persist
  // across sequential steps; only reset exitCode between each step.
  beforeAll(() => {
    noteStore.clear();
  });

  beforeEach(() => {
    process.exitCode = 0;
  });

  it("create: prints the new note and exits 0", async () => {
    const { exitCode, capture } = await runCommand(createCommand, [
      "create",
      "--title", "My Test Note",
      "--content", "Hello world",
      "--tags", "work,testing",
    ]);

    expect(exitCode).toBe(0);
    expect(capture.stderr).toBe("");
    expect(capture.stdout).toMatch(/My Test Note/);

    // Extract the created note's ID from the human-readable output
    const match = capture.stdout.match(/ID:\s+(\S+)/);
    expect(match).not.toBeNull();
    createdNoteId = match![1];
    expect(createdNoteId).toBeTruthy();
  });

  it("list: the created note appears in the listing", async () => {
    const { exitCode, capture } = await runCommand(listCommand, ["list"]);
    expect(exitCode).toBe(0);
    expect(capture.stdout).toMatch(/My Test Note/);
    expect(capture.stderr).toBe("");
  });

  it("list --tag filter: matching tag shows the note", async () => {
    const { exitCode, capture } = await runCommand(listCommand, [
      "list", "--tag", "work",
    ]);
    expect(exitCode).toBe(0);
    expect(capture.stdout).toMatch(/My Test Note/);
  });

  it("list --tag filter: non-matching tag returns no results", async () => {
    const { exitCode, capture } = await runCommand(listCommand, [
      "list", "--tag", "nonexistent-tag-xyz",
    ]);
    expect(exitCode).toBe(0);
    expect(capture.stdout).toMatch(/No notes found/i);
  });

  it("list --q filter: matching query shows the note", async () => {
    const { exitCode, capture } = await runCommand(listCommand, [
      "list", "--q", "Hello",
    ]);
    expect(exitCode).toBe(0);
    expect(capture.stdout).toMatch(/My Test Note/);
  });

  it("list --q filter: non-matching query returns no results", async () => {
    const { exitCode, capture } = await runCommand(listCommand, [
      "list", "--q", "zzznomatchzzz",
    ]);
    expect(exitCode).toBe(0);
    expect(capture.stdout).toMatch(/No notes found/i);
  });

  it("read --id: returns the correct note", async () => {
    const { exitCode, capture } = await runCommand(readCommand, [
      "read", "--id", createdNoteId,
    ]);
    expect(exitCode).toBe(0);
    expect(capture.stdout).toMatch(/My Test Note/);
    expect(capture.stdout).toMatch(/Hello world/);
    expect(capture.stderr).toBe("");
  });

  it("update --id --title: change is reflected in output", async () => {
    const { exitCode, capture } = await runCommand(updateCommand, [
      "update", "--id", createdNoteId, "--title", "Updated Title",
    ]);
    expect(exitCode).toBe(0);
    expect(capture.stdout).toMatch(/Updated Title/);
    expect(capture.stderr).toBe("");
  });

  it("read after update: new title is returned", async () => {
    const { exitCode, capture } = await runCommand(readCommand, [
      "read", "--id", createdNoteId,
    ]);
    expect(exitCode).toBe(0);
    expect(capture.stdout).toMatch(/Updated Title/);
  });

  it("delete --id: exits 0 and prints confirmation", async () => {
    const { exitCode, capture } = await runCommand(deleteCommand, [
      "delete", "--id", createdNoteId,
    ]);
    expect(exitCode).toBe(0);
    expect(capture.stdout).toMatch(/Deleted/i);
    expect(capture.stderr).toBe("");
  });

  it("read after delete: error is reported (process.exitCode non-zero or stderr has content)", async () => {
    const { capture } = await runCommand(readCommand, ["read", "--id", createdNoteId]);
    // After delete, the 404 error handler sets process.exitCode = 1 and writes to stderr
    const exitAfterAsync = (process.exitCode as number | undefined) ?? 0;
    process.exitCode = 0;
    const hasError = exitAfterAsync !== 0 || capture.stderr.length > 0;
    expect(hasError).toBe(true);
    expect(capture.stderr).not.toMatch(/^\s+at /m); // no stack trace
  });
});
