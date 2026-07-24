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

describe("CLI --help/-h output", () => {
  it("prints global usage and exits 0 for --help with no subcommand", async () => {
    const io = makeIo();
    const code = await run(["--help"], io);
    expect(code).toBe(0);
    expect(io.outLines.join("\n")).toContain("Usage: noteapi <command>");
    expect(io.errLines).toHaveLength(0);
  });

  it("prints global usage and exits 0 for -h with no subcommand", async () => {
    const io = makeIo();
    const code = await run(["-h"], io);
    expect(code).toBe(0);
    expect(io.outLines.join("\n")).toContain("Usage: noteapi <command>");
  });

  it("lists all five subcommands in global usage", async () => {
    const io = makeIo();
    await run(["--help"], io);
    const text = io.outLines.join("\n");
    for (const name of ["list", "read", "create", "update", "delete"]) {
      expect(text).toContain(name);
    }
  });

  it("exits 1 and prints usage when no command is given", async () => {
    const io = makeIo();
    const code = await run([], io);
    expect(code).toBe(1);
    expect(io.outLines.join("\n")).toContain(GLOBAL_USAGE);
  });

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
    }
  );
});
