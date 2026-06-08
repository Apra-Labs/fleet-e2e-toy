import { validateCreateInput, validateUpdateInput, validatePaginationParams } from "../src/utils/validation";

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

describe("validatePaginationParams", () => {
  it("defaults to page=1 and limit=10 when both undefined", () => {
    const result = validatePaginationParams(undefined, undefined);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.params.page).toBe(1);
      expect(result.params.limit).toBe(10);
    }
  });

  it("accepts valid page and limit values", () => {
    const result = validatePaginationParams(2, 20);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.params.page).toBe(2);
      expect(result.params.limit).toBe(20);
    }
  });

  it("rejects non-numeric page", () => {
    const result = validatePaginationParams("abc", 10);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("page");
    }
  });

  it("rejects non-numeric limit", () => {
    const result = validatePaginationParams(1, "xyz");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("limit");
    }
  });

  it("rejects limit=0", () => {
    const result = validatePaginationParams(1, 0);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("limit");
    }
  });

  it("rejects page=0", () => {
    const result = validatePaginationParams(0, 10);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("page");
    }
  });

  it("rejects negative page", () => {
    const result = validatePaginationParams(-5, 10);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("page");
    }
  });

  it("rejects negative limit", () => {
    const result = validatePaginationParams(1, -10);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("limit");
    }
  });

  it("floors fractional page value", () => {
    const result = validatePaginationParams(2.7, 10);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.params.page).toBe(2);
    }
  });

  it("floors fractional limit value", () => {
    const result = validatePaginationParams(1, 5.9);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.params.limit).toBe(5);
    }
  });
});
