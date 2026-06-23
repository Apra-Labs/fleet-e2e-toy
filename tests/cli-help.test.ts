/**
 * Integration tests for the CLI help system.
 *
 * Assertions:
 *   (1) 'tool --help' exits 0 and output lists all five subcommands (list, read, create, update, delete)
 *   (2) 'tool -h' behaves identically to --help
 *   (3) 'tool create --help' exits 0 and mentions --title and --content
 *   (4) no stack trace in any help output
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

function hasNoStackTrace(output: string): boolean {
  return !/^\s+at /m.test(output);
}

describe("CLI help output", () => {
  describe("global help via --help", () => {
    it("(1) --help exits 0", () => {
      const { exitCode } = captureRun(["--help"]);
      expect(exitCode).toBe(0);
    });

    it("(1) --help lists 'list' subcommand", () => {
      const { capture } = captureRun(["--help"]);
      expect(capture.stdout).toMatch(/\blist\b/);
    });

    it("(1) --help lists 'read' subcommand", () => {
      const { capture } = captureRun(["--help"]);
      expect(capture.stdout).toMatch(/\bread\b/);
    });

    it("(1) --help lists 'create' subcommand", () => {
      const { capture } = captureRun(["--help"]);
      expect(capture.stdout).toMatch(/\bcreate\b/);
    });

    it("(1) --help lists 'update' subcommand", () => {
      const { capture } = captureRun(["--help"]);
      expect(capture.stdout).toMatch(/\bupdate\b/);
    });

    it("(1) --help lists 'delete' subcommand", () => {
      const { capture } = captureRun(["--help"]);
      expect(capture.stdout).toMatch(/\bdelete\b/);
    });

    it("(4) --help produces no stack trace", () => {
      const { capture } = captureRun(["--help"]);
      expect(hasNoStackTrace(capture.stdout)).toBe(true);
      expect(hasNoStackTrace(capture.stderr)).toBe(true);
    });
  });

  describe("global help via -h", () => {
    it("(2) -h exits 0", () => {
      const { exitCode } = captureRun(["-h"]);
      expect(exitCode).toBe(0);
    });

    it("(2) -h output lists all five subcommands", () => {
      const { capture } = captureRun(["-h"]);
      expect(capture.stdout).toMatch(/\blist\b/);
      expect(capture.stdout).toMatch(/\bread\b/);
      expect(capture.stdout).toMatch(/\bcreate\b/);
      expect(capture.stdout).toMatch(/\bupdate\b/);
      expect(capture.stdout).toMatch(/\bdelete\b/);
    });

    it("(2) -h output matches --help output", () => {
      const { capture: helpCapture } = captureRun(["--help"]);
      const { capture: hCapture } = captureRun(["-h"]);
      expect(hCapture.stdout).toBe(helpCapture.stdout);
    });

    it("(4) -h produces no stack trace", () => {
      const { capture } = captureRun(["-h"]);
      expect(hasNoStackTrace(capture.stdout)).toBe(true);
      expect(hasNoStackTrace(capture.stderr)).toBe(true);
    });
  });

  describe("per-subcommand help via create --help", () => {
    it("(3) create --help exits 0", () => {
      const { exitCode } = captureRun(["create", "--help"]);
      expect(exitCode).toBe(0);
    });

    it("(3) create --help mentions --title", () => {
      const { capture } = captureRun(["create", "--help"]);
      expect(capture.stdout).toMatch(/--title/);
    });

    it("(3) create --help mentions --content", () => {
      const { capture } = captureRun(["create", "--help"]);
      expect(capture.stdout).toMatch(/--content/);
    });

    it("(4) create --help produces no stack trace", () => {
      const { capture } = captureRun(["create", "--help"]);
      expect(hasNoStackTrace(capture.stdout)).toBe(true);
      expect(hasNoStackTrace(capture.stderr)).toBe(true);
    });
  });

  describe("per-subcommand help for other commands", () => {
    it("list --help exits 0 and mentions --tag", () => {
      const { capture, exitCode } = captureRun(["list", "--help"]);
      expect(exitCode).toBe(0);
      expect(capture.stdout).toMatch(/--tag/);
    });

    it("read --help exits 0 and mentions --id", () => {
      const { capture, exitCode } = captureRun(["read", "--help"]);
      expect(exitCode).toBe(0);
      expect(capture.stdout).toMatch(/--id/);
    });

    it("update --help exits 0 and mentions --id and --title", () => {
      const { capture, exitCode } = captureRun(["update", "--help"]);
      expect(exitCode).toBe(0);
      expect(capture.stdout).toMatch(/--id/);
      expect(capture.stdout).toMatch(/--title/);
    });

    it("delete --help exits 0 and mentions --id", () => {
      const { capture, exitCode } = captureRun(["delete", "--help"]);
      expect(exitCode).toBe(0);
      expect(capture.stdout).toMatch(/--id/);
    });
  });

  describe("no args behaves like help", () => {
    it("running with no args exits 0", () => {
      const { exitCode } = captureRun([]);
      expect(exitCode).toBe(0);
    });

    it("running with no args shows all commands", () => {
      const { capture } = captureRun([]);
      expect(capture.stdout).toMatch(/\blist\b/);
      expect(capture.stdout).toMatch(/\bcreate\b/);
    });
  });
});
