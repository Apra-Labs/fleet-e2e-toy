import { isNonEmpty, requireNonEmptyFlags } from "../src/cli/validation";

describe("cli/validation", () => {
  describe("isNonEmpty", () => {
    it("returns false for undefined", () => {
      expect(isNonEmpty(undefined)).toBe(false);
    });

    it("returns false for an empty string", () => {
      expect(isNonEmpty("")).toBe(false);
    });

    it("returns false for a whitespace-only string", () => {
      expect(isNonEmpty("   ")).toBe(false);
      expect(isNonEmpty("\t\n")).toBe(false);
    });

    it("returns true for a non-empty string", () => {
      expect(isNonEmpty("abc")).toBe(true);
      expect(isNonEmpty("  abc  ")).toBe(true);
    });
  });

  describe("requireNonEmptyFlags", () => {
    it("does not throw when all named flags are present and non-empty", () => {
      expect(() => requireNonEmptyFlags({ title: "T", content: "C" }, ["title", "content"], "usage")).not.toThrow();
    });

    it("throws the usage message when a flag is missing", () => {
      expect(() => requireNonEmptyFlags({ title: "T" }, ["title", "content"], "usage: x")).toThrow("usage: x");
    });

    it("throws the usage message when a flag is whitespace-only", () => {
      expect(() => requireNonEmptyFlags({ title: "   " }, ["title"], "usage: x")).toThrow("usage: x");
    });
  });
});
