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

describe("validateCreateInput length limits", () => {
  it("rejects title longer than 200 characters", () => {
    const longTitle = "a".repeat(201);
    const result = validateCreateInput({ title: longTitle, content: "Body" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("title");
      expect(result.errors[0].message).toBe("Title must be 200 characters or fewer");
    }
  });

  it("accepts title at exactly 200 characters", () => {
    const maxTitle = "a".repeat(200);
    const result = validateCreateInput({ title: maxTitle, content: "Body" });
    expect(result.valid).toBe(true);
  });

  it("rejects content longer than 10000 characters", () => {
    const longContent = "a".repeat(10001);
    const result = validateCreateInput({ title: "Note", content: longContent });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("content");
      expect(result.errors[0].message).toBe("Content must be 10000 characters or fewer");
    }
  });

  it("accepts content at exactly 10000 characters", () => {
    const maxContent = "a".repeat(10000);
    const result = validateCreateInput({ title: "Note", content: maxContent });
    expect(result.valid).toBe(true);
  });
});

describe("validateUpdateInput length limits", () => {
  it("rejects title longer than 200 characters", () => {
    const longTitle = "a".repeat(201);
    const result = validateUpdateInput({ title: longTitle });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("title");
      expect(result.errors[0].message).toBe("Title must be 200 characters or fewer");
    }
  });

  it("accepts title at exactly 200 characters", () => {
    const maxTitle = "a".repeat(200);
    const result = validateUpdateInput({ title: maxTitle });
    expect(result.valid).toBe(true);
  });

  it("rejects content longer than 10000 characters", () => {
    const longContent = "a".repeat(10001);
    const result = validateUpdateInput({ content: longContent });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("content");
      expect(result.errors[0].message).toBe("Content must be 10000 characters or fewer");
    }
  });

  it("accepts content at exactly 10000 characters", () => {
    const maxContent = "a".repeat(10000);
    const result = validateUpdateInput({ content: maxContent });
    expect(result.valid).toBe(true);
  });
});
