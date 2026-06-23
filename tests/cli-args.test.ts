import { parseArgs, validateNonBlank } from "../src/cli/args";

describe("parseArgs", () => {
  it("parses a subcommand with no flags", () => {
    const result = parseArgs(["list"]);
    expect(result.command).toBe("list");
    expect(result.flags).toEqual({});
    expect(result.positionals).toEqual([]);
  });

  it("parses --flag value form", () => {
    const result = parseArgs(["read", "--id", "abc123"]);
    expect(result.command).toBe("read");
    expect(result.flags["id"]).toBe("abc123");
  });

  it("parses --flag=value form", () => {
    const result = parseArgs(["read", "--id=abc123"]);
    expect(result.flags["id"]).toBe("abc123");
  });

  it("parses boolean flags", () => {
    const result = parseArgs(["list", "--json"]);
    expect(result.flags["json"]).toBe(true);
  });

  it("returns undefined command when no args given", () => {
    const result = parseArgs([]);
    expect(result.command).toBeUndefined();
  });
});

describe("validateNonBlank", () => {
  it("returns trimmed value for a valid string", () => {
    expect(validateNonBlank("  hello  ", "title")).toBe("hello");
  });

  it("throws for an empty string", () => {
    expect(() => validateNonBlank("", "title")).toThrow(
      "Argument 'title' must not be empty or whitespace-only"
    );
  });

  it("throws for a whitespace-only string", () => {
    expect(() => validateNonBlank("   ", "content")).toThrow(
      "Argument 'content' must not be empty or whitespace-only"
    );
  });

  it("throws for a tab-only string", () => {
    expect(() => validateNonBlank("\t\n", "query")).toThrow(
      "Argument 'query' must not be empty or whitespace-only"
    );
  });

  it("throws when value is undefined (argument not provided)", () => {
    expect(() => validateNonBlank(undefined, "id")).toThrow("Argument 'id' is required");
  });

  it("throws when value is boolean true (flag without value)", () => {
    expect(() => validateNonBlank(true, "id")).toThrow("Argument 'id' is required");
  });

  it("accepts a string with non-whitespace characters", () => {
    expect(validateNonBlank("note-123", "id")).toBe("note-123");
  });
});
