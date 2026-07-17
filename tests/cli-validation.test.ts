import { validateOptionalFlag, validateRequiredFlag } from "../src/cli/validation";

describe("validateRequiredFlag", () => {
  it("accepts a valid non-empty value", () => {
    const result = validateRequiredFlag("title", "My Note");
    expect(result.valid).toBe(true);
    expect(result.value).toBe("My Note");
  });

  it("trims a valid value with surrounding whitespace", () => {
    const result = validateRequiredFlag("title", "  My Note  ");
    expect(result.valid).toBe(true);
    expect(result.value).toBe("My Note");
  });

  it("rejects an undefined value", () => {
    const result = validateRequiredFlag("title", undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("--title");
  });

  it("rejects an empty string", () => {
    const result = validateRequiredFlag("title", "");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("--title");
  });

  it("rejects a whitespace-only string", () => {
    const result = validateRequiredFlag("title", "   ");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("--title");
  });
});

describe("validateOptionalFlag", () => {
  it("accepts an undefined value (flag not supplied)", () => {
    const result = validateOptionalFlag("tag", undefined);
    expect(result.valid).toBe(true);
    expect(result.value).toBe("");
  });

  it("accepts a valid non-empty value", () => {
    const result = validateOptionalFlag("tag", "work");
    expect(result.valid).toBe(true);
    expect(result.value).toBe("work");
  });

  it("rejects a whitespace-only value when supplied", () => {
    const result = validateOptionalFlag("tag", "   ");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("--tag");
  });
});
