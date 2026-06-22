import { validateRequired, ValidationError } from "../src/cli/validate";

describe("validateRequired", () => {
  it("returns the trimmed value for a normal string", () => {
    expect(validateRequired("title", "Hello")).toBe("Hello");
  });

  it("trims surrounding whitespace and returns the trimmed string", () => {
    expect(validateRequired("title", "  Hello World  ")).toBe("Hello World");
  });

  it("throws ValidationError when value is undefined", () => {
    expect(() => validateRequired("title", undefined)).toThrow(ValidationError);
  });

  it("throws ValidationError when value is an empty string", () => {
    expect(() => validateRequired("title", "")).toThrow(ValidationError);
  });

  it("throws ValidationError when value is whitespace-only", () => {
    expect(() => validateRequired("title", "   ")).toThrow(ValidationError);
  });

  it("includes the field name in the error message", () => {
    try {
      validateRequired("content", "");
      fail("Expected ValidationError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).message).toContain("content");
      expect((err as ValidationError).field).toBe("content");
    }
  });
});
