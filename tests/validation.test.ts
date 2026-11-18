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

describe("length limits", () => {
  const fieldsOf = (r: ReturnType<typeof validateCreateInput>) => (r.valid ? [] : r.errors.map((e) => e.field));

  describe("validateCreateInput", () => {
    it("accepts a 200-char title", () => {
      expect(validateCreateInput({ title: "a".repeat(200), content: "x" }).valid).toBe(true);
    });

    it("rejects a 201-char title with a title error", () => {
      const r = validateCreateInput({ title: "a".repeat(201), content: "x" });
      expect(r.valid).toBe(false);
      expect(fieldsOf(r)).toContain("title");
    });

    it("accepts a 200-char title padded with whitespace (limit applies after trim)", () => {
      expect(validateCreateInput({ title: `  ${"a".repeat(200)}  `, content: "x" }).valid).toBe(true);
    });

    it("accepts 10000-char content", () => {
      expect(validateCreateInput({ title: "t", content: "x".repeat(10000) }).valid).toBe(true);
    });

    it("rejects 10001-char content with a content error", () => {
      const r = validateCreateInput({ title: "t", content: "x".repeat(10001) });
      expect(r.valid).toBe(false);
      expect(fieldsOf(r)).toContain("content");
    });
  });

  describe("validateUpdateInput", () => {
    it("accepts a 200-char title", () => {
      expect(validateUpdateInput({ title: "a".repeat(200) }).valid).toBe(true);
    });

    it("rejects a 201-char title with a title error", () => {
      const r = validateUpdateInput({ title: "a".repeat(201) });
      expect(r.valid).toBe(false);
      expect(fieldsOf(r as ReturnType<typeof validateCreateInput>)).toContain("title");
    });

    it("accepts a 200-char title padded with whitespace (limit applies after trim)", () => {
      expect(validateUpdateInput({ title: `  ${"a".repeat(200)}  ` }).valid).toBe(true);
    });

    it("accepts 10000-char content", () => {
      expect(validateUpdateInput({ content: "x".repeat(10000) }).valid).toBe(true);
    });

    it("rejects 10001-char content with a content error", () => {
      const r = validateUpdateInput({ content: "x".repeat(10001) });
      expect(r.valid).toBe(false);
      expect(fieldsOf(r as ReturnType<typeof validateCreateInput>)).toContain("content");
    });

    it("still accepts an empty object", () => {
      expect(validateUpdateInput({}).valid).toBe(true);
    });
  });
});
