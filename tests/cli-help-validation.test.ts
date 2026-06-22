/**
 * Integration tests for the CLI help system and input-validation behaviour.
 *
 * All tests call main(argv) in-process and capture stdout/stderr via spies.
 * No running server is required.
 */
import { main } from "../src/cli/index";

describe("CLI help system", () => {
  it("main(['--help']) returns 0 and lists all subcommands and global flags", async () => {
    const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
    try {
      const code = await main(["--help"]);
      expect(code).toBe(0);
      const output = stdoutSpy.mock.calls.map((c) => c[0]).join("");
      // All subcommands listed
      expect(output).toContain("list");
      expect(output).toContain("read");
      expect(output).toContain("create");
      expect(output).toContain("update");
      expect(output).toContain("delete");
      // Global flags listed
      expect(output).toContain("--version");
      expect(output).toContain("--help");
    } finally {
      stdoutSpy.mockRestore();
    }
  });

  it("main(['-h']) returns 0 and lists all subcommands", async () => {
    const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
    try {
      const code = await main(["-h"]);
      expect(code).toBe(0);
      const output = stdoutSpy.mock.calls.map((c) => c[0]).join("");
      expect(output).toContain("list");
      expect(output).toContain("read");
      expect(output).toContain("create");
      expect(output).toContain("update");
      expect(output).toContain("delete");
    } finally {
      stdoutSpy.mockRestore();
    }
  });

  it("main(['create', '--help']) returns 0 and mentions create's flags", async () => {
    const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
    try {
      const code = await main(["create", "--help"]);
      expect(code).toBe(0);
      const output = stdoutSpy.mock.calls.map((c) => c[0]).join("");
      expect(output).toContain("--title");
      expect(output).toContain("--content");
    } finally {
      stdoutSpy.mockRestore();
    }
  });

  it("main(['update', '--help']) returns 0 and mentions update's flags", async () => {
    const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
    try {
      const code = await main(["update", "--help"]);
      expect(code).toBe(0);
      const output = stdoutSpy.mock.calls.map((c) => c[0]).join("");
      expect(output).toContain("--id");
    } finally {
      stdoutSpy.mockRestore();
    }
  });

  it("main(['delete', '--help']) returns 0 and mentions delete's flags", async () => {
    const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
    try {
      const code = await main(["delete", "--help"]);
      expect(code).toBe(0);
      const output = stdoutSpy.mock.calls.map((c) => c[0]).join("");
      expect(output).toContain("--id");
    } finally {
      stdoutSpy.mockRestore();
    }
  });
});

describe("CLI input validation", () => {
  it("main(['create','--title','   ','--content','x']) returns non-zero with { error } in stderr", async () => {
    const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation();
    try {
      const code = await main(["create", "--title", "   ", "--content", "x"]);
      expect(code).not.toBe(0);
      const errOutput = stderrSpy.mock.calls.map((c) => c[0]).join("");
      // Must have { error: "..." } shape
      const parsed = JSON.parse(errOutput.trim());
      expect(parsed).toHaveProperty("error");
      expect(typeof parsed.error).toBe("string");
      expect(parsed.error.length).toBeGreaterThan(0);
    } finally {
      stderrSpy.mockRestore();
    }
  });

  it("main(['create','--title','','--content','x']) returns non-zero with { error } in stderr", async () => {
    const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation();
    try {
      const code = await main(["create", "--title", "", "--content", "x"]);
      expect(code).not.toBe(0);
      const errOutput = stderrSpy.mock.calls.map((c) => c[0]).join("");
      const parsed = JSON.parse(errOutput.trim());
      expect(parsed).toHaveProperty("error");
    } finally {
      stderrSpy.mockRestore();
    }
  });

  it("error output contains no stack trace for blank title", async () => {
    const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation();
    try {
      await main(["create", "--title", "   ", "--content", "x"]);
      const errOutput = stderrSpy.mock.calls.map((c) => c[0]).join("");
      // Stack traces contain lines like "at SomeFunction (/path/file.ts:10:5)"
      expect(errOutput).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    } finally {
      stderrSpy.mockRestore();
    }
  });

  it("main(['create','--content','x']) without --title returns non-zero with { error }", async () => {
    const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation();
    try {
      const code = await main(["create", "--content", "x"]);
      expect(code).not.toBe(0);
      const errOutput = stderrSpy.mock.calls.map((c) => c[0]).join("");
      const parsed = JSON.parse(errOutput.trim());
      expect(parsed).toHaveProperty("error");
    } finally {
      stderrSpy.mockRestore();
    }
  });
});
