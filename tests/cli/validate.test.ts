import { isBlank, validateRequired } from "../../src/cli/validate";

describe("isBlank", () => {
  it("returns true for empty string", () => {
    expect(isBlank("")).toBe(true);
  });

  it("returns true for whitespace-only string", () => {
    expect(isBlank("   ")).toBe(true);
  });

  it("returns true for tab-only string", () => {
    expect(isBlank("\t")).toBe(true);
  });

  it("returns false for non-empty string", () => {
    expect(isBlank("x")).toBe(false);
  });

  it("returns false for string with content and spaces", () => {
    expect(isBlank("  hello  ")).toBe(false);
  });
});

describe("validateRequired", () => {
  it("returns error for empty string value", () => {
    expect(validateRequired("title", "")).toBe("Error: title must not be empty");
  });

  it("returns error for whitespace-only value", () => {
    expect(validateRequired("title", "   ")).toBe(
      "Error: title must not be empty"
    );
  });

  it("returns error for undefined value", () => {
    expect(validateRequired("id", undefined)).toBe(
      "Error: id must not be empty"
    );
  });

  it("returns null for valid value", () => {
    expect(validateRequired("title", "ok")).toBeNull();
  });

  it("returns null for value with surrounding whitespace but non-empty", () => {
    expect(validateRequired("title", "  hello  ")).toBeNull();
  });
});
