import { validateCreateInput, validateUpdateInput } from "../src/utils/validation";

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

  it("gives exactly one tags error with the existing message for non-string tags", () => {
    const result = validateCreateInput({ title: "Note", content: "Body", tags: [1, 2] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({ field: "tags", message: "Tags must be an array of strings" });
    }
  });

  it.each([[[""]], [["   "]], [["work", ""]]])("rejects empty or blank tag elements %j", (tags) => {
    const result = validateCreateInput({ title: "N", content: "B", tags });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("tags");
    }
  });

  it("rejects null body with exactly one error on field body", () => {
    const result = validateCreateInput(null);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("body");
      expect(Object.keys(result.errors[0]).sort()).toEqual(["field", "message"]);
    }
  });

  it("rejects non-object body with exactly one error on field body", () => {
    const result = validateCreateInput("not an object");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("body");
    }
  });

  it("trims title and passes content through unchanged on valid input", () => {
    const content = "  keep  leading and trailing spaces  ";
    const result = validateCreateInput({ title: "  Padded Title  ", content });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.title).toBe("Padded Title");
      expect(result.data.content).toBe(content);
    }
  });

  it("accumulates errors across title, content and tags instead of stopping at the first", () => {
    const result = validateCreateInput({ content: 42, tags: [1] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.map((e) => e.field)).toEqual(["title", "content", "tags"]);
      for (const error of result.errors) {
        expect(typeof error.message).toBe("string");
      }
    }
  });

  it("accumulates missing title and non-string content together", () => {
    const result = validateCreateInput({ content: 123 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map((e) => e.field)).toEqual(["title", "content"]);
    }
  });

  it("reports the empty-string message for a blank tag element", () => {
    const result = validateCreateInput({ title: "N", content: "B", tags: ["work", ""] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual([{ field: "tags", message: "Tags must not contain empty strings" }]);
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
