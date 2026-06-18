import { parseArgs } from "../src/cli/parse";

describe("parseArgs", () => {
  it("sets version=true for --version flag", () => {
    const result = parseArgs(["--version"]);
    expect(result.version).toBe(true);
    expect(result.json).toBe(false);
    expect(result.help).toBe(false);
  });

  it("sets version=true for -v shorthand", () => {
    const result = parseArgs(["-v"]);
    expect(result.version).toBe(true);
  });

  it("sets json=true for --json flag", () => {
    const result = parseArgs(["--json"]);
    expect(result.json).toBe(true);
    expect(result.version).toBe(false);
  });

  it("sets help=true for --help flag", () => {
    const result = parseArgs(["--help"]);
    expect(result.help).toBe(true);
  });

  it("sets help=true for -h shorthand", () => {
    const result = parseArgs(["-h"]);
    expect(result.help).toBe(true);
  });

  it("extracts command from first non-flag token", () => {
    const result = parseArgs(["notes"]);
    expect(result.command).toBe("notes");
    expect(result.args).toEqual([]);
  });

  it("extracts command and remaining positional args", () => {
    const result = parseArgs(["notes", "list", "extra"]);
    expect(result.command).toBe("notes");
    expect(result.args).toEqual(["list", "extra"]);
  });

  it("handles flags before command", () => {
    const result = parseArgs(["--json", "notes"]);
    expect(result.json).toBe(true);
    expect(result.command).toBe("notes");
    expect(result.args).toEqual([]);
  });

  it("handles flags mixed with command and args", () => {
    const result = parseArgs(["--version", "--json", "notes", "list"]);
    expect(result.version).toBe(true);
    expect(result.json).toBe(true);
    expect(result.command).toBe("notes");
    expect(result.args).toEqual(["list"]);
  });

  it("preserves unknown flags into args", () => {
    const result = parseArgs(["--unknown-flag", "notes"]);
    expect(result.args).toContain("--unknown-flag");
    expect(result.command).toBe("notes");
  });

  it("returns no command when only flags are given", () => {
    const result = parseArgs(["--json", "--version"]);
    expect(result.command).toBeUndefined();
    expect(result.args).toEqual([]);
  });

  it("returns defaults for empty argv", () => {
    const result = parseArgs([]);
    expect(result.command).toBeUndefined();
    expect(result.args).toEqual([]);
    expect(result.json).toBe(false);
    expect(result.version).toBe(false);
    expect(result.help).toBe(false);
  });
});
