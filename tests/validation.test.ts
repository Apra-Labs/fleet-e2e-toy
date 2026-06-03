import { validateCreateInput, validateUpdateInput, isBlankString, validateNonBlankString, validateListQuery, validateIdParam } from "../src/utils/validation";

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

describe("isBlankString", () => {
  it("returns true for empty string", () => {
    expect(isBlankString("")).toBe(true);
  });

  it("returns true for whitespace-only string", () => {
    expect(isBlankString("   ")).toBe(true);
  });

  it("returns true for tab and newline string", () => {
    expect(isBlankString("\t\n")).toBe(true);
  });

  it("returns false for string with content", () => {
    expect(isBlankString("hello")).toBe(false);
  });

  it("returns false for string with surrounding whitespace", () => {
    expect(isBlankString(" hello ")).toBe(false);
  });

  it("returns true for null", () => {
    expect(isBlankString(null)).toBe(true);
  });

  it("returns true for undefined", () => {
    expect(isBlankString(undefined)).toBe(true);
  });

  it("returns true for number", () => {
    expect(isBlankString(123)).toBe(true);
  });

  it("returns true for object", () => {
    expect(isBlankString({})).toBe(true);
  });
});

describe("validateNonBlankString", () => {
  it("returns null for valid string", () => {
    const result = validateNonBlankString("hello", "testfield");
    expect(result).toBeNull();
  });

  it("returns null for string with surrounding whitespace", () => {
    const result = validateNonBlankString(" hello ", "testfield");
    expect(result).toBeNull();
  });

  it("returns ValidationError for empty string", () => {
    const result = validateNonBlankString("", "title");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.field).toBe("title");
      expect(result.message).toBe("title must be a non-empty, non-whitespace string");
    }
  });

  it("returns ValidationError for whitespace-only string", () => {
    const result = validateNonBlankString("   ", "content");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.field).toBe("content");
      expect(result.message).toBe("content must be a non-empty, non-whitespace string");
    }
  });

  it("returns ValidationError for null", () => {
    const result = validateNonBlankString(null, "field");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.field).toBe("field");
      expect(result.message).toBe("field must be a non-empty, non-whitespace string");
    }
  });

  it("returns ValidationError for undefined", () => {
    const result = validateNonBlankString(undefined, "field");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.field).toBe("field");
    }
  });

  it("returns ValidationError for number", () => {
    const result = validateNonBlankString(123, "field");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.field).toBe("field");
    }
  });

  it("returns ValidationError for object", () => {
    const result = validateNonBlankString({}, "field");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.field).toBe("field");
    }
  });
});

describe("validateCreateInput — blank content and blank tag entries (task 2.1)", () => {
  it("rejects blank content string", () => {
    const result = validateCreateInput({ title: "x", content: "   " });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "content")).toBe(true);
    }
  });

  it("rejects empty content string", () => {
    const result = validateCreateInput({ title: "x", content: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "content")).toBe(true);
    }
  });

  it("rejects tags array with blank entry", () => {
    const result = validateCreateInput({ title: "x", content: "y", tags: ["ok", "  "] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "tags")).toBe(true);
    }
  });

  it("rejects tags array with empty string entry", () => {
    const result = validateCreateInput({ title: "x", content: "y", tags: ["ok", ""] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "tags")).toBe(true);
    }
  });

  it("trims tags in returned data", () => {
    const result = validateCreateInput({ title: "x", content: "y", tags: [" trim-me "] });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tags).toEqual(["trim-me"]);
    }
  });
});

describe("validateUpdateInput — blank content and blank tag entries (task 2.1)", () => {
  it("rejects blank content string", () => {
    const result = validateUpdateInput({ content: "   " });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "content")).toBe(true);
    }
  });

  it("rejects empty content string", () => {
    const result = validateUpdateInput({ content: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "content")).toBe(true);
    }
  });

  it("rejects tags array with blank entry", () => {
    const result = validateUpdateInput({ tags: ["a", ""] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "tags")).toBe(true);
    }
  });

  it("trims tags in returned data", () => {
    const result = validateUpdateInput({ tags: [" work ", " urgent "] });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tags).toEqual(["work", "urgent"]);
    }
  });
});

describe("validateListQuery (task 2.2)", () => {
  it("accepts empty query object", () => {
    const result = validateListQuery({});
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tag).toBeUndefined();
      expect(result.data.q).toBeUndefined();
    }
  });

  it("rejects blank q param", () => {
    const result = validateListQuery({ q: "  " });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "q")).toBe(true);
    }
  });

  it("rejects empty q param", () => {
    const result = validateListQuery({ q: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "q")).toBe(true);
    }
  });

  it("rejects blank tag param", () => {
    const result = validateListQuery({ tag: "  " });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "tag")).toBe(true);
    }
  });

  it("trims valid tag param", () => {
    const result = validateListQuery({ tag: " work " });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tag).toBe("work");
    }
  });

  it("trims valid q param", () => {
    const result = validateListQuery({ q: " meeting " });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.q).toBe("meeting");
    }
  });

  it("rejects non-string tag (e.g., array from duplicate keys)", () => {
    const result = validateListQuery({ tag: ["work", "urgent"] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "tag")).toBe(true);
    }
  });

  it("rejects non-string q", () => {
    const result = validateListQuery({ q: ["a", "b"] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.field === "q")).toBe(true);
    }
  });

  it("ignores unrelated query params", () => {
    const result = validateListQuery({ q: "hello", page: "1", limit: "10" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.q).toBe("hello");
    }
  });
});

describe("validateIdParam (task 2.2)", () => {
  it("returns null for a valid id", () => {
    const result = validateIdParam("some-uuid-1234");
    expect(result).toBeNull();
  });

  it("returns error for empty string", () => {
    const result = validateIdParam("");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.field).toBe("id");
    }
  });

  it("returns error for whitespace-only string", () => {
    const result = validateIdParam("   ");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.field).toBe("id");
    }
  });

  it("returns error for null", () => {
    const result = validateIdParam(null);
    expect(result).not.toBeNull();
  });

  it("returns error for undefined", () => {
    const result = validateIdParam(undefined);
    expect(result).not.toBeNull();
  });
});
