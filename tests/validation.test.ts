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

  it("rejects duplicate tags", () => {
    const result = validateCreateInput({ title: "a", content: "b", tags: ["work", "work"] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      const err = result.errors.find((e) => e.field === "tags");
      expect(err).toBeDefined();
      expect(err?.message).toMatch(/duplicate/i);
    }
  });

  it("accepts non-repeating tags including case-differing ones", () => {
    const tags = ["x", "X", "work"];
    const result = validateCreateInput({ title: "a", content: "b", tags });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tags).toEqual(tags);
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

  it("rejects duplicate tags", () => {
    const result = validateUpdateInput({ tags: ["work", "work"] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      const err = result.errors.find((e) => e.field === "tags");
      expect(err).toBeDefined();
      expect(err?.message).toMatch(/duplicate/i);
    }
  });

  it("accepts non-repeating tags including case-differing ones", () => {
    const tags = ["x", "X", "urgent"];
    const result = validateUpdateInput({ tags });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tags).toEqual(tags);
    }
  });
});
