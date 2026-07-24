import { run } from "../src/cli/index";
import { CommandIO } from "../src/cli/commands";
import { GLOBAL_USAGE, COMMAND_USAGE } from "../src/cli/help";

function makeIo(): CommandIO & { outLines: string[]; errLines: string[] } {
  const outLines: string[] = [];
  const errLines: string[] = [];
  return {
    outLines,
    errLines,
    out: (line: string) => outLines.push(line),
    err: (line: string) => errLines.push(line),
  };
}

function hasStackTrace(lines: string[]): boolean {
  return lines.some((line) => /^\s*at\s/.test(line) || line.includes(".ts:"));
}

describe("CLI global --help/-h output", () => {
  it("--help exits 0 and lists subcommands", async () => {
    const io = makeIo();
    const code = await run(["--help"], io);
    expect(code).toBe(0);
    const text = io.outLines.join("\n");
    expect(text).toContain(GLOBAL_USAGE);
    for (const name of ["list", "read", "create", "update", "delete"]) {
      expect(text).toContain(name);
    }
    expect(io.errLines).toHaveLength(0);
  });

  it("-h exits 0 and lists subcommands", async () => {
    const io = makeIo();
    const code = await run(["-h"], io);
    expect(code).toBe(0);
    const text = io.outLines.join("\n");
    expect(text).toContain(GLOBAL_USAGE);
    for (const name of ["list", "read", "create", "update", "delete"]) {
      expect(text).toContain(name);
    }
  });
});

describe("CLI per-subcommand --help/-h output", () => {
  it.each(["list", "read", "create", "update", "delete"])(
    "'%s --help' exits 0 and shows its flags",
    async (name) => {
      const io = makeIo();
      const code = await run([name, "--help"], io);
      expect(code).toBe(0);
      expect(io.outLines.join("\n")).toBe(COMMAND_USAGE[name]);
      expect(io.errLines).toHaveLength(0);
    }
  );

  it.each(["list", "read", "create", "update", "delete"])(
    "'%s -h' exits 0 and shows its flags",
    async (name) => {
      const io = makeIo();
      const code = await run([name, "-h"], io);
      expect(code).toBe(0);
      expect(io.outLines.join("\n")).toBe(COMMAND_USAGE[name]);
      expect(io.errLines).toHaveLength(0);
    }
  );
});

describe("CLI input-validation errors for empty/blank required flags", () => {
  it("create: empty --title -> non-zero exit, readable error, no stack trace", async () => {
    const io = makeIo();
    const code = await run(["create", "--title", "", "--content", "Body"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.length).toBeGreaterThan(0);
    expect(io.errLines.join("\n")).toContain("--title");
    expect(hasStackTrace(io.errLines)).toBe(false);
  });

  it("create: whitespace-only --content -> non-zero exit, readable error, no stack trace", async () => {
    const io = makeIo();
    const code = await run(["create", "--title", "My Note", "--content", "   "], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--content");
    expect(hasStackTrace(io.errLines)).toBe(false);
  });

  it("read: missing --id -> non-zero exit, readable error, no stack trace", async () => {
    const io = makeIo();
    const code = await run(["read"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--id");
    expect(hasStackTrace(io.errLines)).toBe(false);
  });

  it("read: whitespace-only --id -> non-zero exit, readable error, no stack trace", async () => {
    const io = makeIo();
    const code = await run(["read", "--id", "   "], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--id");
    expect(hasStackTrace(io.errLines)).toBe(false);
  });

  it("update: blank --id -> non-zero exit, readable error, no stack trace", async () => {
    const io = makeIo();
    const code = await run(["update", "--id", "  "], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--id");
    expect(hasStackTrace(io.errLines)).toBe(false);
  });
});
