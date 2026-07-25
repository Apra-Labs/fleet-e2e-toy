import { run } from "../../src/cli/index";
import { noteStore } from "../../src/models/note";

function captureStdout(): { output: string[]; restore: () => void } {
  const output: string[] = [];
  const orig = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string) => {
    output.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  return {
    output,
    restore: () => {
      process.stdout.write = orig;
    },
  };
}

function captureOutput(): { stdout: string[]; stderr: string[]; restore: () => void } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const origOut = process.stdout.write.bind(process.stdout);
  const origErr = process.stderr.write.bind(process.stderr);
  process.stdout.write = ((chunk: string) => {
    stdout.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string) => {
    stderr.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  return {
    stdout,
    stderr,
    restore: () => {
      process.stdout.write = origOut;
      process.stderr.write = origErr;
    },
  };
}

beforeEach(() => {
  noteStore.clear();
});

describe("global help", () => {
  it("--help prints global usage, lists all subcommands and --version, exits 0", async () => {
    const cap = captureStdout();
    const code = await run(["--help"]);
    cap.restore();
    expect(code).toBe(0);
    const out = cap.output.join("");
    for (const cmd of ["list", "read", "create", "update", "delete"]) {
      expect(out).toContain(cmd);
    }
    expect(out).toContain("--version");
  });

  it("-h behaves identically", async () => {
    const cap = captureStdout();
    const code = await run(["-h"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.output.join("")).toContain("Usage: noteapi <command>");
  });
});

describe("per-subcommand help", () => {
  it("'create --help' prints create-specific usage and exits 0 without creating a note", async () => {
    const cap = captureStdout();
    const code = await run(["create", "--help"]);
    cap.restore();
    expect(code).toBe(0);
    const out = cap.output.join("");
    expect(out).toContain("Usage: noteapi create");
    expect(out).toContain("--title");
    expect(out).toContain("--content");
    expect(noteStore.getAll()).toHaveLength(0);
  });

  it("'read --help' prints read-specific usage", async () => {
    const cap = captureStdout();
    const code = await run(["read", "--help"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.output.join("")).toContain("Usage: noteapi read");
  });

  it("'update --help' prints update-specific usage", async () => {
    const cap = captureStdout();
    const code = await run(["update", "--help"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.output.join("")).toContain("Usage: noteapi update");
  });

  it("'delete --help' prints delete-specific usage", async () => {
    const cap = captureStdout();
    const code = await run(["delete", "--help"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.output.join("")).toContain("Usage: noteapi delete");
  });

  it("'list --help' prints list-specific usage", async () => {
    const cap = captureStdout();
    const code = await run(["list", "--help"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.output.join("")).toContain("Usage: noteapi list");
  });
});

describe("input validation via the CLI", () => {
  it("'create --title \"   \"' -> clear error, non-zero exit, no stack trace, no note created", async () => {
    const cap = captureOutput();
    const code = await run(["create", "--title", "   ", "--content", "Body"]);
    cap.restore();
    expect(code).not.toBe(0);
    expect(cap.stderr.join("")).toMatch(/--title is required/);
    expect(cap.stderr.join("")).not.toMatch(/at /);
    expect(noteStore.getAll()).toHaveLength(0);
  });

  it("'create --title \"\"' (empty string) -> clear error, non-zero exit, no stack trace", async () => {
    const cap = captureOutput();
    const code = await run(["create", "--title", "", "--content", "Body"]);
    cap.restore();
    expect(code).not.toBe(0);
    expect(cap.stderr.join("")).toMatch(/--title is required/);
    expect(cap.stderr.join("")).not.toMatch(/at /);
  });

  it("'read --id \"   \"' (whitespace-only) -> clear error, non-zero exit, no stack trace", async () => {
    const cap = captureOutput();
    const code = await run(["read", "--id", "   "]);
    cap.restore();
    expect(code).not.toBe(0);
    expect(cap.stderr.join("")).toMatch(/--id is required/);
    expect(cap.stderr.join("")).not.toMatch(/at /);
  });
});
