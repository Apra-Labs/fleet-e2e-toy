import { requireNonBlank } from "../../src/cli/validation";

describe("requireNonBlank", () => {
  it("returns the value unchanged when it is a valid non-empty string", () => {
    expect(requireNonBlank("title", "My Note")).toBe("My Note");
  });

  it("throws a clean Error for an empty string", () => {
    expect(() => requireNonBlank("title", "")).toThrow("title must not be empty");
  });

  it("throws a clean Error for a whitespace-only string", () => {
    expect(() => requireNonBlank("title", "   ")).toThrow("title must not be empty");
  });

  it("throws a clean Error when the value is undefined", () => {
    expect(() => requireNonBlank("id", undefined)).toThrow("id must not be empty");
  });

  it("includes the field name in the error message", () => {
    expect(() => requireNonBlank("content", "  \t\n ")).toThrow("content must not be empty");
  });
});
