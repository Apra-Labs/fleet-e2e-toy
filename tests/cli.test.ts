import { spawnSync, execFile } from "child_process";
import * as path from "path";
import * as http from "http";
import app from "../src/app";
import { noteStore } from "../src/models/note";

const CLI = path.resolve(__dirname, "../dist/cli/index.js");
const NODE = process.execPath;

// Helper: run CLI synchronously (no network I/O expected)
function runCliSync(
  args: string[],
  env?: NodeJS.ProcessEnv
): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(NODE, [CLI, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    timeout: 10000,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status,
  };
}

// Helper: run CLI asynchronously (for subcommands that make HTTP requests)
function runCli(
  args: string[],
  env?: NodeJS.ProcessEnv
): Promise<{ stdout: string; stderr: string; status: number }> {
  return new Promise((resolve, _reject) => {
    execFile(
      NODE,
      [CLI, ...args],
      {
        encoding: "utf8",
        env: { ...process.env, ...env },
        timeout: 10000,
      },
      (err, stdout, stderr) => {
        // execFile passes error if exit code != 0; extract status from it
        const exitCode =
          err && "code" in err && typeof (err as { code: unknown }).code === "number"
            ? (err as { code: number }).code
            : err
            ? 1
            : 0;
        resolve({ stdout: stdout ?? "", stderr: stderr ?? "", status: exitCode });
      }
    );
  });
}

// (a) --version
describe("--version / -V", () => {
  it("prints fleet-e2e-toy v1.0.0 and exits 0", () => {
    const res = runCliSync(["--version"]);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("fleet-e2e-toy v1.0.0");
  });

  it("-V prints version and exits 0", () => {
    const res = runCliSync(["-V"]);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("fleet-e2e-toy v1.0.0");
  });
});

// (b) --help and -h
describe("--help / -h", () => {
  it("--help exits 0 and includes Usage", () => {
    const res = runCliSync(["--help"]);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage");
  });

  it("-h exits 0 and includes Usage", () => {
    const res = runCliSync(["-h"]);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage");
  });
});

// (c) missing required --id on read/update/delete
describe("missing required --id", () => {
  it("read without --id exits non-zero with error message on stderr, no stack frames", () => {
    const res = runCliSync(["read"]);
    expect(res.status).not.toBe(0);
    // yargs emits "Missing required argument: id" to stderr via .fail()
    expect(res.stderr).toMatch(/id/i);
    // No stack frames
    expect(res.stderr).not.toMatch(/ at /);
    expect(res.stdout).not.toMatch(/ at /);
  });

  it("update without --id exits non-zero with error message on stderr, no stack frames", () => {
    const res = runCliSync(["update", "--title", "foo"]);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/id/i);
    expect(res.stderr).not.toMatch(/ at /);
    expect(res.stdout).not.toMatch(/ at /);
  });

  it("delete without --id exits non-zero with error message on stderr, no stack frames", () => {
    const res = runCliSync(["delete"]);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/id/i);
    expect(res.stderr).not.toMatch(/ at /);
    expect(res.stdout).not.toMatch(/ at /);
  });
});

// (d) empty/whitespace --title on create
describe("empty/whitespace --title on create", () => {
  it("exits 2 with clean error message for whitespace-only title", () => {
    const res = runCliSync(["create", "--title", "   ", "--content", "some content"]);
    expect(res.status).toBe(2);
    expect(res.stderr).toMatch(/error:/i);
    // Should be a clean message, not a stack trace
    expect(res.stderr).not.toMatch(/ at /);
  });

  it("exits 2 with clean error message for empty title", () => {
    const res = runCliSync(["create", "--title", "", "--content", "some content"]);
    expect(res.status).toBe(2);
    expect(res.stderr).toMatch(/error:/i);
    expect(res.stderr).not.toMatch(/ at /);
  });
});

// (e) happy-path subcommands against the real Express app
describe("CLI happy path (list, create, read, delete)", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(() => {
    return new Promise<void>((resolve) => {
      // Clear the in-memory store so tests are isolated
      noteStore.clear();
      // Start the Express app on an ephemeral port
      server = http.createServer(app);
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("list returns no notes on empty store", async () => {
    const res = await runCli(["list"], { NOTEAPI_URL: baseUrl });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("No notes found.");
  });

  it("create, list, read, then delete a note", async () => {
    // Create a note
    const createRes = await runCli(
      ["create", "--title", "CLI Test Note", "--content", "This is a test"],
      { NOTEAPI_URL: baseUrl }
    );
    expect(createRes.status).toBe(0);
    expect(createRes.stdout).toContain("created");
    expect(createRes.stdout).toContain("CLI Test Note");

    // Extract note ID from "created <id>: <title>"
    const idMatch = createRes.stdout.match(/created\s+(\S+):/);
    expect(idMatch).not.toBeNull();
    const noteId = idMatch![1];

    // List should now include the note
    const listRes = await runCli(["list"], { NOTEAPI_URL: baseUrl });
    expect(listRes.status).toBe(0);
    expect(listRes.stdout).toContain(noteId);
    expect(listRes.stdout).toContain("CLI Test Note");

    // Read the note
    const readRes = await runCli(["read", "--id", noteId], { NOTEAPI_URL: baseUrl });
    expect(readRes.status).toBe(0);
    expect(readRes.stdout).toContain("CLI Test Note");
    expect(readRes.stdout).toContain("This is a test");

    // Delete the note
    const deleteRes = await runCli(["delete", "--id", noteId], { NOTEAPI_URL: baseUrl });
    expect(deleteRes.status).toBe(0);
    expect(deleteRes.stdout).toContain(`deleted ${noteId}`);

    // List should be empty again
    const listAfterRes = await runCli(["list"], { NOTEAPI_URL: baseUrl });
    expect(listAfterRes.status).toBe(0);
    expect(listAfterRes.stdout).toContain("No notes found.");
  });
});
