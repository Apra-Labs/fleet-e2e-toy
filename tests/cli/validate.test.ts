import { requireNonBlank, optionalNonBlank, ValidationError } from "../../src/cli/validate";

describe("requireNonBlank", () => {
  it("rejects an empty string", () => {
    expect(() => requireNonBlank("", "title")).toThrow(ValidationError);
    expect(() => requireNonBlank("", "title")).toThrow("--title is required and cannot be empty.");
  });

  it("rejects a whitespace-only string", () => {
    expect(() => requireNonBlank("   ", "id")).toThrow(ValidationError);
  });

  it("rejects undefined", () => {
    expect(() => requireNonBlank(undefined, "id")).toThrow(ValidationError);
  });

  it("passes through a valid non-empty value, trimmed", () => {
    expect(requireNonBlank("  hello  ", "title")).toBe("hello");
  });

  it("does not include a stack trace in the error message", () => {
    try {
      requireNonBlank("", "content");
      fail("expected to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as Error).message).not.toMatch(/at /);
    }
  });
});

describe("optionalNonBlank", () => {
  it("returns undefined when value is undefined", () => {
    expect(optionalNonBlank(undefined, "tag")).toBeUndefined();
  });

  it("rejects a whitespace-only value when present", () => {
    expect(() => optionalNonBlank("   ", "tag")).toThrow(ValidationError);
  });

  it("passes through a valid value, trimmed", () => {
    expect(optionalNonBlank("  work  ", "tag")).toBe("work");
  });
});
