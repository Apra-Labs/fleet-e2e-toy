import { requireFlag, optionalFlag } from "../../src/cli/validate";
import { CliError } from "../../src/cli/types";

describe("requireFlag", () => {
  it("returns the trimmed value when flag is present", () => {
    const result = requireFlag({ title: "My Note" }, "title");
    expect(result).toBe("My Note");
  });

  it("trims whitespace from value", () => {
    const result = requireFlag({ title: "  hello  " }, "title");
    expect(result).toBe("hello");
  });

  it("throws CliError when flag is missing", () => {
    expect(() => requireFlag({}, "title")).toThrow(CliError);
  });

  it("throws CliError with message naming the flag when missing", () => {
    expect(() => requireFlag({}, "title")).toThrow("--title is required and cannot be empty");
  });

  it("throws CliError when flag is whitespace-only", () => {
    expect(() => requireFlag({ title: "   " }, "title")).toThrow(CliError);
  });

  it("throws CliError with message naming the flag when whitespace-only", () => {
    expect(() => requireFlag({ title: "   " }, "title")).toThrow("--title is required and cannot be empty");
  });

  it("throws CliError when flag is boolean true (no value)", () => {
    expect(() => requireFlag({ title: true }, "title")).toThrow(CliError);
  });

  it("names the offending flag in the error message", () => {
    expect(() => requireFlag({}, "content")).toThrow("--content is required and cannot be empty");
  });
});

describe("optionalFlag", () => {
  it("returns trimmed value when flag is present", () => {
    expect(optionalFlag({ q: "search term" }, "q")).toBe("search term");
  });

  it("returns undefined when flag is missing", () => {
    expect(optionalFlag({}, "q")).toBeUndefined();
  });

  it("returns undefined when flag is whitespace-only", () => {
    expect(optionalFlag({ q: "   " }, "q")).toBeUndefined();
  });

  it("returns undefined when flag is boolean true", () => {
    expect(optionalFlag({ q: true }, "q")).toBeUndefined();
  });
});
