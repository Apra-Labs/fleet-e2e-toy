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
