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
  it("rejects whitespace-only title", () => {
    const result = validateCreateInput({ title: "   ", content: "Valid content" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("title");
      expect(result.errors[0].message).toContain("Title is required");
    }
  });

  it("rejects empty content", () => {
    const result = validateCreateInput({ title: "Title", content: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("content");
      expect(result.errors[0].message).toContain("non-empty string");
    }
  });

  it("rejects whitespace-only content", () => {
    const result = validateCreateInput({ title: "Title", content: "   " });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("content");
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

  it("rejects empty content string", () => {
    const result = validateUpdateInput({ content: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("content");
    }
  });

  it("accepts empty object (no-op update)", () => {
    const result = validateUpdateInput({});
    expect(result.valid).toBe(true);
  });
});

