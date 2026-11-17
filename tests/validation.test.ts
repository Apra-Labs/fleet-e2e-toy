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

describe("content length cap", () => {
  const tooLong = { field: "content", message: "Content must be at most 10000 characters" };

  it("validateCreateInput rejects 10001-char content", () => {
    const result = validateCreateInput({ title: "Note", content: "a".repeat(10001) });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContainEqual(tooLong);
    }
  });

  it("validateCreateInput accepts 10000-char content", () => {
    const result = validateCreateInput({ title: "Note", content: "a".repeat(10000) });
    expect(result.valid).toBe(true);
  });

  it("validateUpdateInput rejects 10001-char content", () => {
    const result = validateUpdateInput({ content: "a".repeat(10001) });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContainEqual(tooLong);
    }
  });

  it("validateUpdateInput accepts 10000-char content", () => {
    const result = validateUpdateInput({ content: "a".repeat(10000) });
    expect(result.valid).toBe(true);
  });
});
