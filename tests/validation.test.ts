import { validateCreateInput, validateUpdateInput, validateNonBlank } from "../src/utils/validation";

describe("validateCreateInput", () => {
  it("accepts valid input with all fields", () => {
    const result = validateCreateInput({
      title: "My Note",
      content: "Some content",
      tags: ["work", "urgent"],
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.title).toBe("My Note");
      expect(result.data.tags).toEqual(["work", "urgent"]);
    }
  });

  it("defaults tags to empty array when omitted", () => {
    const result = validateCreateInput({ title: "Note", content: "Body" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it("rejects missing title", () => {
    const result = validateCreateInput({ content: "Body" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("title");
    }
  });

  it("rejects non-object body", () => {
    const result = validateCreateInput("not an object");
    expect(result.valid).toBe(false);
  });

  it("rejects non-string tags", () => {
    const result = validateCreateInput({ title: "Note", content: "Body", tags: [1, 2] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("tags");
    }
  });
});

describe("validateUpdateInput", () => {
  it("accepts partial update with title only", () => {
    const result = validateUpdateInput({ title: "Updated" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.title).toBe("Updated");
      expect(result.data.content).toBeUndefined();
    }
  });

  it("rejects empty title string", () => {
    const result = validateUpdateInput({ title: "" });
    expect(result.valid).toBe(false);
  });

  it("accepts empty object (no-op update)", () => {
    const result = validateUpdateInput({});
    expect(result.valid).toBe(true);
  });
});

describe("validateNonBlank", () => {
  it("accepts a non-blank string without throwing", () => {
    expect(() => validateNonBlank("hello", "testArg")).not.toThrow();
  });

  it("throws on empty string with correct error message", () => {
    expect(() => validateNonBlank("", "myArg")).toThrow(Error);
    try {
      validateNonBlank("", "myArg");
      fail("should have thrown");
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).toMatch(/must not be empty or blank/);
        expect(err.message).toMatch(/myArg/);
      }
    }
  });

  it("throws on whitespace-only string with correct error message", () => {
    expect(() => validateNonBlank("   ", "myArg")).toThrow(Error);
    try {
      validateNonBlank("   ", "myArg");
      fail("should have thrown");
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).toMatch(/must not be empty or blank/);
        expect(err.message).toMatch(/myArg/);
      }
    }
  });

  it("throws when called with non-string value cast through unknown", () => {
    const nonStringValue = 123 as unknown as string;
    expect(() => validateNonBlank(nonStringValue, "badArg")).toThrow(Error);
    try {
      validateNonBlank(nonStringValue, "badArg");
      fail("should have thrown");
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).toMatch(/must not be empty or blank/);
      }
    }
  });
});
