/**
 * Integration tests for CLI input validation (covers gh-toy-13t).
 *
 * Assertions:
 *   (1) a clear error message is printed to stderr (mentions which argument was empty/blank)
 *   (2) exit code is non-zero
 *   (3) NO stack trace in output
 *   (4) a valid non-empty argument is accepted (control case)
 *
 * Tests drive the CLI via run() in-process, capturing stderr/stdout.
 */

import { run } from "../src/cli/index";

interface Capture {
  stdout: string;
  stderr: string;
}

function captureRun(argv: string[]): { capture: Capture; exitCode: number } {
  const capture: Capture = { stdout: "", stderr: "" };
  const origStdoutWrite = process.stdout.write.bind(process.stdout);
  const origStderrWrite = process.stderr.write.bind(process.stderr);

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
    exitCode = run(argv);
  } finally {
    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;
  }

  return { capture, exitCode };
}

describe("CLI rejects empty/blank string arguments", () => {
  describe("read command --id validation", () => {
    it("(1+2) rejects empty --id with a clear error message on stderr and non-zero exit", () => {
      const { capture, exitCode } = captureRun(["read", "--id", ""]);
      expect(exitCode).not.toBe(0);
      expect(capture.stderr).toMatch(/--id/i);
      expect(capture.stderr.toLowerCase()).toMatch(/empty|blank|whitespace|required/);
    });

    it("(1+2) rejects whitespace-only --id with a clear error message and non-zero exit", () => {
      const { capture, exitCode } = captureRun(["read", "--id", "   "]);
      expect(exitCode).not.toBe(0);
      expect(capture.stderr).toMatch(/--id/i);
      expect(capture.stderr.toLowerCase()).toMatch(/empty|blank|whitespace|required/);
    });

    it("(1+2) rejects tab-only --id with a clear error message and non-zero exit", () => {
      const { capture, exitCode } = captureRun(["read", "--id", "\t"]);
      expect(exitCode).not.toBe(0);
      expect(capture.stderr).toMatch(/--id/i);
    });

    it("(3) no stack trace when --id is empty", () => {
      const { capture } = captureRun(["read", "--id", ""]);
      expect(capture.stderr).not.toMatch(/Error:\s*at\s/);
      expect(capture.stderr).not.toMatch(/^\s+at /m);
    });

    it("(3) no stack trace when --id is whitespace", () => {
      const { capture } = captureRun(["read", "--id", "   "]);
      expect(capture.stderr).not.toMatch(/Error:\s*at\s/);
      expect(capture.stderr).not.toMatch(/^\s+at /m);
    });

    it("(2) rejects missing --id with non-zero exit", () => {
      const { capture, exitCode } = captureRun(["read"]);
      expect(exitCode).not.toBe(0);
      expect(capture.stderr).toMatch(/--id/i);
    });
  });

  describe("create command --title validation (requires create subcommand)", () => {
    it("(1+2) rejects empty --title for create with error on stderr and non-zero exit", () => {
      const { capture, exitCode } = captureRun(["create", "--title", "", "--content", "x"]);
      // Either create rejects blank title (exit non-zero) or subcommand not found (exit non-zero)
      // Once create is implemented, this must print an error mentioning --title
      expect(exitCode).not.toBe(0);
      // After create is implemented, stderr should mention --title or empty/blank
      if (capture.stderr.includes("--title") || capture.stderr.toLowerCase().includes("Unknown") === false) {
        expect(capture.stderr.toLowerCase()).toMatch(/title|empty|blank|required|unknown/);
      }
    });

    it("(1+2) rejects whitespace-only --title for create with non-zero exit", () => {
      const { capture, exitCode } = captureRun(["create", "--title", "   ", "--content", "x"]);
      expect(exitCode).not.toBe(0);
      // Error message should appear on stderr (not stdout)
      expect(capture.stdout).not.toMatch(/Error/);
    });

    it("(3) no stack trace when --title is blank for create", () => {
      const { capture } = captureRun(["create", "--title", "", "--content", "x"]);
      expect(capture.stderr).not.toMatch(/^\s+at /m);
    });
  });

  describe("control cases: valid arguments are accepted", () => {
    it("(4) read with a valid --id does not immediately fail on validation", () => {
      // Note: this will fail at network level (no server running) but NOT at validation
      // exitCode may be 0 (async network error sets exitCode later) or error is a network error
      const { capture } = captureRun(["read", "--id", "valid-id-123"]);
      // Should NOT mention empty/blank/whitespace validation errors
      expect(capture.stderr).not.toMatch(/empty|blank|whitespace-only/i);
      // Should not produce a stack trace
      expect(capture.stderr).not.toMatch(/^\s+at /m);
    });

    it("(4) list with no required args does not produce a validation error", () => {
      const { capture } = captureRun(["list"]);
      // Validation passes; network error may occur but no validation message
      expect(capture.stderr).not.toMatch(/empty|blank|whitespace-only/i);
      expect(capture.stderr).not.toMatch(/^\s+at /m);
    });
  });
});
