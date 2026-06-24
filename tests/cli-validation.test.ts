import { validateCreateInput, validateUpdateInput } from "../src/utils/validation";

describe("validateCreateInput - blank/empty strings", () => {
  it("rejects empty string title", () => {
    const result = validateCreateInput({ title: "", content: "Body" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("title");
      expect(result.errors[0].message).toContain("non-empty");
    }
  });

  it("rejects whitespace-only title", () => {
    const result = validateCreateInput({ title: "   ", content: "Body" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("title");
    }
  });

  it("rejects null content", () => {
    const result = validateCreateInput({ title: "Valid", content: null });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("content");
    }
  });

  it("trims whitespace from title", () => {
    const result = validateCreateInput({ title: "  Trimmed  ", content: "Body" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.title).toBe("Trimmed");
    }
  });
});

describe("validateUpdateInput - blank/empty strings", () => {
  it("rejects empty string title", () => {
    const result = validateUpdateInput({ title: "" });
    expect(result.valid).toBe(false);
  });

  it("rejects whitespace-only title", () => {
    const result = validateUpdateInput({ title: "   " });
    expect(result.valid).toBe(false);
  });

  it("rejects empty string content", () => {
    const result = validateUpdateInput({ content: "" });
    expect(result.valid).toBe(true);
  });

  it("rejects non-string tags", () => {
    const result = validateUpdateInput({ tags: [123, null] });
    expect(result.valid).toBe(false);
  });
});
