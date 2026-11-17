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

describe("title maximum length (100 characters)", () => {
  const tooLong = { field: "title", message: "Title must be at most 100 characters" };

  it("accepts a 100-character title on create and update", () => {
    expect(validateCreateInput({ title: "a".repeat(100), content: "x" }).valid).toBe(true);
    expect(validateUpdateInput({ title: "a".repeat(100) }).valid).toBe(true);
  });

  it("rejects a 101-character title on create with the max-length error", () => {
    const result = validateCreateInput({ title: "a".repeat(101), content: "x" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContainEqual(tooLong);
    }
  });

  it("rejects a 101-character title on update with the max-length error", () => {
    const result = validateUpdateInput({ title: "a".repeat(101) });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContainEqual(tooLong);
    }
  });

  it("measures length after trimming (100 chars plus surrounding spaces is valid)", () => {
    const padded = " " + "a".repeat(100) + " ";
    const created = validateCreateInput({ title: padded, content: "x" });
    expect(created.valid).toBe(true);
    if (created.valid) {
      expect(created.data.title).toHaveLength(100);
    }
    expect(validateUpdateInput({ title: padded }).valid).toBe(true);
  });
});
