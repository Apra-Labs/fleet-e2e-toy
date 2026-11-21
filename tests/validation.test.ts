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

  it("rejects a 101-character title", () => {
    const result = validateCreateInput({ title: "a".repeat(101), content: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "title")).toBe(true);
    }
  });

  it("accepts a 100-character title", () => {
    const result = validateCreateInput({ title: "a".repeat(100), content: "" });
    expect(result.valid).toBe(true);
  });

  it("accepts a title over 100 raw characters that is exactly 100 after trimming", () => {
    const result = validateCreateInput({ title: " " + "a".repeat(100) + "  ", content: "" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.title).toBe("a".repeat(100));
    }
  });

  it("still accepts empty tags array on create", () => {
    const result = validateCreateInput({ title: "Note", content: "Body", tags: [] });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it("accepts exactly 10 string tags", () => {
    const tags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
    const result = validateCreateInput({ title: "Note", content: "Body", tags });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tags).toEqual(tags);
    }
  });

  it("rejects 11 string tags with a tags error", () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    const result = validateCreateInput({ title: "Note", content: "Body", tags });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "tags")).toBe(true);
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

  it("rejects an empty tags array", () => {
    const result = validateUpdateInput({ tags: [] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "tags")).toBe(true);
    }
  });

  it("accepts a non-empty tags array", () => {
    const result = validateUpdateInput({ tags: ["a"] });
    expect(result.valid).toBe(true);
  });

  it("accepts an omitted tags field", () => {
    const result = validateUpdateInput({ title: "Still fine" });
    expect(result.valid).toBe(true);
  });

  it("accepts 11 string tags (no cap on update)", () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    const result = validateUpdateInput({ tags });
    expect(result.valid).toBe(true);
  });
});
