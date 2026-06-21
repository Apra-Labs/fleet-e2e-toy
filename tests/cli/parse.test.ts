import { parseArgs } from "../../src/cli/parse";

describe("parseArgs", () => {
  it("extracts subcommand as first positional", () => {
    const result = parseArgs(["list"]);
    expect(result.command).toBe("list");
    expect(result.positionals).toEqual([]);
  });

  it("parses --title foo (space-separated)", () => {
    const result = parseArgs(["create", "--title", "foo"]);
    expect(result.command).toBe("create");
    expect(result.flags["title"]).toBe("foo");
  });

  it("parses --title=foo (equals-separated)", () => {
    const result = parseArgs(["create", "--title=foo"]);
    expect(result.command).toBe("create");
    expect(result.flags["title"]).toBe("foo");
  });

  it("parses boolean --json flag", () => {
    const result = parseArgs(["list", "--json"]);
    expect(result.flags["json"]).toBe(true);
  });

  it("recognises short -h flag", () => {
    const result = parseArgs(["-h"]);
    expect(result.flags["h"]).toBe(true);
  });

  it("captures unknown flags without crashing", () => {
    const result = parseArgs(["list", "--unknown-flag", "value"]);
    expect(result.flags["unknown-flag"]).toBe("value");
  });

  it("handles multiple flags together", () => {
    const result = parseArgs(["create", "--title", "My Note", "--content", "Some content"]);
    expect(result.command).toBe("create");
    expect(result.flags["title"]).toBe("My Note");
    expect(result.flags["content"]).toBe("Some content");
  });

  it("puts extra positionals after command into positionals array", () => {
    const result = parseArgs(["read", "extra1", "extra2"]);
    expect(result.command).toBe("read");
    expect(result.positionals).toEqual(["extra1", "extra2"]);
  });

  it("returns undefined command when no arguments given", () => {
    const result = parseArgs([]);
    expect(result.command).toBeUndefined();
  });
});
