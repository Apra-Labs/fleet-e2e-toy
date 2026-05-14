import { parseArgs, validateStringArg, run } from "../src/cli";

describe("parseArgs", () => {
  it("detects --version flag", () => {
    expect(parseArgs(["node", "cli", "--version"])).toEqual({ action: "version", args: [] });
  });

  it("detects -v flag", () => {
    expect(parseArgs(["node", "cli", "-v"])).toEqual({ action: "version", args: [] });
  });

  it("detects --version alongside other flags", () => {
    expect(parseArgs(["node", "cli", "--port", "3000", "--version"])).toEqual({
      action: "version",
      args: [],
    });
  });

  it("detects --help flag", () => {
    expect(parseArgs(["node", "cli", "--help"])).toEqual({ action: "help", args: [] });
  });

  it("detects -h flag", () => {
    expect(parseArgs(["node", "cli", "-h"])).toEqual({ action: "help", args: [] });
  });

  it("detects help subcommand", () => {
    expect(parseArgs(["node", "cli", "help"])).toEqual({ action: "help", args: [] });
  });

  it("defaults to serve with no args", () => {
    expect(parseArgs(["node", "cli"])).toEqual({ action: "serve", args: [] });
  });

  it("collects positional args for serve", () => {
    expect(parseArgs(["node", "cli", "myarg"])).toEqual({ action: "serve", args: ["myarg"] });
  });
});

describe("--version flag (gh-toy-4ef)", () => {
  it("prints fleet-e2e-toy v1.0.0", () => {
    const spy = jest.spyOn(console, "log").mockImplementation();
    const code = run(["node", "cli", "--version"]);
    expect(code).toBe(0);
    expect(spy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    spy.mockRestore();
  });

  it("prints version with -v alias", () => {
    const spy = jest.spyOn(console, "log").mockImplementation();
    const code = run(["node", "cli", "-v"]);
    expect(code).toBe(0);
    expect(spy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    spy.mockRestore();
  });

  it("--version takes priority when mixed with other flags", () => {
    const spy = jest.spyOn(console, "log").mockImplementation();
    const code = run(["node", "cli", "--port", "8080", "--version"]);
    expect(code).toBe(0);
    expect(spy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    spy.mockRestore();
  });
});

describe("help command (gh-toy-kbk)", () => {
  it("--help prints usage and exits 0", () => {
    const spy = jest.spyOn(console, "log").mockImplementation();
    const code = run(["node", "cli", "--help"]);
    expect(code).toBe(0);
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain("Usage:");
    expect(output).toContain("--version");
    expect(output).toContain("--help");
    expect(output).toContain("help");
    expect(output).toContain("serve");
    spy.mockRestore();
  });

  it("-h prints same usage", () => {
    const spy = jest.spyOn(console, "log").mockImplementation();
    const code = run(["node", "cli", "-h"]);
    expect(code).toBe(0);
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain("Usage:");
    spy.mockRestore();
  });

  it("help subcommand prints same usage as --help", () => {
    const helpSpy = jest.spyOn(console, "log").mockImplementation();
    run(["node", "cli", "--help"]);
    const helpOutput = helpSpy.mock.calls[0][0];
    helpSpy.mockRestore();

    const subSpy = jest.spyOn(console, "log").mockImplementation();
    run(["node", "cli", "help"]);
    const subOutput = subSpy.mock.calls[0][0];
    subSpy.mockRestore();

    expect(subOutput).toBe(helpOutput);
  });

  it("help output lists all subcommands and flags", () => {
    const spy = jest.spyOn(console, "log").mockImplementation();
    run(["node", "cli", "--help"]);
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain("help");
    expect(output).toContain("serve");
    expect(output).toContain("--version");
    expect(output).toContain("-v");
    expect(output).toContain("--help");
    expect(output).toContain("-h");
    expect(output).toContain("--port");
    spy.mockRestore();
  });
});

describe("input validation (gh-toy-v6z)", () => {
  it("validateStringArg rejects empty string", () => {
    expect(validateStringArg("")).not.toBeNull();
  });

  it("validateStringArg rejects whitespace-only string", () => {
    expect(validateStringArg("   ")).not.toBeNull();
    expect(validateStringArg("\t\n")).not.toBeNull();
  });

  it("validateStringArg accepts valid string", () => {
    expect(validateStringArg("hello")).toBeNull();
  });

  it("run exits non-zero on empty string argument", () => {
    const spy = jest.spyOn(console, "error").mockImplementation();
    const code = run(["node", "cli", ""]);
    expect(code).toBe(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("empty or whitespace"));
    spy.mockRestore();
  });

  it("run exits non-zero on whitespace-only argument", () => {
    const spy = jest.spyOn(console, "error").mockImplementation();
    const code = run(["node", "cli", "   "]);
    expect(code).toBe(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("empty or whitespace"));
    spy.mockRestore();
  });

  it("run exits 0 on valid string argument", () => {
    const code = run(["node", "cli", "validarg"]);
    expect(code).toBe(0);
  });
});
