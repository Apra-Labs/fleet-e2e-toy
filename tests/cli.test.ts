import { parseArgs } from "../src/cli/parser";
import { main } from "../src/cli/index";

describe("parseArgs", () => {
  it("parses a bare command", () => {
    const result = parseArgs(["list"]);
    expect(result.command).toBe("list");
    expect(result.flags).toEqual({});
    expect(result.positionals).toEqual([]);
  });

  it("parses --flag value (space separated)", () => {
    const result = parseArgs(["create", "--title", "Hello"]);
    expect(result.command).toBe("create");
    expect(result.flags.title).toBe("Hello");
  });

  it("parses --flag=value (inline)", () => {
    const result = parseArgs(["create", "--title=Hello"]);
    expect(result.flags.title).toBe("Hello");
  });

  it("parses boolean long flags", () => {
    const result = parseArgs(["--version"]);
    expect(result.flags.version).toBe(true);
    expect(result.command).toBeUndefined();
  });

  it("parses boolean short flags", () => {
    expect(parseArgs(["-v"]).flags.v).toBe(true);
    expect(parseArgs(["-h"]).flags.h).toBe(true);
  });

  it("parses --help as a boolean long flag", () => {
    const result = parseArgs(["--help"]);
    expect(result.flags.help).toBe(true);
  });

  it("collects positionals after the command", () => {
    const result = parseArgs(["get", "id1", "id2"]);
    expect(result.command).toBe("get");
    expect(result.positionals).toEqual(["id1", "id2"]);
  });

  it("treats a trailing value-less flag as boolean", () => {
    const result = parseArgs(["create", "--draft"]);
    expect(result.flags.draft).toBe(true);
  });
});

describe("main", () => {
  it("returns non-zero for an unknown command", async () => {
    const code = await main(["--unknown"]);
    expect(code).not.toBe(0);
  });

  it("returns non-zero when no command is provided", async () => {
    const code = await main([]);
    expect(code).not.toBe(0);
  });

  it("returns a numeric exit code and never throws", async () => {
    await expect(main(["bogus-command"])).resolves.toEqual(expect.any(Number));
  });

  it("main(['--version']) returns 0 and prints version to stdout", async () => {
    const writeSpyStdout = jest.spyOn(process.stdout, "write").mockImplementation();
    try {
      const code = await main(["--version"]);
      expect(code).toBe(0);
      expect(writeSpyStdout).toHaveBeenCalled();
      const output = writeSpyStdout.mock.calls.join("");
      expect(output).toContain("noteapi v1.0.0");
    } finally {
      writeSpyStdout.mockRestore();
    }
  });

  it("main(['-v']) returns 0 and prints version to stdout", async () => {
    const writeSpyStdout = jest.spyOn(process.stdout, "write").mockImplementation();
    try {
      const code = await main(["-v"]);
      expect(code).toBe(0);
      expect(writeSpyStdout).toHaveBeenCalled();
      const output = writeSpyStdout.mock.calls.join("");
      expect(output).toContain("noteapi v1.0.0");
    } finally {
      writeSpyStdout.mockRestore();
    }
  });

  it("main(['--help']) prints global usage and returns 0", async () => {
    const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
    try {
      const code = await main(["--help"]);
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

  it("main(['-h']) prints global usage and returns 0", async () => {
    const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
    try {
      const code = await main(["-h"]);
      expect(code).toBe(0);
      const output = stdoutSpy.mock.calls.map((c) => c[0]).join("");
      expect(output).toContain("list");
      expect(output).toContain("create");
    } finally {
      stdoutSpy.mockRestore();
    }
  });

  it("main(['create', '--help']) prints per-command usage and returns 0", async () => {
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
});
