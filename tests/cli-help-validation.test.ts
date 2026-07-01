/**
 * Integration tests for the CLI help system and input validation.
 *
 * Strategy: invoke run() from src/cli/index directly, capturing
 * stdout/stderr and the returned exit code. No live HTTP server is needed
 * because all tested paths either short-circuit before any API call (help,
 * unknown command) or throw a validation error before the network is hit.
 */
import { run } from "../src/cli/index";

// Buffers for capturing process output
let stdoutCapture: string;
let stderrCapture: string;
let originalStdoutWrite: typeof process.stdout.write;
let originalStderrWrite: typeof process.stderr.write;

beforeEach(() => {
  stdoutCapture = "";
  stderrCapture = "";

  originalStdoutWrite = process.stdout.write.bind(process.stdout);
  (process.stdout.write as unknown) = (chunk: string | Uint8Array): boolean => {
    stdoutCapture += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  };

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

async function cli(argv: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const exitCode = await run(argv);
  return { exitCode, stdout: stdoutCapture, stderr: stderrCapture };
}

// ─── global help ─────────────────────────────────────────────────────────────

describe("global help (--help / -h)", () => {
  const subcommands = ["list", "read", "create", "update", "delete"];

  it("'noteapi --help' prints usage with all subcommand names and exits 0", async () => {
    const result = await cli(["--help"]);
    expect(result.exitCode).toBe(0);
    for (const cmd of subcommands) {
      expect(result.stdout).toContain(cmd);
    }
    expect(result.stderr).toBe("");
  });

  it("'noteapi -h' prints usage with all subcommand names and exits 0", async () => {
    const result = await cli(["-h"]);
    expect(result.exitCode).toBe(0);
    for (const cmd of subcommands) {
      expect(result.stdout).toContain(cmd);
    }
    expect(result.stderr).toBe("");
  });
});

// ─── per-command help ────────────────────────────────────────────────────────

describe("per-command help", () => {
  it("'noteapi create --help' prints create-specific usage and exits 0", async () => {
    const result = await cli(["create", "--help"]);
    expect(result.exitCode).toBe(0);
    // Should mention create and its required flags
    expect(result.stdout.toLowerCase()).toContain("create");
    expect(result.stdout).toContain("--title");
    expect(result.stdout).toContain("--content");
    expect(result.stderr).toBe("");
  });

  it("'noteapi read --help' prints read-specific usage and exits 0", async () => {
    const result = await cli(["read", "--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toLowerCase()).toContain("read");
    expect(result.stdout).toContain("--id");
    expect(result.stderr).toBe("");
  });

  it("'noteapi update --help' prints update-specific usage and exits 0", async () => {
    const result = await cli(["update", "--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toLowerCase()).toContain("update");
    expect(result.stdout).toContain("--id");
    expect(result.stderr).toBe("");
  });

  it("'noteapi list --help' prints list-specific usage and exits 0", async () => {
    const result = await cli(["list", "--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toLowerCase()).toContain("list");
    expect(result.stderr).toBe("");
  });

  it("'noteapi delete --help' prints delete-specific usage and exits 0", async () => {
    const result = await cli(["delete", "--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toLowerCase()).toContain("delete");
    expect(result.stdout).toContain("--id");
    expect(result.stderr).toBe("");
  });
});

// ─── unknown command ──────────────────────────────────────────────────────────

describe("unknown command", () => {
  it("exits non-zero and prints a usage hint to stderr (no stack trace)", async () => {
    const result = await cli(["frobnicate"]);
    expect(result.exitCode).not.toBe(0);
    // Must print to stderr with a usage hint
    expect(result.stderr).toContain("noteapi");
    expect(result.stderr).toMatch(/help|usage|unknown|command/i);
    // Must not print a Node.js stack trace
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });

  it("exits non-zero for another unknown command", async () => {
    const result = await cli(["does-not-exist"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).not.toBe("");
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });
});

// ─── input validation ─────────────────────────────────────────────────────────

describe("input validation — empty or whitespace-only required flags", () => {
  it("create with empty --title exits non-zero with wrapped error (no stack trace)", async () => {
    const result = await cli(["create", "--title", "", "--content", "some content"]);
    expect(result.exitCode).not.toBe(0);
    // Error must be a JSON-wrapped message
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
    expect(typeof parsed.error).toBe("string");
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });

  it("create with whitespace-only --title exits non-zero with wrapped error", async () => {
    const result = await cli(["create", "--title", "   ", "--content", "some content"]);
    expect(result.exitCode).not.toBe(0);
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });

  it("create with missing --title (boolean flag) exits non-zero with wrapped error", async () => {
    const result = await cli(["create", "--content", "some content"]);
    expect(result.exitCode).not.toBe(0);
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });

  it("create with empty --content exits non-zero with wrapped error", async () => {
    const result = await cli(["create", "--title", "My Note", "--content", ""]);
    expect(result.exitCode).not.toBe(0);
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });

  it("read with empty --id exits non-zero with wrapped error (no stack trace)", async () => {
    const result = await cli(["read", "--id", ""]);
    expect(result.exitCode).not.toBe(0);
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });

  it("read with whitespace-only --id exits non-zero with wrapped error", async () => {
    const result = await cli(["read", "--id", "  "]);
    expect(result.exitCode).not.toBe(0);
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });

  it("update with empty --id exits non-zero with wrapped error (no stack trace)", async () => {
    const result = await cli(["update", "--id", "", "--title", "New Title"]);
    expect(result.exitCode).not.toBe(0);
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });

  it("update with whitespace-only --title (when provided) exits non-zero with wrapped error", async () => {
    // --id is provided and non-empty; --title is whitespace-only (explicit validation)
    const result = await cli(["update", "--id", "some-id", "--title", "   "]);
    expect(result.exitCode).not.toBe(0);
    const parsed = JSON.parse(result.stderr.trim());
    expect(parsed).toHaveProperty("error");
    expect(result.stderr).not.toMatch(/\s+at\s+\w/);
  });
});
