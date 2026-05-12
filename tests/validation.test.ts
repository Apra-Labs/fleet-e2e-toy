import { validateCreateInput, validateUpdateInput, validateNonBlankString } from "../src/utils/validation";

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

describe("validateNonBlankString", () => {
  it("returns null for a valid non-blank string", () => {
    expect(validateNonBlankString("hello")).toBeNull();
  });

  it("returns an error message for an empty string", () => {
    const result = validateNonBlankString("", "title");
    expect(result).not.toBeNull();
    expect(result).toContain("title");
  });

  it("returns an error message for a whitespace-only string", () => {
    const result = validateNonBlankString("   ", "content");
    expect(result).not.toBeNull();
    expect(result).toContain("content");
  });

  it("returns an error message for tab-only string", () => {
    const result = validateNonBlankString("\t\n", "field");
    expect(result).not.toBeNull();
  });

  it("accepts a string with surrounding whitespace as long as it has content", () => {
    expect(validateNonBlankString("  hello  ")).toBeNull();
  });

  it("uses default field name when none provided", () => {
    const result = validateNonBlankString("");
    expect(result).toContain("value");
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
